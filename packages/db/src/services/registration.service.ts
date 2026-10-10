import { db } from '../prisma-client';

/**
 * Whether a *new* user may be created right now.
 *
 * FORK (Openpanel RU): public registration has been removed entirely.
 * Accounts are provisioned by the administrator directly in the database:
 *
 *   docker compose exec op-api node apps/api/scripts/create-user.mjs <email> <password>
 *
 * This always returns `false`, which blocks:
 *   - the `signUpEmail` mutation,
 *   - first-user creation through the UI,
 *   - new-user creation through the OAuth callbacks.
 * Existing users (created via the script) can always sign in.
 */
export async function getIsRegistrationAllowed(_inviteId?: string | null) {
  void _inviteId;
  return false;
}

/**
 * Kept for the (unused) self-hosting env contract; always `false` in this
 * fork because registration no longer exists.
 */
export function isRegistrationFlagEnabled() {
  return false;
}
