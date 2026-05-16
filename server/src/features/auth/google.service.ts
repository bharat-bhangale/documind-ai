import { OAuth2Client, TokenPayload } from "google-auth-library";

import { config } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

const googleClient = new OAuth2Client(config.googleClientId || undefined);

type CredentialVerifier = (credential: string) => Promise<TokenPayload | undefined>;

let credentialVerifier: CredentialVerifier = verifyCredentialWithGoogle;

async function verifyCredentialWithGoogle(credential: string): Promise<TokenPayload | undefined> {
  if (!config.googleClientId) {
    throw new AppError("Google login is not configured.", 503);
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: config.googleClientId
  });

  return ticket.getPayload();
}

export async function verifyGoogleCredential(credential: string): Promise<TokenPayload> {
  const payload = await credentialVerifier(credential);

  if (!payload?.sub || !payload?.email || payload.email_verified !== true) {
    throw new AppError("Google account email could not be verified.", 401);
  }

  return payload;
}

export function setGoogleCredentialVerifierForTests(verifier: CredentialVerifier): void {
  credentialVerifier = verifier;
}

export function resetGoogleCredentialVerifierForTests(): void {
  credentialVerifier = verifyCredentialWithGoogle;
}
