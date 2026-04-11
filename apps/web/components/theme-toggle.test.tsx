import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const setTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
    setTheme,
    theme: "system",
  }),
}));

import { ThemeToggle } from "./theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    setTheme.mockClear();
  });

  it.each([
    ["Light", "light"],
    ["Dark", "dark"],
    ["System", "system"],
  ] as const)("selects the %s theme option", async (label, theme) => {
    const user = userEvent.setup();

    render(<ThemeToggle />);

    await user.click(screen.getAllByRole("button", { name: /change theme/i })[0]);
    await user.click(screen.getByRole("menuitem", { name: label }));

    expect(setTheme).toHaveBeenCalledWith(theme);
  });
});
