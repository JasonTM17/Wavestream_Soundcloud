"use client";

import Link from "next/link";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { type TrackSummary } from "@/lib/wavestream-api";
import { LandingHeroPlayButton } from "./landing-hero-play-button";

interface LandingHeroTextProps {
  spotlightTrack: TrackSummary | null;
  heroQueueTracks: TrackSummary[];
}

export function LandingHeroText({ spotlightTrack, heroQueueTracks }: LandingHeroTextProps) {
  const tLanding = useT("landing");

  return (
    <div className="space-y-6">
      <h1 className="text-5xl font-bold tracking-tight text-foreground text-balance sm:text-6xl lg:text-7xl">
        {tLanding.heroTitle}
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">{tLanding.heroSubtitle}</p>
      <div className="flex flex-wrap gap-3">
        <LandingHeroPlayButton
          spotlightTrack={spotlightTrack}
          queueTracks={heroQueueTracks}
        />
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <Link href="/discover">
            <Play className="h-4 w-4" />
            {tLanding.exploreDiscovery}
          </Link>
        </Button>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/sign-up">{tLanding.signInFree}</Link>
        </Button>
      </div>
    </div>
  );
}
