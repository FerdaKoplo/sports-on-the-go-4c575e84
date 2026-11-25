import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/stores/authStore";
import { useAuthSubmit } from "@/hooks/partials/auth/use-auth-submit";
import { signUpSchema } from "@/constants/schema/auth/auth.schema";
import { AuthInputField, LegalConsentBox } from "./auth-form-primitives";

export const SignUpForm = () => {
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const { authenticate } = useAuth();
  const navigate = useNavigate();

  const { isLoading, errors, handleSubmit } = useAuthSubmit(
    signUpSchema,
    (formData) => ({
      username: formData.get("username") as string,
      email: formData.get("signup-email") as string,
      password: formData.get("signup-password") as string,
      dateOfBirth: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : "",
      agreeToTerms,
    }),
    ({ username, email, password, dateOfBirth: dob }) =>
      authenticate(
        {
          type: "signup",
          credentials: { username, email, password, dateOfBirth: dob },
        },
        navigate,
      ),
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInputField
        id="username"
        name="username"
        type="text"
        label="Username"
        placeholder="johndoe123"
        icon={User}
        pattern="[a-zA-Z0-9_]+"
        minLength={3}
        maxLength={20}
        error={errors.username}
        helperText="3-20 characters, letters, numbers, and underscores only"
        required
      />
      <AuthInputField
        id="signup-email"
        name="signup-email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        icon={Mail}
        error={errors.email}
        required
      />
      <AuthInputField
        id="signup-password"
        name="signup-password"
        type="password"
        label="Password"
        placeholder="••••••••"
        icon={Lock}
        error={errors.password}
        required
      />

      <div className="space-y-2">
        <Label htmlFor="dob" className="text-sm">
          Date of Birth
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal pl-10 h-10 text-sm relative",
                !dateOfBirth && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
              {dateOfBirth ? (
                format(dateOfBirth, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-background z-50"
            align="start"
          >
            <Calendar
              mode="single"
              selected={dateOfBirth}
              onSelect={setDateOfBirth}
              disabled={(date) =>
                date > new Date(Date.now() - 567648000000) ||
                date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.dateOfBirth && (
          <p className="text-xs text-destructive">{errors.dateOfBirth}</p>
        )}
      </div>

      <LegalConsentBox
        checked={agreeToTerms}
        onCheckedChange={setAgreeToTerms}
        error={errors.agreeToTerms}
      />

      <Button
        type="submit"
        className="w-full gradient-primary text-white shadow-primary hover:opacity-90"
        disabled={isLoading || !agreeToTerms}
      >
        {isLoading ? "Creating account..." : "I Agree - Create Account"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By clicking "Create Account", you confirm that you have read and agreed
        to all legal provisions above
      </p>
    </form>
  );
};
