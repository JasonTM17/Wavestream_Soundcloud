import { AuthForm } from "@/components/auth/auth-form";
import { getFirstQueryValue } from "@/lib/auth-routing";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    next?: string | string[] | null;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <AuthForm
      mode="forgot-password"
      nextPath={getFirstQueryValue(resolvedSearchParams?.next)}
    />
  );
}
