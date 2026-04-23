"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export function LandingCta() {
  const tLanding = useT("landing");

  return (
    <section className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-[1400px] px-4 py-16 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {tLanding.ctaTitle}
          </h2>
          <p className="max-w-lg text-base text-muted-foreground">{tLanding.ctaSubtitle}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/sign-up">{tLanding.createAccount}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/sign-up">{tLanding.joinWaveStream}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
