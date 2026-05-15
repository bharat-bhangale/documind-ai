import { OAuth2Client } from "google-auth-library";

import { config } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

const googleClient = new OAuth2Client(config.googleClientId || undefined);

let credentialVerifier = verifyCredentialWithGoogle;

async function verifyCredentialWithGoogle(credential) {
  if (!config.googleClientId) {
    throw new AppError("Google login is not configured.", 503);
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: config.googleClientId
  });

  return ticket.getPayload();
}

export async function verifyGoogleCredential(credential) {
  const payload = await credentialVerifier(credential);

  if (!payload?.sub || !payload?.email || payload.email_verified !== true) {
    throw new AppError("Google account email could not be verified.", 401);
  }

  return payload;
}

export function setGoogleCredentialVerifierForTests(verifier) {
  credentialVerifier = verifier;
}

export function resetGoogleCredentialVerifierForTests() {
  credentialVerifier = verifyCredentialWithGoogle;
}

