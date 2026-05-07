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

export interface ClerkOrganization {
  id: string;
  name: string;
  slug: string | null;
}

export interface ClerkOrganizationMembership {
  id: string;
  role: string;
  organization: ClerkOrganization;
}

export interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

export interface ClerkUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string | null;
}

export async function listUserOrganizationMemberships(secretKey: string, userId: string): Promise<ClerkOrganizationMembership[]> {
  const response = await fetch(`${CLERK_API}/users/${userId}/organization_memberships?limit=100`, {
    headers: headers(secretKey),
  });
  await checkResponse(response);
  const data = (await response.json()) as { data: ClerkOrganizationMembership[] };
  return data.data;
}

export async function listUsers(secretKey: string, query?: string): Promise<ClerkUser[]> {
  const params = new URLSearchParams({ limit: '100', order_by: '-created_at' });
  if (query) params.set('query', query);
  const response = await fetch(`${CLERK_API}/users?${params}`, {
    headers: headers(secretKey),
  });
  await checkResponse(response);
  return response.json() as Promise<ClerkUser[]>;
}

export async function createSession(secretKey: string, userId: string, activeOrganizationId?: string): Promise<ClerkSession> {
  const body: Record<string, string> = { user_id: userId };
  if (activeOrganizationId) body['active_organization_id'] = activeOrganizationId;
  const response = await fetch(`${CLERK_API}/sessions`, {
    method: 'POST',
    headers: headers(secretKey),
    body: JSON.stringify(body),
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
