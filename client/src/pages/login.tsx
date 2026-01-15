import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-3xl font-bold text-primary">FC</span>
          </div>
          <CardTitle className="text-2xl" data-testid="text-login-title">Welcome to FanCal</CardTitle>
          <CardDescription data-testid="text-login-description">
            Track your favorite teams across 14 major leagues. Sign in to save your team selections and access your personalized calendar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleLogin}
            className="w-full"
            size="lg"
            data-testid="button-login"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign in to continue
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground" data-testid="text-login-providers">
            Sign in with your account
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
