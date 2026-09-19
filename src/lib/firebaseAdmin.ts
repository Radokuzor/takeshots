import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const APP_NAME = "takeshots-admin";

/**
 * Server-only Firestore client. Unlike `src/lib/firebase.ts` (the client SDK,
 * which is subject to firestore.rules even when it runs on the server), this
 * one authenticates with a service account and bypasses rules — so the
 * analytics_sessions collection can stay closed to the public.
 *
 * Needs FIREBASE_SERVICE_ACCOUNT_KEY: the JSON service-account key from
 * Firebase console → Project settings → Service accounts → Generate new
 * private key, pasted as a single-line JSON string.
 */
export function adminDb() {
  const app = getApps().find((a) => a.name === APP_NAME)
    ? getApp(APP_NAME)
    : initializeApp(
        {
          credential: cert(JSON.parse(serviceAccountKey())),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        },
        APP_NAME
      );

  const db = getFirestore(app);
  // Analytics payloads are sparse — skip undefined fields instead of throwing.
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // settings() throws if the instance has already been used — fine, it's set
  }
  return db;
}

function serviceAccountKey() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set — analytics can't read or write Firestore."
    );
  }
  // Tolerate a base64-encoded key, which avoids newline mangling in some hosts.
  return raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
}

export const ANALYTICS_COLLECTION = "analytics_sessions";
