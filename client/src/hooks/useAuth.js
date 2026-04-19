import { useCallback, useMemo } from "react";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";

export function AuthProvider({ children }) {
  return children;
}

export function useAuth() {
  const clerkAuth = useClerkAuth();

  const getToken = useCallback(async () => {
    return await clerkAuth.getToken();
  }, [clerkAuth.getToken]);

  const signOut = useCallback(async () => {
    await clerkAuth.signOut();
  }, [clerkAuth.signOut]);

  // Map Clerk auth to expected interface
  return useMemo(
    () => ({
      isLoaded: clerkAuth.isLoaded,
      isSignedIn: clerkAuth.isSignedIn,
      session: null,
      user: clerkAuth.user || null,
      getToken,
      signIn: async () => {
        throw new Error("Use Clerk SignInButton instead");
      },
      signUp: async () => {
        throw new Error("Use Clerk SignUpButton instead");
      },
      signOut,
    }),
    [
      clerkAuth.isLoaded,
      clerkAuth.isSignedIn,
      clerkAuth.user,
      getToken,
      signOut,
    ],
  );
}
