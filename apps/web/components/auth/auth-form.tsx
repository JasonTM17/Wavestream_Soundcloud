"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { UserRole } from "@wavestream/shared";
import { z } from "zod";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  buildAuthHref,
  getFirstQueryValue,
  resolveAuthRedirect,
} from "@/lib/auth-routing";
import {
  forgotPassword,
  resetPassword,
  signIn,
  signUp,
  type AuthSession,
} from "@/lib/auth";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const signUpSchema = z.object({
  displayName: z.string().min(2, "Add a display name."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(24, "Username must be 24 characters or fewer.")
    .regex(/^[a-z0-9-_.]+$/i, "Use letters, numbers, dash, underscore, or dot only."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum([UserRole.LISTENER, UserRole.CREATOR]),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type AuthFormProps = {
  mode: "sign-in" | "sign-up" | "forgot-password" | "reset-password";
  nextPath?: string | string[] | null;
  resetToken?: string | string[] | null;
  onAuthenticatedSession?: (session: AuthSession) => void;
};

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function AuthForm({
  mode,
  nextPath,
  resetToken,
  onAuthenticatedSession,
}: AuthFormProps) {
  if (mode === "sign-in") {
    return <SignInForm nextPath={nextPath} onAuthenticatedSession={onAuthenticatedSession} />;
  }

  if (mode === "sign-up") {
    return <SignUpForm nextPath={nextPath} onAuthenticatedSession={onAuthenticatedSession} />;
  }

  if (mode === "forgot-password") {
    return <ForgotPasswordForm nextPath={nextPath} />;
  }

  return <ResetPasswordForm nextPath={nextPath} resetToken={resetToken} />;
}

export function AuthCard({
  title,
  description,
  footer,
  children,
}: React.PropsWithChildren<{
  title: string;
  description: string;
  footer: React.ReactNode;
}>) {
  return (
    <Card className="w-full border-border/85 bg-card/95 shadow-[0_30px_80px_-34px_rgba(10,13,25,0.34)] backdrop-blur-xl">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="soft">WaveStream Access</Badge>
          <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground/90">
            Fast access
          </span>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {children}
        <p className="mt-6 text-sm leading-6 text-muted-foreground">{footer}</p>
      </CardContent>
    </Card>
  );
}

function SignInForm({
  nextPath,
  onAuthenticatedSession,
}: Pick<AuthFormProps, "nextPath" | "onAuthenticatedSession">) {
  const router = useRouter();
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: (session) => {
      onAuthenticatedSession?.(session);
      toast.success("Welcome back to WaveStream.");
      router.replace(resolveAuthRedirect(nextPath));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    },
  });

  return (
    <AuthCard
      title="Sign in to your studio"
      description="Continue with your listener or creator account and jump straight back into the live catalog, playlists, and creator tools."
      footer={
        <>
          New here?{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href={buildAuthHref("/sign-up", nextPath)}
          >
            Create an account
          </Link>
          {" | "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href={buildAuthHref("/forgot-password", nextPath)}
          >
            Forgot password?
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@studio.com" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password">Password</Label>
            <Link
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              href={buildAuthHref("/forgot-password", nextPath)}
            >
              Recovery link
            </Link>
          </div>
          <Input id="password" type="password" placeholder="********" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Connecting..." : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}

function SignUpForm({
  nextPath,
  onAuthenticatedSession,
}: Pick<AuthFormProps, "nextPath" | "onAuthenticatedSession">) {
  const router = useRouter();
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: "",
      username: "",
      email: "",
      password: "",
      role: UserRole.LISTENER,
    },
  });

  const mutation = useMutation({
    mutationFn: signUp,
    onSuccess: (session) => {
      onAuthenticatedSession?.(session);
      toast.success("Account created.");
      router.replace(resolveAuthRedirect(nextPath));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    },
  });

  return (
    <AuthCard
      title="Create your WaveStream profile"
      description="Join with a listener or creator profile, then start exploring the live public feed right away."
      footer={
        <>
          Already have an account?{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href={buildAuthHref("/sign-in", nextPath)}
          >
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="space-y-2">
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" placeholder="Jordan North" {...form.register("displayName")} />
          {form.formState.errors.displayName ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.displayName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" placeholder="jordan-north" {...form.register("username")} />
          {form.formState.errors.username ? (
            <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@studio.com" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="********" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">I am joining as</Label>
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value as SignUpValues["role"])}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.LISTENER}>Listener</SelectItem>
                  <SelectItem value={UserRole.CREATOR}>Creator</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.role ? (
            <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}

function ForgotPasswordForm({ nextPath }: Pick<AuthFormProps, "nextPath">) {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast.success("If the email exists, we sent a recovery link.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    },
  });

  return (
    <AuthCard
      title="Reset your password"
      description="We will send a recovery link to your inbox without revealing whether the address exists."
      footer={
        <>
          Remembered it?{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href={buildAuthHref("/sign-in", nextPath)}
          >
            Return to sign in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="you@studio.com"
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        {mutation.isSuccess ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            Check your inbox. If the address exists, you will receive a reset link from WaveStream.
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending link..." : "Send recovery link"}
        </Button>
      </form>
    </AuthCard>
  );
}

function ResetPasswordForm({
  nextPath,
  resetToken,
}: Pick<AuthFormProps, "nextPath" | "resetToken">) {
  const router = useRouter();
  const resolvedToken = getFirstQueryValue(resetToken) ?? "";
  const hasPrefilledToken = resolvedToken.length > 0;
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: resolvedToken,
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password updated. You can sign in again now.");
      router.replace(buildAuthHref("/sign-in", nextPath));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    },
  });

  return (
    <AuthCard
      title="Create a new password"
      description="Set a strong replacement password, then return to sign in with the same account."
      footer={
        <>
          Need a fresh link?{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href={buildAuthHref("/forgot-password", nextPath)}
          >
            Request recovery email
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        {!hasPrefilledToken ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            The reset token was not present in the link. You can paste it below or request a new
            recovery email.
          </div>
        ) : (
          <input type="hidden" {...form.register("token")} />
        )}

        {!hasPrefilledToken ? (
          <div className="space-y-2">
            <Label htmlFor="token">Reset token</Label>
            <Input id="token" placeholder="Paste token from your email" {...form.register("token")} />
            {form.formState.errors.token ? (
              <p className="text-sm text-destructive">{form.formState.errors.token.message}</p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="********"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="********"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Updating..." : "Update password"}
        </Button>
      </form>
    </AuthCard>
  );
}
