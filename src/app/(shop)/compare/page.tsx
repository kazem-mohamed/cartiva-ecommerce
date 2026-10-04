import type { Metadata } from "next";
import { PageFrame } from "@/ds/ui/PageIntro";
import { CompareView } from "./CompareView";

export const metadata: Metadata = { title: "Compare" };

export default function ComparePage() {
  return (
    <PageFrame>
      <CompareView />
    </PageFrame>
  );
}
