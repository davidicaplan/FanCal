import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

let supabase: SupabaseClient;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
      },
    });
  }
  return supabase;
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
      secure: process.env.NODE_ENV === "production",
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

  // Initialize Supabase client
  getSupabaseClient();

  // Login route - redirects to Supabase OAuth
  app.get("/api/login", async (req, res) => {
    try {
      const supabase = getSupabaseClient();
      const redirectTo = `${req.protocol}://${req.get("host")}/api/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error("OAuth error:", error);
        return res.status(500).json({ error: "Failed to initiate login" });
      }

      if (data.url) {
        res.redirect(data.url);
      } else {
        res.status(500).json({ error: "No redirect URL provided" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to initiate login" });
    }
  });

  // OAuth callback route
  app.get("/api/callback", async (req, res) => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== "string") {
        return res.redirect("/?error=no_code");
      }

      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Session exchange error:", error);
        return res.redirect("/?error=auth_failed");
      }

      if (data.user) {
        await upsertUser(data.user);

        // Store user info in session
        (req.session as any).user = {
          id: data.user.id,
          email: data.user.email,
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_at: data.session?.expires_at,
        };
      }

      res.redirect("/");
    } catch (error) {
      console.error("Callback error:", error);
      res.redirect("/?error=callback_failed");
    }
  });

  // Logout route
  app.get("/api/logout", async (req, res) => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();

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
