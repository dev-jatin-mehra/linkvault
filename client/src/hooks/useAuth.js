import { createContext, createElement } from "react";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  return createElement(AuthContext.Provider, { value: {} }, children);
}

export function useAuth() {
  const clerkAuth = useClerkAuth();

  // Map Clerk auth to expected interface
  return {
    isLoaded: clerkAuth.isLoaded,
    isSignedIn: clerkAuth.isSignedIn,
    session: null,
    user: clerkAuth.user || null,
    getToken: async () => {
      return await clerkAuth.getToken();
    },
    signIn: async () => {
      throw new Error("Use Clerk SignInButton instead");
    },
    signUp: async () => {
      throw new Error("Use Clerk SignUpButton instead");
    },
    signOut: async () => {
      await clerkAuth.signOut();
    },
  };
}
