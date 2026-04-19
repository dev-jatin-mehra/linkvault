import { createRemoteJWKSet, jwtVerify } from "jose";

const AUTH_ERROR = { error: "Unauthorized" };

const getSupabaseUrl = () => {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
};

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim();
};

const getJwks = () => {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return null;

  const jwksUrl = new URL("/auth/v1/.well-known/jwks.json", supabaseUrl);
  return createRemoteJWKSet(jwksUrl);
};

const JWKS = getJwks();

const buildIssuerCandidates = () => {
  const base = getSupabaseUrl().replace(/\/$/, "");
  if (!base) return [];

  return [`${base}/auth/v1`, `${base}/auth/v1/`, base, `${base}/`];
};

export const requireAuth = () => {
  return async (req, res, next) => {
    try {
      const token = getBearerToken(req);
      if (!token) {
        return res.status(401).json(AUTH_ERROR);
      }

      if (!JWKS) {
        return res.status(500).json({
          error: "SUPABASE_URL is missing on the server.",
        });
      }

      const issuerCandidates = buildIssuerCandidates();
      let payload = null;

      for (const issuer of issuerCandidates) {
        try {
          const verified = await jwtVerify(token, JWKS, { issuer });
          payload = verified.payload;
          break;
        } catch {
          // Try the next candidate issuer before returning unauthorized.
        }
      }

      if (!payload) {
        return res.status(401).json(AUTH_ERROR);
      }

      if (!payload?.sub) {
        return res.status(401).json(AUTH_ERROR);
      }

      req.auth = () => ({ userId: payload.sub, claims: payload });
      next();
    } catch {
      return res.status(401).json(AUTH_ERROR);
    }
  };
};
