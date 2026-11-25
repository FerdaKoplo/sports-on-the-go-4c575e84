import { supabase } from "@/integrations/supabase/client";
import { AuthError, type User, type Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  username: string;
  dateOfBirth: string;
}

export type AuthProviderPayload =
  | { type: "signin"; credentials: SignInCredentials }
  | { type: "signup"; credentials: SignUpCredentials }
  | { type: "google" };

export interface AuthExecutionResult {
  user: User | null;
  session: Session | null;
  redirectTo: string | null;
}

export interface AuthStrategy {
  execute(): Promise<AuthExecutionResult>;
}

export const resolvePostAuthDestination = async (
  user: User | null,
  options: { checkTermsMetadata?: boolean } = {},
): Promise<string> => {
  if (!user) return "/auth";

  if (options.checkTermsMetadata && !user.user_metadata?.terms_accepted) {
    return "/google-consent";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const returnUrl = sessionStorage.getItem("authReturnUrl");
  const hasValidReturnUrl = Boolean(returnUrl && returnUrl !== "/auth");

  if (!profile?.username) {
    return "/setup-username";
  }

  if (hasValidReturnUrl && returnUrl) {
    sessionStorage.removeItem("authReturnUrl");
    return returnUrl;
  }

  return "/discover";
};

class EmailSignInStrategy implements AuthStrategy {
  constructor(private readonly credentials: SignInCredentials) {}

  async execute(): Promise<AuthExecutionResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: this.credentials.email,
      password: this.credentials.password,
    });

    if (error) throw error;

    if (data.user) {
      await supabase
        .from("profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", data.user.id);
    }

    toast.success("Welcome back!");
    const redirectTo = await resolvePostAuthDestination(data.user);

    return {
      user: data.user,
      session: data.session,
      redirectTo,
    };
  }
}

class EmailSignUpStrategy implements AuthStrategy {
  constructor(private readonly credentials: SignUpCredentials) {}

  async execute(): Promise<AuthExecutionResult> {
    const { data, error } = await supabase.auth.signUp({
      email: this.credentials.email,
      password: this.credentials.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          username: this.credentials.username,
          date_of_birth: this.credentials.dateOfBirth,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
        },
      },
    });

    if (error) throw error;

    toast.success("Account created successfully! Welcome to SquadUp.");

    const returnUrl = sessionStorage.getItem("authReturnUrl");
    const redirectTo =
      returnUrl && returnUrl !== "/auth" ? returnUrl : "/discover";

    if (returnUrl && returnUrl !== "/auth") {
      sessionStorage.removeItem("authReturnUrl");
    }

    return {
      user: data.user,
      session: data.session,
      redirectTo,
    };
  }
}

class GoogleOAuthStrategy implements AuthStrategy {
  async execute(): Promise<AuthExecutionResult> {
    const currentPath = window.location.pathname + window.location.search;
    if (window.location.pathname !== "/auth") {
      sessionStorage.setItem("authReturnUrl", currentPath);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth-callback`,
      },
    });

    if (error) throw error;

    return { user: null, session: null, redirectTo: null };
  }
}

export class AuthFactory {
  static create(payload: AuthProviderPayload): AuthStrategy {
    switch (payload.type) {
      case "signin":
        return new EmailSignInStrategy(payload.credentials);
      case "signup":
        return new EmailSignUpStrategy(payload.credentials);
      case "google":
        return new GoogleOAuthStrategy();
    }
  }

  static formatAuthError(error: unknown, fallback: string): string {
    if (error instanceof AuthError || error instanceof Error) {
      if (error.message.includes("User already registered")) {
        return "This email is already registered. Please sign in instead.";
      }
      if (error.message.includes("Invalid login credentials")) {
        return "Invalid email or password. Please try again.";
      }
      return error.message || fallback;
    }
    return fallback;
  }
}
