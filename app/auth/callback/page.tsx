"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // This effect runs once when the component mounts
    const handleAuthCallback = async () => {
      // Process the OAuth callback
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error processing auth callback:", error);
      }
      
      // Redirect to dashboard after successful authentication
      router.push("/dashboard");
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg">Completing authentication...</p>
    </div>
  );
} 