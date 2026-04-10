import { AuthForm } from "@/components/auth/auth-form";
import { getFirstQueryValue } from "@/lib/auth-routing";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    next?: string | string[] | null;
    token?: string | string[] | null;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <AuthForm
      mode="reset-password"
      nextPath={getFirstQueryValue(resolvedSearchParams?.next)}
      resetToken={getFirstQueryValue(resolvedSearchParams?.token)}
    />
  );
}
