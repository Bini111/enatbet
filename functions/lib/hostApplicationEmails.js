"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onHostApplicationStatusChanged = exports.onHostApplicationCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp();
}
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@enatbet.app";
const FROM_EMAIL = "Enatbet <onboarding@resend.dev>";
async function sendEmail(to, subject, html) {
    if (!RESEND_API_KEY)
        return false;
    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
        });
        return res.ok;
    }
    catch (e) {
        return false;
    }
}
exports.onHostApplicationCreated = functions.firestore
    .document("hostApplications/{applicationId}")
    .onCreate(async (snapshot) => {
    const d = snapshot.data();
    await sendEmail([d.email], "Application Received!", "<p>Hi " + d.fullName + ", we got your application!</p>");
    await sendEmail([ADMIN_EMAIL], "New Application: " + d.fullName, "<p>From: " + d.email + "</p>");
    return null;
});
exports.onHostApplicationStatusChanged = functions.firestore
    .document("hostApplications/{applicationId}")
    .onUpdate(async (change) => {
    const b = change.before.data();
    const a = change.after.data();
    if (b.status === a.status)
        return null;
    if (a.status === "approved") {
        await sendEmail([a.email], "Approved!", "<p>Hi " + a.fullName + ", you are approved!</p>");
    }
    return null;
});
//# sourceMappingURL=hostApplicationEmails.js.map