import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { deleteMyAccount as deleteMyAccountApi } from "../api/api";

const AuthContext = createContext(null);

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

export function AuthProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session || null);
      setUser(data.session?.user || null);
      setIsLoaded(true);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession || null);
      setUser(nextSession?.user || null);
      setIsLoaded(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const normalizedEmail = normalizeEmail(email);

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email, password, fullName = "") => {
    const normalizedEmail = normalizeEmail(email);

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          name: fullName.trim(),
        },
      },
    });

    const errorMessage = String(error?.message || "").toLowerCase();
    if (error) {
      if (errorMessage.includes("already") || errorMessage.includes("exists")) {
        throw new Error(
          "An account with this email already exists. Please sign in.",
        );
      }

      throw error;
    }

    // Supabase may return an obfuscated user object for existing users.
    if (
      Array.isArray(data?.user?.identities) &&
      data.user.identities.length === 0
    ) {
      throw new Error(
        "An account with this email already exists. Please sign in.",
      );
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const deleteAccount = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      throw new Error("You must be signed in to delete your account.");
    }

    let deletionError = null;

    try {
      await deleteMyAccountApi(token);
    } catch (error) {
      deletionError = error;
    }

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError && !deletionError) {
      deletionError = signOutError;
    }

    if (deletionError) {
      throw deletionError;
    }
  }, [getToken]);

  const requestPasswordReset = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const email = data.session?.user?.email || user?.email;

    if (!email) {
      throw new Error("No email found for the current account.");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) throw error;
  }, [user]);

  const value = useMemo(
    () => ({
      isLoaded,
      isSignedIn: Boolean(session),
      session,
      user,
      getToken,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      deleteAccount,
      requestPasswordReset,
    }),
    [
      deleteAccount,
      getToken,
      isLoaded,
      requestPasswordReset,
      session,
      signIn,
      signInWithGoogle,
      signOut,
      signUp,
      user,
    ],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
