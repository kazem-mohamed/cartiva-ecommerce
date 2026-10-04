"use client";

import { Check, CircleAlert, Info, TriangleAlert } from "lucide-react";
import { Toaster as Sonner } from "sonner";
import { Spinner } from "./Spinner";

const icon = "size-[18px] shrink-0";

/**
 * Feedback, on the v2 system. Never steals focus (announced politely), auto-
 * dismisses in 4s, and every variant carries an icon — colour is never the only
 * signal. Actions are underlined text, not buttons: cobalt belongs to the one
 * primary action on the page, not to a notification.
 */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      duration={4000}
      gap={10}
      visibleToasts={3}
      // Clears the floating mobile nav pill.
      mobileOffset={{ bottom: 92 }}
      icons={{
        success: <Check aria-hidden strokeWidth={1.5} className={icon} />,
        error: <CircleAlert aria-hidden strokeWidth={1.5} className={`${icon} text-error`} />,
        warning: <TriangleAlert aria-hidden strokeWidth={1.5} className={icon} />,
        info: <Info aria-hidden strokeWidth={1.5} className={icon} />,
        loading: <Spinner size={18} />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group flex w-full items-center gap-3 rounded-card border border-line bg-raised px-4 py-3.5 text-fg " +
            "font-sans shadow-[0_12px_32px_-12px_rgb(0_0_0/0.35)] sm:w-[360px]",
          title: "t-label leading-snug",
          description: "t-caption text-fg-2 mt-0.5",
          actionButton:
            "ml-auto shrink-0 t-label underline underline-offset-4 decoration-line-strong hover:decoration-current px-1 py-1",
          cancelButton: "ml-auto shrink-0 t-label text-fg-2 px-1 py-1",
          closeButton: "text-fg-2",
        },
      }}
    />
  );
}
