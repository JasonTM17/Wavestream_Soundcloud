import { AuthForm } from "@/components/auth/auth-form";
import { getFirstQueryValue } from "@/lib/auth-routing";

type SignInPageProps = {
  searchParams?: Promise<{
    next?: string | string[] | null;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <AuthForm mode="sign-in" nextPath={getFirstQueryValue(resolvedSearchParams?.next)} />
  );
}
