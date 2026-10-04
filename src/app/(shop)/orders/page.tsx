import type { Metadata } from "next";
import { PageFrame } from "@/ds/ui/PageIntro";
import { OrdersView } from "./OrdersView";

export const metadata: Metadata = { title: "Your orders" };

export default function OrdersPage() {
  return (
    <PageFrame>
      <OrdersView />
    </PageFrame>
  );
}
