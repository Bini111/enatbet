import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@enatbet.app";
const FROM_EMAIL = "Enatbet <onboarding@resend.dev>";

interface HostApplicationData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  country: string;
  city: string;
  propertyType: string;
  message?: string;
  userId?: string;
  status: string;
  source: string;
}

async function sendEmail(payload: { from: string; to: string[]; subject: string; html: string }): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return false;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error("Resend error:", await response.text());
      return false;
    }
    console.log("Email sent:", (await response.json()).id);
    return true;
  } catch (error) {
    console.error("Email failed:", error);
    return false;
  }
}

export const onHostApplicationCreated = functions.firestore
  .document("hostApplications/{applicationId}")
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data() as HostApplicationData;
    const applicationId = context.params.applicationId;
    const applicantEmailSent = await sendEmail({
      from: FROM_EMAIL,
      to: [data.email],
      subject: "Your Enatbet Host Application Received!",
      html: "<div>Hi " + data.fullName + ", your application was received!</div>",
    });
    const adminEmailSent = await sendEmail({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: "New Host Application: " + data.fullName,
      html: "<div>New application from " + data.fullName + " - " + data.email + "</div>",
    });
    await snapshot.ref.update({
      emailNotifications: { applicantEmailSent, adminEmailSent, sentAt: admin.firestore.FieldValue.serverTimestamp() },
    });
    return { applicantEmailSent, adminEmailSent };
  });

export const onHostApplicationStatusChanged = functions.firestore
  .document("hostApplications/{applicationId}")
  .onUpdate(async (change): Promise<null> => {
    const before = change.before.data() as HostApplicationData;
    const after = change.after.data() as HostApplicationData;
    if (before.status === after.status) return null;
    if (after.status !== "approved" && after.status !== "rejected") return null;
    const subject = after.status === "approved" ? "Your Enatbet Application is Approved!" : "Update on Your Application";
    const msg = after.status === "approved" ? "You can now create listings." : "Contact us for more info.";
    await sendEmail({
      from: FROM_EMAIL,
      to: [after.email],
      subject: subject,
      html: "<div>Hi " + after.fullName + ", " + msg + "</div>",
    });
    return null;
  });
