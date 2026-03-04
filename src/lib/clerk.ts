const CLERK_API = 'https://api.clerk.com/v1';

function headers(secretKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${secretKey}`,
  };
}

async function checkResponse(response: Response): Promise<void> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Clerk API error ${response.status}: ${body}`);
  }
}

export interface ClerkSession {
  object: string;
  id: string;
  user_id: string;
  client_id: string;
  status: string;
  expire_at: number;
  abandon_at: number;
}

export interface ClerkToken {
  object: string;
  jwt: string;
}

export async function createSession(secretKey: string, userId: string, activeOrganizationId: string): Promise<ClerkSession> {
  const response = await fetch(`${CLERK_API}/sessions`, {
    method: 'POST',
    headers: headers(secretKey),
    body: JSON.stringify({ user_id: userId, active_organization_id: activeOrganizationId }),
  });
  await checkResponse(response);
  return response.json() as Promise<ClerkSession>;
}

export async function createSessionToken(secretKey: string, sessionId: string, expiresInSeconds: number): Promise<ClerkToken> {
  const response = await fetch(`${CLERK_API}/sessions/${sessionId}/tokens`, {
    method: 'POST',
    headers: headers(secretKey),
    body: JSON.stringify({ expires_in_seconds: expiresInSeconds }),
  });
  await checkResponse(response);
  return response.json() as Promise<ClerkToken>;
}
