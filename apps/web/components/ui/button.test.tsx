"use client";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Button } from "./button";

afterEach(() => {
  cleanup();
});

describe("Button", () => {
  it.each([
    ["default", "bg-[#1ed760] text-black shadow-[0_8px_24px_-12px_rgba(30,215,96,0.6)] hover:bg-[#1fdf64] hover:scale-[1.02] hover:shadow-[0_8px_28px_-8px_rgba(30,215,96,0.65)]"],
    ["secondary", "bg-[#1f1f1f] text-white border border-transparent hover:bg-[#282828] hover:scale-[1.02]"],
    ["outline", "border border-[#727272] bg-transparent text-white hover:border-white hover:scale-[1.02]"],
    ["ghost", "bg-transparent text-[#b3b3b3] hover:bg-[#1f1f1f] hover:text-white"],
    ["accent", "bg-white text-black font-bold hover:scale-[1.02] hover:bg-[#f0f0f0]"],
  ] as const)("applies the %s variant classes", (variant, expectedClass) => {
    render(<Button variant={variant}>WaveStream CTA</Button>);

    expect(screen.getByRole("button", { name: "WaveStream CTA" })).toHaveClass(expectedClass);
  });

  it("forwards CTA styling through asChild links", () => {
    render(
      <Button asChild variant="outline" size="lg" className="rounded-full px-6">
        <a href="/discover">Explore discovery</a>
      </Button>,
    );

    const cta = screen.getByRole("link", { name: "Explore discovery" });

    expect(cta).toHaveAttribute("href", "/discover");
    expect(cta).toHaveClass("border border-[#727272] bg-transparent text-white hover:border-white hover:scale-[1.02]");
    expect(cta).toHaveClass("rounded-full px-6");
  });

  it("keeps disabled buttons non-interactive", () => {
    render(<Button disabled>Start free</Button>);

    const cta = screen.getByRole("button", { name: "Start free" });

    expect(cta).toBeDisabled();
    expect(cta).toHaveClass("disabled:pointer-events-none");
    expect(cta).toHaveClass("disabled:opacity-50");
  });
});
