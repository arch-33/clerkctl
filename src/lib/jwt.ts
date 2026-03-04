export function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT: expected 3 parts separated by dots.');
  }
  const payload = parts[1];
  if (!payload) {
    throw new Error('Invalid JWT: missing payload.');
  }
  // base64url → base64 → JSON
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = Buffer.from(base64, 'base64').toString('utf8');
  return JSON.parse(json) as Record<string, unknown>;
}
