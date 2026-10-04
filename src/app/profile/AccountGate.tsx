"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { EmptyState } from "@/ds/commerce/EmptyState";
import { ButtonLink } from "@/ds/ui/Button";

/** Account pages need a signed-in shopper; everyone else gets one clear way in. */
export function AccountGate({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  if (status === "unauthenticated") {
    return (
      <EmptyState
        heading="h1"
        className="py-24"
        title="Sign in to manage your account."
        body="Your details, addresses and password live here."
        action={<ButtonLink href={`/login?callbackUrl=${encodeURIComponent(pathname ?? "/profile")}`}>Sign in</ButtonLink>}
      />
    );
  }
  if (status === "loading") {
    return (
      <div role="status" aria-label="Loading your account" className="grid gap-10 pt-14 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <div className="skeleton hidden h-56 rounded-card lg:block" />
        <div className="grid content-start gap-4">
          <div className="skeleton h-12 w-64 rounded-pill" />
          <div className="skeleton h-48 rounded-card" />
        </div>
      </div>
    );
  }
  return children;
}
