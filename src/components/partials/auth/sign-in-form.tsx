import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInSchema } from "@/constants/schema/auth/auth.schema";
import { useAuth } from "@/stores/authStore";
import { useAuthSubmit } from "@/hooks/partials/auth/use-auth-submit";
import { AuthInputField } from "./auth-form-primitives";

export const SignInForm = () => {
  const { authenticate } = useAuth();
  const navigate = useNavigate();

  const { isLoading, errors, handleSubmit } = useAuthSubmit(
    signInSchema,
    (formData) => ({
      email: formData.get("signin-email") as string,
      password: formData.get("signin-password") as string,
    }),
    (credentials) => authenticate({ type: "signin", credentials }, navigate),
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInputField
        id="signin-email"
        name="signin-email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        icon={Mail}
        error={errors.email}
        required
      />
      <AuthInputField
        id="signin-password"
        name="signin-password"
        type="password"
        label="Password"
        placeholder="••••••••"
        icon={Lock}
        error={errors.password}
        required
      />
      <Button
        type="submit"
        className="w-full gradient-primary text-white shadow-primary hover:opacity-90"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
};
