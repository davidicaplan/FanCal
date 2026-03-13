import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import crypto from "crypto";
import { authStorage } from "./storage";

let supabase: SupabaseClient;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "your-session-secret-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: !!process.env.VERCEL,
      maxAge: sessionTtl,
      sameSite: "lax",
    },
  });
}

async function upsertUser(user: any) {
  await authStorage.upsertUser({
    id: user.id,
    email: user.email,
    firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(" ")[0] || null,
    lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || null,
    profileImageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

  // Login route - constructs OAuth URL manually with PKCE
  app.get("/api/login", async (req, res) => {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Missing env vars - SUPABASE_URL:", !!supabaseUrl, "SUPABASE_ANON_KEY:", !!supabaseAnonKey);
        return res.status(500).json({ error: "Server misconfigured" });
      }

      const { verifier, challenge } = generatePKCE();

      // Store PKCE verifier in session (per-user, not singleton)
      (req.session as any).codeVerifier = verifier;

      const redirectTo = `${req.protocol}://${req.get("host")}/api/callback`;
      console.log("Login redirect_to:", redirectTo);

      const params = new URLSearchParams({
        provider: "google",
        redirect_to: redirectTo,
        code_challenge: challenge,
        code_challenge_method: "S256",
      });

      // Save session before redirecting so the cookie is set
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      const authUrl = `${supabaseUrl}/auth/v1/authorize?${params}`;
      console.log("Redirecting to:", authUrl);
      res.redirect(authUrl);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to initiate login" });
    }
  });

  // OAuth callback route
  app.get("/api/callback", async (req, res) => {
    try {
      const { code } = req.query;
      const codeVerifier = (req.session as any)?.codeVerifier;

      console.log("Callback hit - code:", !!code, "verifier:", !!codeVerifier);

      if (!code || typeof code !== "string") {
        console.log("No code in callback");
        return res.redirect("/?error=no_code");
      }

      if (!codeVerifier) {
        console.log("No code verifier in session");
        return res.redirect("/?error=no_verifier");
      }

      // Exchange code for session using Supabase REST API
      const tokenResponse = await fetch(
        `${supabaseUrl}/auth/v1/token?grant_type=pkce`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({
            auth_code: code,
            code_verifier: codeVerifier,
          }),
        }
      );

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.user) {
        console.error("Token exchange error:", tokenData);
        return res.redirect("/?error=auth_failed");
      }

      console.log("Auth success for:", tokenData.user.email);

      // Clean up verifier from session
      delete (req.session as any).codeVerifier;

      await upsertUser(tokenData.user);

      // Store user info in session
      (req.session as any).user = {
        id: tokenData.user.id,
        email: tokenData.user.email,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
      };

      // Explicitly save session before redirecting
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.redirect("/");
    } catch (error) {
      console.error("Callback error:", error);
      res.redirect("/?error=callback_failed");
    }
  });

  // Logout route
  app.get("/api/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        res.redirect("/");
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.redirect("/");
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const sessionUser = (req.session as any).user;

  if (!sessionUser || !sessionUser.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  if (sessionUser.expires_at && now > sessionUser.expires_at) {
    // Try to refresh the token
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: sessionUser.refresh_token,
      });

      if (error || !data.session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Update session with new tokens
      (req.session as any).user = {
        ...sessionUser,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      };
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }

  // Attach user to request for downstream handlers
  (req as any).user = {
    claims: {
      sub: sessionUser.id,
    },
  };

  return next();
};
