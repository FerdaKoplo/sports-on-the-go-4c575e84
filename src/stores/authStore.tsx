import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SignUpData {
  username: string;
  dateOfBirth: string;
}

type NavigateFn = (to: string) => void;

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData: SignUpData,
    navigate?: NavigateFn,
  ) => Promise<void>;
  signIn: (
    email: string,
    password: string,
    navigate?: NavigateFn,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: (navigate?: NavigateFn) => Promise<void>;
}

export const useAuth = create<AuthState>((set) => {
  supabase.auth.onAuthStateChange((_event, session) => {
    set({
      session,
      user: session?.user ?? null,
      loading: false,
    });
  });

  supabase.auth.getSession().then(({ data: { session } }) => {
    set({
      session,
      user: session?.user ?? null,
      loading: false,
    });
  });

  return {
    user: null,
    session: null,
    loading: true,

    signUp: async (email, password, userData, navigate) => {
      try {
        const redirectUrl = `${window.location.origin}/`;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              username: userData.username,
              date_of_birth: userData.dateOfBirth,
              terms_accepted: true,
              terms_accepted_at: new Date().toISOString(),
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          toast.success("Account created successfully! Welcome to SquadUp.");

          const returnUrl = sessionStorage.getItem("authReturnUrl");
          const destination =
            returnUrl && returnUrl !== "/auth" ? returnUrl : "/discover";

          if (returnUrl && returnUrl !== "/auth") {
            sessionStorage.removeItem("authReturnUrl");
          }

          if (navigate) {
            navigate(destination);
          } else {
            window.location.assign(destination);
          }
        }
      } catch (error: any) {
        console.error("Sign up error:", error);
        if (error.message?.includes("User already registered")) {
          toast.error(
            "This email is already registered. Please sign in instead.",
          );
        } else {
          toast.error(
            error.message || "Failed to create account. Please try again.",
          );
        }
        throw error;
      }
    },

    signIn: async (email, password, navigate) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", data.user.id)
            .single();

          await supabase
            .from("profiles")
            .update({ last_login_at: new Date().toISOString() })
            .eq("id", data.user.id);

          toast.success("Welcome back!");

          const returnUrl = sessionStorage.getItem("authReturnUrl");
          let destination = "/discover";

          if (returnUrl && returnUrl !== "/auth") {
            sessionStorage.removeItem("authReturnUrl");
            destination = returnUrl;
          } else if (!profile?.username) {
            destination = "/setup-username";
          }

          if (navigate) {
            navigate(destination);
          } else {
            window.location.assign(destination);
          }
        }
      } catch (error: any) {
        console.error("Sign in error:", error);
        if (error.message?.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(error.message || "Failed to sign in. Please try again.");
        }
        throw error;
      }
    },

    signInWithGoogle: async () => {
      try {
        const returnUrl = window.location.pathname + window.location.search;
        if (returnUrl !== "/auth") {
          sessionStorage.setItem("authReturnUrl", returnUrl);
        }

        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth-callback`,
          },
        });

        if (error) throw error;
      } catch (error: any) {
        console.error("Google sign in error:", error);
        toast.error("Failed to sign in with Google. Please try again.");
        throw error;
      }
    },

    signOut: async (navigate) => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        toast.success("Signed out successfully");

        if (navigate) {
          navigate("/");
        } else {
          window.location.assign("/");
        }
      } catch (error: any) {
        console.error("Sign out error:", error);
        toast.error("Failed to sign out");
        throw error;
      }
    },
  };
});
