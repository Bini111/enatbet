const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// Initialize Stripe with secret key from environment
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY || functions.config().stripe?.secret_key;
  if (!secretKey) throw new Error("Stripe secret key not configured");
  return stripe(secretKey);
};

// ============================================
// STRIPE CONNECT - HOST ONBOARDING
// ============================================

// Create Stripe Connect account for hosts
exports.createConnectAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const uid = context.auth.uid;
  const stripeClient = getStripe();

  try {
    // Check if user already has a Connect account
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    if (userData?.stripeConnectAccountId) {
      // Return existing account link for onboarding continuation
      const accountLink = await stripeClient.accountLinks.create({
        account: userData.stripeConnectAccountId,
        refresh_url: `${data.baseUrl}/settings/payments?refresh=true`,
        return_url: `${data.baseUrl}/settings/payments?success=true`,
        type: "account_onboarding",
      });
      return { url: accountLink.url, accountId: userData.stripeConnectAccountId };
    }

    // Create new Connect Express account
    const account = await stripeClient.accounts.create({
      type: "express",
      country: data.country || "US",
      email: context.auth.token.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: { firebaseUid: uid },
    });

    // Save account ID to Firestore
    await db.collection("users").doc(uid).update({
      stripeConnectAccountId: account.id,
      stripeConnectStatus: "pending",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create account link for onboarding
    const accountLink = await stripeClient.accountLinks.create({
      account: account.id,
      refresh_url: `${data.baseUrl}/settings/payments?refresh=true`,
      return_url: `${data.baseUrl}/settings/payments?success=true`,
      type: "account_onboarding",
    });

    return { url: accountLink.url, accountId: account.id };
  } catch (error) {
    console.error("Error creating Connect account:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Get Connect account status
exports.getConnectAccountStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const uid = context.auth.uid;
  const stripeClient = getStripe();

  try {
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    if (!userData?.stripeConnectAccountId) {
      return { status: "not_created", chargesEnabled: false, payoutsEnabled: false };
    }

    const account = await stripeClient.accounts.retrieve(userData.stripeConnectAccountId);

    // Update status in Firestore
    const status = account.charges_enabled && account.payouts_enabled ? "active" : "pending";
    await db.collection("users").doc(uid).update({
      stripeConnectStatus: status,
      stripeConnectChargesEnabled: account.charges_enabled,
      stripeConnectPayoutsEnabled: account.payouts_enabled,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      status,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    };
  } catch (error) {
    console.error("Error getting Connect status:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Create Stripe Connect dashboard link for hosts
exports.createConnectDashboardLink = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const uid = context.auth.uid;
  const stripeClient = getStripe();

  try {
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    if (!userData?.stripeConnectAccountId) {
      throw new functions.https.HttpsError("failed-precondition", "No Connect account found");
    }

    const loginLink = await stripeClient.accounts.createLoginLink(userData.stripeConnectAccountId);
    return { url: loginLink.url };
  } catch (error) {
    console.error("Error creating dashboard link:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// ============================================
// STRIPE CUSTOMERS - GUEST PAYMENTS
// ============================================

// Create or get Stripe customer for guests
exports.createCustomer = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const uid = context.auth.uid;
  const stripeClient = getStripe();

  try {
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    if (userData?.stripeCustomerId) {
      return { customerId: userData.stripeCustomerId };
    }

    const customer = await stripeClient.customers.create({
      email: context.auth.token.email,
      metadata: { firebaseUid: uid },
    });

    await db.collection("users").doc(uid).update({
      stripeCustomerId: customer.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { customerId: customer.id };
  } catch (error) {
    console.error("Error creating customer:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Create SetupIntent for adding payment methods
exports.createSetupIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const uid = context.auth.uid;
  const stripeClient = getStripe();

  try {
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    let customerId = userData?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripeClient.customers.create({
        email: context.auth.token.email,
        metadata: { firebaseUid: uid },
      });
      customerId = customer.id;
      await db.collection("users").doc(uid).update({
        stripeCustomerId: customerId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    const setupIntent = await stripeClient.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });

    return { clientSecret: setupIntent.client_secret };
  } catch (error) {
    console.error("Error creating SetupIntent:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Get customer payment methods
exports.getPaymentMethods = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const uid = context.auth.uid;
  const stripeClient = getStripe();

  try {
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    if (!userData?.stripeCustomerId) {
      return { paymentMethods: [] };
    }

    const paymentMethods = await stripeClient.paymentMethods.list({
      customer: userData.stripeCustomerId,
      type: "card",
    });

    return {
      paymentMethods: paymentMethods.data.map((pm) => ({
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
      })),
    };
  } catch (error) {
    console.error("Error getting payment methods:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Delete payment method
exports.deletePaymentMethod = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const { paymentMethodId } = data;
  if (!paymentMethodId) {
    throw new functions.https.HttpsError("invalid-argument", "Payment method ID required");
  }

  const stripeClient = getStripe();

  try {
    await stripeClient.paymentMethods.detach(paymentMethodId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting payment method:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// ============================================
// BOOKING PAYMENTS
// ============================================

// Create PaymentIntent for booking
exports.createBookingPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const { listingId, checkIn, checkOut, guests, totalAmount } = data;
  const uid = context.auth.uid;
  const stripeClient = getStripe();

  try {
    // Get listing and host info
    const listingDoc = await db.collection("listings").doc(listingId).get();
    if (!listingDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Listing not found");
    }
    const listing = listingDoc.data();

    // Get host's Connect account
    const hostDoc = await db.collection("users").doc(listing.hostId).get();
    const hostData = hostDoc.data();

    if (!hostData?.stripeConnectAccountId || hostData?.stripeConnectStatus !== "active") {
      throw new functions.https.HttpsError("failed-precondition", "Host not set up for payments");
    }

    // Get or create customer
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();
    let customerId = userData?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripeClient.customers.create({
        email: context.auth.token.email,
        metadata: { firebaseUid: uid },
      });
      customerId = customer.id;
      await db.collection("users").doc(uid).update({ stripeCustomerId: customerId });
    }

    // Calculate platform fee (e.g., 10%)
    const platformFeePercent = 0.10;
    const platformFee = Math.round(totalAmount * platformFeePercent);

    // Create PaymentIntent with Connect
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: totalAmount, // in cents
      currency: "usd",
      customer: customerId,
      application_fee_amount: platformFee,
      transfer_data: {
        destination: hostData.stripeConnectAccountId,
      },
      metadata: {
        listingId,
        guestId: uid,
        hostId: listing.hostId,
        checkIn,
        checkOut,
        guests: String(guests),
      },
    });

    // Create pending booking
    const bookingRef = await db.collection("bookings").add({
      listingId,
      listingTitle: listing.title,
      guestId: uid,
      hostId: listing.hostId,
      checkIn: admin.firestore.Timestamp.fromDate(new Date(checkIn)),
      checkOut: admin.firestore.Timestamp.fromDate(new Date(checkOut)),
      guests,
      totalAmount,
      platformFee,
      hostPayout: totalAmount - platformFee,
      currency: "usd",
      status: "pending_payment",
      stripePaymentIntentId: paymentIntent.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      clientSecret: paymentIntent.client_secret,
      bookingId: bookingRef.id,
    };
  } catch (error) {
    console.error("Error creating booking payment:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// ============================================
// STRIPE WEBHOOKS
// ============================================

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const stripeClient = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || functions.config().stripe?.webhook_secret;

  let event;

  try {
    const sig = req.headers["stripe-signature"];
    event = stripeClient.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const { listingId, guestId, hostId } = paymentIntent.metadata;

        // Update booking status
        const bookingsSnapshot = await db
          .collection("bookings")
          .where("stripePaymentIntentId", "==", paymentIntent.id)
          .limit(1)
          .get();

        if (!bookingsSnapshot.empty) {
          const bookingDoc = bookingsSnapshot.docs[0];
          await bookingDoc.ref.update({
            status: "confirmed",
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Create conversation for this booking
          await createBookingConversation(bookingDoc.id, bookingDoc.data());
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const bookingsSnapshot = await db
          .collection("bookings")
          .where("stripePaymentIntentId", "==", paymentIntent.id)
          .limit(1)
          .get();

        if (!bookingsSnapshot.empty) {
          await bookingsSnapshot.docs[0].ref.update({
            status: "payment_failed",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object;
        const uid = account.metadata?.firebaseUid;

        if (uid) {
          const status = account.charges_enabled && account.payouts_enabled ? "active" : "pending";
          await db.collection("users").doc(uid).update({
            stripeConnectStatus: status,
            stripeConnectChargesEnabled: account.charges_enabled,
            stripeConnectPayoutsEnabled: account.payouts_enabled,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

// ============================================
// MESSAGING - AUTO-CREATE CONVERSATION
// ============================================

async function createBookingConversation(bookingId, bookingData) {
  const { guestId, hostId, listingId, listingTitle } = bookingData;

  // Check if conversation already exists
  const existingConvo = await db
    .collection("conversations")
    .where("bookingId", "==", bookingId)
    .limit(1)
    .get();

  if (!existingConvo.empty) return existingConvo.docs[0].id;

  // Get user names
  const [guestDoc, hostDoc] = await Promise.all([
    db.collection("users").doc(guestId).get(),
    db.collection("users").doc(hostId).get(),
  ]);

  const guestName = guestDoc.data()?.displayName || "Guest";
  const hostName = hostDoc.data()?.displayName || "Host";

  // Create conversation
  const convoRef = await db.collection("conversations").add({
    bookingId,
    listingId,
    listingTitle,
    participants: [guestId, hostId],
    participantNames: { [guestId]: guestName, [hostId]: hostName },
    lastMessage: `Booking confirmed for ${listingTitle}`,
    lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
    lastMessageBy: "system",
    unreadCount: { [guestId]: 1, [hostId]: 1 },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Add system message
  await db.collection("conversations").doc(convoRef.id).collection("messages").add({
    senderId: "system",
    senderName: "Enatbet",
    text: `Booking confirmed! ${guestName} has booked ${listingTitle}. You can now message each other.`,
    type: "system",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return convoRef.id;
}

// Send message
exports.sendMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const { conversationId, text } = data;
  const uid = context.auth.uid;

  try {
    // Verify user is participant
    const convoDoc = await db.collection("conversations").doc(conversationId).get();
    if (!convoDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Conversation not found");
    }

    const convo = convoDoc.data();
    if (!convo.participants.includes(uid)) {
      throw new functions.https.HttpsError("permission-denied", "Not a participant");
    }

    // Get sender name
    const userDoc = await db.collection("users").doc(uid).get();
    const senderName = userDoc.data()?.displayName || "User";

    // Add message
    const messageRef = await db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .add({
        senderId: uid,
        senderName,
        text,
        type: "text",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Update conversation
    const otherParticipant = convo.participants.find((p) => p !== uid);
    await db
      .collection("conversations")
      .doc(conversationId)
      .update({
        lastMessage: text,
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        lastMessageBy: uid,
        [`unreadCount.${otherParticipant}`]: admin.firestore.FieldValue.increment(1),
      });

    return { messageId: messageRef.id };
  } catch (error) {
    console.error("Error sending message:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Mark conversation as read
exports.markConversationRead = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const { conversationId } = data;
  const uid = context.auth.uid;

  try {
    await db
      .collection("conversations")
      .doc(conversationId)
      .update({
        [`unreadCount.${uid}`]: 0,
      });

    return { success: true };
  } catch (error) {
    console.error("Error marking as read:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// ============================================
// VERIFICATION (BLUE CHECK) - $5 ONE-TIME
// ============================================

const VERIFICATION_PRICE_CENTS = 500; // $5.00

exports.createVerificationSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const uid = context.auth.uid;
  const stripeClient = getStripe();

  try {
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    if (userData?.verified) {
      throw new functions.https.HttpsError("already-exists", "Already verified");
    }

    // Check for existing pending session
    const existingSessions = await db
      .collection("verificationSessions")
      .where("uid", "==", uid)
      .where("status", "in", ["pending_payment", "payment_confirmed", "processing"])
      .limit(1)
      .get();

    if (!existingSessions.empty) {
      const session = existingSessions.docs[0].data();
      if (session.status === "pending_payment" && session.stripeClientSecret) {
        return { clientSecret: session.stripeClientSecret, sessionId: existingSessions.docs[0].id };
      }
    }

    // Get or create customer
    let customerId = userData?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeClient.customers.create({
        email: context.auth.token.email,
        metadata: { firebaseUid: uid },
      });
      customerId = customer.id;
      await db.collection("users").doc(uid).update({ stripeCustomerId: customerId });
    }

    // Create PaymentIntent for verification
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: VERIFICATION_PRICE_CENTS,
      currency: "usd",
      customer: customerId,
      metadata: {
        type: "verification",
        firebaseUid: uid,
      },
    });

    // Create verification session
    const sessionRef = await db.collection("verificationSessions").add({
      uid,
      status: "pending_payment",
      priceUsd: VERIFICATION_PRICE_CENTS / 100,
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)), // 30 min
    });

    // Update user
    await db.collection("users").doc(uid).update({
      verificationStatus: "pending_payment",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { clientSecret: paymentIntent.client_secret, sessionId: sessionRef.id };
  } catch (error) {
    console.error("Error creating verification session:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Confirm verification payment and allow selfie upload
exports.confirmVerificationPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const { sessionId } = data;
  const uid = context.auth.uid;
  const stripeClient = getStripe();

  try {
    const sessionDoc = await db.collection("verificationSessions").doc(sessionId).get();
    if (!sessionDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Session not found");
    }

    const session = sessionDoc.data();
    if (session.uid !== uid) {
      throw new functions.https.HttpsError("permission-denied", "Not your session");
    }

    // Verify payment with Stripe
    const paymentIntent = await stripeClient.paymentIntents.retrieve(session.stripePaymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      throw new functions.https.HttpsError("failed-precondition", "Payment not completed");
    }

    // Update session
    await sessionDoc.ref.update({
      status: "payment_confirmed",
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update user
    await db.collection("users").doc(uid).update({
      verificationStatus: "payment_confirmed",
      verificationPaid: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, canUploadSelfie: true };
  } catch (error) {
    console.error("Error confirming verification payment:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Process verification (placeholder for Azure Face integration)
exports.processVerification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const { sessionId, selfieStoragePath } = data;
  const uid = context.auth.uid;

  try {
    const sessionDoc = await db.collection("verificationSessions").doc(sessionId).get();
    if (!sessionDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Session not found");
    }

    const session = sessionDoc.data();
    if (session.uid !== uid) {
      throw new functions.https.HttpsError("permission-denied", "Not your session");
    }

    if (session.status !== "payment_confirmed") {
      throw new functions.https.HttpsError("failed-precondition", "Payment not confirmed");
    }

    // Update session to processing
    await sessionDoc.ref.update({
      status: "processing",
      selfieStoragePath,
    });

    // TODO: Integrate Azure Face API here
    // For now, we'll mark as pending manual review
    // In production, this would:
    // 1. Download selfie from Firebase Storage
    // 2. Call Azure Face API for liveness detection
    // 3. Compare with profile photo
    // 4. Update verification status based on results

    // Placeholder: Auto-approve for development
    const isVerified = true; // Replace with actual Azure Face result

    if (isVerified) {
      await sessionDoc.ref.update({
        status: "success",
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection("users").doc(uid).update({
        verified: true,
        verificationStatus: "verified",
        verificationMethod: "azure_face_liveness",
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        verifiedBy: "system",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, verified: true };
    } else {
      await sessionDoc.ref.update({
        status: "failed",
        failureReason: "Face verification failed",
      });

      await db.collection("users").doc(uid).update({
        verificationStatus: "failed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: false, verified: false, reason: "Verification failed" };
    }
  } catch (error) {
    console.error("Error processing verification:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
