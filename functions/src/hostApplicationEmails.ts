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
  country: string;
  city: string;
  propertyType: string;
  status: string;
}

async function sendEmail(to: string[], subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export const onHostApplicationCreated = functions.firestore
  .document("hostApplications/{applicationId}")
  .onCreate(async (snapshot) => {
    const d = snapshot.data() as HostApplicationData;
    await sendEmail([d.email], "Application Received!", "<p>Hi " + d.fullName + ", we got your application!</p>");
    await sendEmail([ADMIN_EMAIL], "New Application: " + d.fullName, "<p>From: " + d.email + "</p>");
    return null;
  });

export const onHostApplicationStatusChanged = functions.firestore
  .document("hostApplications/{applicationId}")
  .onUpdate(async (change): Promise<null> => {
    const b = change.before.data() as HostApplicationData;
    const a = change.after.data() as HostApplicationData;
    if (b.status === a.status) return null;
    if (a.status === "approved") {
      await sendEmail([a.email], "Approved!", "<p>Hi " + a.fullName + ", you are approved!</p>");
    }
    return null;
  });
