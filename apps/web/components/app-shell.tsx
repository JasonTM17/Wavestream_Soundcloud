"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Compass,
  BellRing,
  LibraryBig,
  LogOut,
  Music4,
  Search,
  Upload,
  UserCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthActions, useAuthSession } from "@/components/auth/auth-provider";
import { SiteCredits } from "@/components/site-credits";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { MiniPlayer } from "@/components/player/mini-player";
import { useCurrentUserQuery, useNotificationsQuery } from "@/lib/wavestream-queries";
import { usePlayerStore } from "@/lib/player-store";
import { cn } from "@/lib/utils";

const baseNavigation = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Your Library", icon: LibraryBig },
  { href: "/creator", label: "Creator", icon: Upload },
];

export function AppShell({ children }: React.PropsWithChildren) {
  const pathname = usePathname();
  const queueLength = usePlayerStore((state) => state.queue.length);
  const [isLoggingOut, startLogoutTransition] = React.useTransition();
  const { isAuthenticated, isBooting, user: sessionUser } = useAuthSession();
  const { logout } = useAuthActions();
  const currentUser = useCurrentUserQuery();
  const notifications = useNotificationsQuery();
  const user = sessionUser ?? currentUser.data ?? null;
  const unreadCount = (notifications.data ?? []).filter((item) => !item.read).length;
  const navigation = React.useMemo(
    () =>
      user?.role === "admin"
        ? [...baseNavigation, { href: "/admin", label: "Admin", icon: Shield }]
        : baseNavigation,
    [user?.role],
  );

  const signInHref = `/sign-in?next=${encodeURIComponent(pathname)}`;
  const creatorToolsHref = !isAuthenticated
    ? signInHref
    : user?.role === "creator" || user?.role === "admin"
      ? "/creator"
      : "/library";
  const creatorToolsLabel = !isAuthenticated
    ? "Sign in for creator tools"
    : user?.role === "creator" || user?.role === "admin"
      ? "Upload a track"
      : "Open your library";

  const handleLogout = React.useCallback(() => {
    startLogoutTransition(async () => {
      try {
        await logout();
        toast.success("Signed out of WaveStream.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to sign out right now.");
      }
    });
  }, [logout]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-black text-white">
      {/* Main content area */}
      <div className="flex flex-1 gap-2 overflow-hidden p-2">
        {/* Sidebar — Desktop */}
        <aside className="hidden w-[280px] shrink-0 flex-col gap-2 lg:flex">
          {/* Top nav card */}
          <div className="rounded-lg bg-[#121212] p-4">
            <Link href="/" className="flex items-center gap-3 px-2 py-1">
              <div className="flex h-8 w-8 items-center justify-center">
                <Music4 className="h-6 w-6 text-[#1ed760]" />
              </div>
              <span className="text-lg font-bold tracking-tight">WaveStream</span>
            </Link>

            <nav className="mt-5 space-y-1">
              {navigation.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 rounded-md px-3 py-2 text-sm font-bold transition-colors",
                      active
                        ? "text-white"
                        : "text-[#b3b3b3] hover:text-white",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Library / session card */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-[#121212] p-4">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#1ed760] text-black font-bold text-sm">
                      {user.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{user.displayName}</p>
                    <p className="truncate text-xs text-[#b3b3b3]">@{user.username}</p>
                  </div>
                </div>

                {unreadCount > 0 && (
                  <div className="flex items-center gap-2 rounded-md bg-[#1f1f1f] px-3 py-2">
                    <BellRing className="h-4 w-4 text-[#1ed760]" />
                    <span className="text-xs text-[#b3b3b3]">
                      {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="space-y-1">
                  <p className="px-2 text-xs font-bold uppercase tracking-wider text-[#b3b3b3]">
                    Quick actions
                  </p>
                  <Link
                    href={creatorToolsHref}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-[#b3b3b3] transition-colors hover:text-white"
                  >
                    <Upload className="h-4 w-4" />
                    {creatorToolsLabel}
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-[#b3b3b3] transition-colors hover:text-white"
                    >
                      <Shield className="h-4 w-4" />
                      Admin hub
                    </Link>
                  )}
                </div>

                {queueLength > 0 && (
                  <div className="rounded-md bg-[#1f1f1f] px-3 py-2">
                    <p className="text-xs text-[#b3b3b3]">
                      {queueLength} track{queueLength === 1 ? "" : "s"} in queue
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {isBooting ? (
                  <p className="text-sm text-[#b3b3b3]">
                    Restoring your session...
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-[#b3b3b3]">
                      Sign in to sync your queue, unlock notifications, and access creator tools.
                    </p>
                    <Button asChild variant="accent" size="sm" className="w-full">
                      <Link href={signInHref}>Sign in</Link>
                    </Button>
                  </>
                )}
              </div>
            )}

            <div className="mt-auto pt-4">
              <ThemeToggle />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="sticky top-0 z-30 flex items-center justify-between bg-[#121212] px-4 py-3 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <Music4 className="h-5 w-5 text-[#1ed760]" />
              <span className="font-bold">WaveStream</span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account menu">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-[#1ed760] text-black text-xs font-bold">
                        {user ? user.displayName.slice(0, 2).toUpperCase() : "WS"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-52">
                  <DropdownMenuLabel>
                    {user ? user.displayName : "WaveStream guest"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={`/artist/${user.username}`}>
                          <UserCircle2 className="mr-2 h-4 w-4" />
                          View profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleLogout} disabled={isLoggingOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {isLoggingOut ? "Signing out..." : "Sign out"}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href={signInHref}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign in
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Mobile nav pills */}
          <div className="flex gap-2 overflow-x-auto px-4 py-2 lg:hidden">
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors",
                    active
                      ? "bg-white text-black"
                      : "bg-[#1f1f1f] text-[#b3b3b3] hover:bg-[#282828] hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto rounded-lg bg-[#121212] p-4 lg:p-6">
            <div className="space-y-6">
              {children}
              <SiteCredits />
            </div>
          </main>
        </div>
      </div>

      {/* Bottom player */}
      <MiniPlayer />
    </div>
  );
}
