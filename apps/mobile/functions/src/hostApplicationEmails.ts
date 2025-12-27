import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Use environment variables (new method)
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
      subject: "🏠 Your Enatbet Host Application Received!",
      html: `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, sans-serif; background: #f3f4f6; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #6366F1, #4F46E5); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: #fff; margin: 0;">🇪🇹 Enatbet 🇪🇷</h1>
  </div>
  <div style="background: #fff; padding: 32px; border-radius: 0 0 16px 16px;">
    <h2 style="color: #111827;">Application Received! 🎉</h2>
    <p style="color: #4B5563;">Hi <strong>${data.fullName}</strong>,</p>
    <p style="color: #4B5563;">Thank you for applying to become an Enatbet host! We're excited to welcome you to our community.</p>
    <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 4px 0; color: #374151;"><strong>Location:</strong> ${data.city}, ${data.country}</p>
      <p style="margin: 4px 0; color: #374151;"><strong>Property:</strong> ${data.propertyType}</p>
      <p style="margin: 4px 0; color: #F59E0B;"><strong>Status:</strong> Under Review</p>
    </div>
    <p style="color: #4B5563;">Our team will review your application within 2-3 business days.</p>
    <p style="color: #4B5563;">Welcome to the Enatbet community!<br><strong>The Enatbet Team</strong></p>
  </div>
</div>
</body></html>`,
    });

    const adminEmailSent = await sendEmail({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `📋 New Host Application: ${data.fullName}`,
      html: `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, sans-serif; background: #f3f4f6; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto;">
  <div style="background: #111827; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: #fff; margin: 0; font-size: 20px;">📋 New Host Application</h1>
  </div>
  <div style="background: #fff; padding: 24px; border-radius: 0 0 16px 16px;">
    <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 12px; color: #374151; font-size: 12px; text-transform: uppercase;">Applicant</h3>
      <p style="margin: 4px 0;"><strong>Name:</strong> ${data.fullName}</p>
      <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
      <p style="margin: 4px 0;"><strong>Phone:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
      ${data.dateOfBirth ? `<p style="margin: 4px 0;"><strong>DOB:</strong> ${data.dateOfBirth}</p>` : ""}
    </div>
    <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 12px; color: #374151; font-size: 12px; text-transform: uppercase;">Property</h3>
      <p style="margin: 4px 0;"><strong>Location:</strong> ${data.city}, ${data.country}</p>
      <p style="margin: 4px 0;"><strong>Type:</strong> ${data.propertyType}</p>
      <p style="margin: 4px 0;"><strong>Source:</strong> ${data.source}</p>
    </div>
    ${data.message ? `<div style="background: #FEF3C7; padding: 16px; border-radius: 8px; margin-bottom: 16px;"><h3 style="margin: 0 0 8px; color: #92400E; font-size: 12px;">MESSAGE</h3><p style="color: #78350F; margin: 0;">${data.message}</p></div>` : ""}
    <div style="text-align: center;">
      <a href="https://console.firebase.google.com/project/enatbet-906c4/firestore/data/~2FhostApplications~2F${applicationId}" style="display: inline-block; background: #6366F1; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Review in Firebase</a>
    </div>
  </div>
</div>
</body></html>`,
    });

    await snapshot.ref.update({
      emailNotifications: { applicantEmailSent, adminEmailSent, sentAt: admin.firestore.FieldValue.serverTimestamp() },
    });
  });

export const onHostApplicationStatusChanged = functions.firestore
  .document("hostApplications/{applicationId}")
  .onUpdate(async (change) => {
    const before = change.before.data() as HostApplicationData;
    const after = change.after.data() as HostApplicationData;
    if (before.status === after.status) return null;

    let subject = "", message = "", color = "";
    if (after.status === "approved") {
      subject = "🎉 Your Enatbet Host Application is Approved!";
      message = "Great news! Your application has been approved. You can now create your first listing.";
      color = "#10B981";
    } else if (after.status === "rejected") {
      subject = "Update on Your Enatbet Host Application";
      message = "We're unable to approve your application at this time. Please contact us for more information.";
      color = "#EF4444";
    } else return null;

    await sendEmail({
      from: FROM_EMAIL,
      to: [after.email],
      subject,
      html: `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, sans-serif; background: #f3f4f6; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #6366F1, #4F46E5); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: #fff; margin: 0;">🇪🇹 Enatbet 🇪🇷</h1>
  </div>
  <div style="background: #fff; padding: 32px; border-radius: 0 0 16px 16px;">
    <p style="color: #4B5563;">Hi <strong>${after.fullName}</strong>,</p>
    <div style="background: #F9FAFB; border-left: 4px solid ${color}; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-weight: 600;">Status: <span style="color: ${color};">${after.status.charAt(0).toUpperCase() + after.status.slice(1)}</span></p>
    </div>
    <p style="color: #4B5563;">${message}</p>
    ${after.status === "approved" ? `<div style="text-align: center; margin-top: 24px;"><a href="https://enatbet.app/dashboard/host" style="display: inline-block; background: #6366F1; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Create Your First Listing</a></div>` : ""}
    <p style="color: #4B5563; margin-top: 24px;">Best regards,<br><strong>The Enatbet Team</strong></p>
  </div>
</div>
</body></html>`,
    });
  });
