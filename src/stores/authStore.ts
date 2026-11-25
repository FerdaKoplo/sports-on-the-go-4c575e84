import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AuthFactory,
  AuthProviderPayload,
  resolvePostAuthDestination,
  SignUpCredentials,
} from "@/constants/factory/auth-factory";

export interface SignUpData {
  username: string;
  dateOfBirth: string;
}

type NavigateFn = (to: string, options?: { replace?: boolean }) => void;

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  callbackRedirectTo: string | null;
  authenticate: (
    payload: AuthProviderPayload,
    navigate?: NavigateFn,
  ) => Promise<void>;
  signIn: (
    email: string,
    password: string,
    navigate?: NavigateFn,
  ) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData: Omit<SignUpCredentials, "email" | "password">,
    navigate?: NavigateFn,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: (navigate?: NavigateFn) => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => {
  const syncSessionState = async (session: Session | null) => {
    const user = session?.user ?? null;

    const callbackRedirectTo =
      window.location.pathname === "/auth-callback"
        ? await resolvePostAuthDestination(user, { checkTermsMetadata: true })
        : null;

    set({
      session,
      user,
      loading: false,
      callbackRedirectTo,
    });
  };

  supabase.auth.onAuthStateChange((_event, session) => {
    void syncSessionState(session);
  });

  supabase.auth.getSession().then(({ data: { session } }) => {
    void syncSessionState(session);
  });

  return {
    user: null,
    session: null,
    loading: true,
    callbackRedirectTo: null,
    authenticate: async (payload, navigate) => {
      try {
        const strategy = AuthFactory.create(payload);
        const { redirectTo } = await strategy.execute();

        if (redirectTo) {
          if (navigate) {
            navigate(redirectTo, { replace: true });
          } else {
            window.location.assign(redirectTo);
          }
        }
      } catch (error) {
        console.error(`Auth error (${payload.type}):`, error);
        const fallbackMessages: Record<AuthProviderPayload["type"], string> = {
          signin: "Failed to sign in. Please try again.",
          signup: "Failed to create account. Please try again.",
          google: "Failed to sign in with Google. Please try again.",
        };
        toast.error(
          AuthFactory.formatAuthError(error, fallbackMessages[payload.type]),
        );
        throw error;
      }
    },

    signIn: (email, password, navigate) =>
      get().authenticate(
        { type: "signin", credentials: { email, password } },
        navigate,
      ),

    signUp: (email, password, userData, navigate) =>
      get().authenticate(
        {
          type: "signup",
          credentials: { email, password, ...userData },
        },
        navigate,
      ),

    signInWithGoogle: () => get().authenticate({ type: "google" }),

    signOut: async (navigate) => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        set({ user: null, session: null, callbackRedirectTo: null });
        toast.success("Signed out successfully");

        if (navigate) {
          navigate("/", { replace: true });
        } else {
          window.location.assign("/");
        }
      } catch (error) {
        console.error("Sign out error:", error);
        toast.error("Failed to sign out");
        throw error;
      }
    },
  };
});
