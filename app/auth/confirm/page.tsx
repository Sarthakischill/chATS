"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HomeHeader } from "@/components/home-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function EmailConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        setIsLoading(true);
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        // If we have a session, the user is already logged in
        if (session) {
          setIsSuccess(true);
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
          
          return;
        }
        
        // If no session, check if we have a token in the URL
        // This happens when the user clicks the confirmation link from the email
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        
        if (token_hash && type === "signup") {
          try {
            // Verify the email with the token
            const { error: verifyError } = await supabase.auth.verifyOtp({
              token_hash,
              type: "signup"
            });
            
            if (verifyError) {
              // Handle specific verification errors
              if (verifyError.message.includes("Token has expired")) {
                setError("Your confirmation link has expired. Please request a new one by trying to sign in.");
              } else if (verifyError.message.includes("User not found")) {
                setError("The account associated with this confirmation link no longer exists. Please sign up again.");
              } else {
                throw verifyError;
              }
              return;
            }
            
            setIsSuccess(true);
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              router.push("/dashboard");
            }, 3000);
          } catch (tokenError: any) {
            console.error("Token verification error:", tokenError);
            setError(tokenError.message || "Failed to verify your email. Please try signing up again.");
          }
          
          return;
        }
        
        // If we don't have a token or type, something went wrong
        setError("Invalid confirmation link. Please try signing up again.");
      } catch (err: any) {
        console.error("Email confirmation error:", err);
        setError(err.message || "An error occurred during email confirmation");
      } finally {
        setIsLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <HomeHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Email Confirmation</CardTitle>
            <CardDescription>
              {isLoading ? "Processing your confirmation..." : 
                isSuccess ? "Your email has been confirmed!" : 
                "There was an issue with your confirmation"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p>Verifying your email address...</p>
              </div>
            ) : isSuccess ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your email has been successfully verified! You will be redirected to your dashboard shortly.
                  </AlertDescription>
                </Alert>
                <p className="text-center text-sm text-muted-foreground">
                  You can now use all the features of chATS to optimize your resume and cover letters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertDescription>
                    {error || "There was an error confirming your email. Please try again."}
                  </AlertDescription>
                </Alert>
                <p className="text-center text-sm text-muted-foreground">
                  Please try signing in or signing up again.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {!isLoading && (
              isSuccess ? (
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <div className="space-x-4">
                  <Button asChild variant="outline">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
} 