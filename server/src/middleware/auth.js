import { createRemoteJWKSet, jwtVerify } from "jose";

const supabaseUrl = process.env.SUPABASE_URL;
const issuer = supabaseUrl ? `${supabaseUrl}/auth/v1` : null;
const jwks = supabaseUrl
  ? createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`))
  : null;

export async function requireSupabaseAuth(req, res, next) {
  if (req.method === "OPTIONS") {
    return next();
  }

  if (!supabaseUrl || !issuer || !jwks) {
    return res.status(500).json({ error: "SUPABASE_URL is not configured" });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({ error: "missing bearer token" });
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience: "authenticated",
    });

    if (!payload?.sub) {
      return res.status(401).json({ error: "invalid token payload" });
    }

    req.userId = String(payload.sub);
    return next();
  } catch (error) {
    return res.status(401).json({ error: "invalid or expired token" });
  }
}
