import { ComponentProps } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthInputFieldProps extends ComponentProps<typeof Input> {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  helperText?: string;
}

export const AuthInputField = ({
  id,
  label,
  icon: Icon,
  error,
  helperText,
  ...inputProps
}: AuthInputFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input id={id} className="pl-10" {...inputProps} />
    </div>
    {error && <p className="text-xs sm:text-sm text-destructive">{error}</p>}
    {helperText && (
      <p className="text-xs text-muted-foreground">{helperText}</p>
    )}
  </div>
);

export const GoogleOAuthSection = ({
  onGoogleClick,
}: {
  onGoogleClick: () => void;
}) => (
  <div className="space-y-4 mb-4">
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={onGoogleClick}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </Button>
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          Or continue with email
        </span>
      </div>
    </div>
  </div>
);

interface LegalConsentBoxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
}

export const LegalConsentBox = ({
  checked,
  onCheckedChange,
  error,
}: LegalConsentBoxProps) => (
  <div className="space-y-3 border-2 border-destructive/20 rounded-lg p-3 sm:p-4 bg-destructive/5">
    <div className="flex items-start space-x-2 sm:space-x-3">
      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-xs sm:text-sm font-semibold text-foreground mb-1 sm:mb-2">
          IMPORTANT LEGAL AGREEMENT
        </p>
        <p className="text-xs text-muted-foreground mb-2 sm:mb-3">
          By creating an account, you are entering into a legally binding
          agreement. Please read carefully:
        </p>
      </div>
    </div>

    <div className="flex items-start space-x-2 sm:space-x-3">
      <Checkbox
        id="agree-terms"
        checked={checked}
        onCheckedChange={(val) => onCheckedChange(val === true)}
        className="mt-0.5 sm:mt-1 flex-shrink-0"
      />
      <div className="flex-1">
        <Label
          htmlFor="agree-terms"
          className="text-xs leading-relaxed cursor-pointer font-normal"
        >
          I have read, understand, and agree to be legally bound by the{" "}
          <Link
            to="/terms"
            target="_blank"
            className="text-primary font-semibold underline hover:text-primary/80"
          >
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy"
            target="_blank"
            className="text-primary font-semibold underline hover:text-primary/80"
          >
            Privacy Policy
          </Link>
          , including:
          <ul className="list-disc pl-4 sm:pl-5 mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1 text-muted-foreground">
            <li className="text-xs">
              <strong className="text-foreground">
                Assumption of all risks
              </strong>{" "}
              of injury, disability, or death from sports activities
            </li>
            <li className="text-xs">
              <strong className="text-foreground">Release of all claims</strong>{" "}
              against the operator and waiver of right to sue
            </li>
          </ul>
        </Label>
        {error && (
          <p className="text-xs text-destructive mt-2 font-semibold">{error}</p>
        )}
      </div>
    </div>
  </div>
);
