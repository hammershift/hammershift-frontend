const store = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(req: Request): string {
  const forwarded = (req.headers as any).get?.('x-forwarded-for') ?? '';
  return (forwarded ? forwarded.split(',')[0].trim() : 'unknown');
}

export function checkRateLimit(
  ip: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true, retryAfter: 0 };
}
