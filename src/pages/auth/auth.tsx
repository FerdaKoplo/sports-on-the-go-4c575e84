import { Link } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthFormFactory } from "@/constants/factory/auth-form-factory";
import { useAuth } from "@/stores/authStore";
import { GoogleOAuthSection } from "@/components/partials/auth/auth-form-primitives";

const Auth = () => {
  const { authenticate } = useAuth();
  const tabs = AuthFormFactory.getTabs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center px-4 py-12">
      <Link
        to="/"
        className="fixed top-6 left-6 flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-smooth"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Back to Home</span>
      </Link>

      <Card className="w-full max-w-md shadow-elevated border-2">
        <CardHeader className="space-y-1 pb-2 sm:pb-4">
          <div className="flex items-center justify-center mb-1 sm:mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
              <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-black text-center">
            Welcome to SquadUp
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Sign in to discover games or create your account
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 h-9 sm:h-10">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.mode}
                  value={tab.mode}
                  className="text-xs sm:text-sm px-2"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.mode} value={tab.mode}>
                <GoogleOAuthSection
                  onGoogleClick={() => authenticate({ type: "google" })}
                />
                {AuthFormFactory.create(tab.mode)}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
