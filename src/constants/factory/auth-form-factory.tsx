import { SignInForm } from "@/components/partials/auth/sign-in-form";
import { SignUpForm } from "@/components/partials/auth/sign-up-form";
import { ReactNode } from "react";

export type AuthTabMode = "signin" | "signup";

interface AuthTabProduct {
  mode: AuthTabMode;
  label: string;
  renderForm: () => ReactNode;
}

const AUTH_TAB_REGISTRY: Record<AuthTabMode, AuthTabProduct> = {
  signin: {
    mode: "signin",
    label: "Sign In",
    renderForm: () => <SignInForm />,
  },
  signup: {
    mode: "signup",
    label: "Sign Up",
    renderForm: () => <SignUpForm />,
  },
};

export class AuthFormFactory {
  static getTabs(): AuthTabProduct[] {
    return Object.values(AUTH_TAB_REGISTRY);
  }

  static create(mode: AuthTabMode): ReactNode {
    return AUTH_TAB_REGISTRY[mode].renderForm();
  }
}
