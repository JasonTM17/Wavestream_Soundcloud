"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

export default function SignOutPage() {
  const router = useRouter();
  const [state, setState] = React.useState<"loading" | "done" | "error">("loading");

  React.useEffect(() => {
    let cancelled = false;

    signOut()
      .then(() => {
        if (cancelled) {
          return;
        }

        setState("done");
        toast.success("You are signed out.");
        router.replace("/sign-in");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setState("error");
        toast.error(error instanceof Error ? error.message : "Could not sign out.");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <AuthCard
      title="Signing you out"
      description="We are clearing the current session and returning you to the sign-in flow."
      footer={
        <Link className="font-medium text-foreground underline-offset-4 hover:underline" href="/sign-in">
          Back to sign in
        </Link>
      }
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-4">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-emerald-400 text-white shadow-lg shadow-cyan-500/20">
            {state === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              {state === "loading"
                ? "Clearing your session..."
                : state === "done"
                  ? "Session cleared."
                  : "Sign-out needs a retry."}
            </p>
            <p className="text-sm text-muted-foreground">
              {state === "loading"
                ? "This keeps the refresh cookie and browser state aligned before sending you back to sign in."
                : state === "done"
                  ? "You can continue with another account or return to discovery."
                  : "The backend did not confirm the logout. You can try again below."}
            </p>
          </div>
        </div>

        {state === "error" ? (
          <Button className="w-full" onClick={() => router.refresh()}>
            Try logout again
          </Button>
        ) : null}
      </div>
    </AuthCard>
  );
}
