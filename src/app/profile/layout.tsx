import type { Metadata } from "next";
import { PageFrame } from "@/ds/ui/PageIntro";
import { AccountGate } from "./AccountGate";
import { ProfileNav } from "./ProfileNav";

export const metadata: Metadata = { title: "Your account" };

/** Every account screen shares one frame: where you are on the left, the task on the right. */
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageFrame>
      <AccountGate>
        <div className="grid grid-cols-1 gap-10 pt-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 lg:pt-14">
          <ProfileNav />
          <div className="min-w-0">{children}</div>
        </div>
      </AccountGate>
    </PageFrame>
  );
}
