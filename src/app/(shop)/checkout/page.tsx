import type { Metadata } from "next";
import { PageFrame } from "@/ds/ui/PageIntro";
import { CheckoutView } from "./CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <PageFrame>
      <CheckoutView />
    </PageFrame>
  );
}
