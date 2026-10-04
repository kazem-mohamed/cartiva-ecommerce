"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Field } from "./Field";

/** A Field with a show/hide control. The toggle is a real button, announced by what it will do. */
export function PasswordField(props: Omit<ComponentProps<typeof Field>, "type" | "end">) {
  const [shown, setShown] = useState(false);
  return (
    <Field
      {...props}
      type={shown ? "text" : "password"}
      end={
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          className="grid size-9 place-items-center rounded-full text-fg-2 hover:bg-raised hover:text-fg active:scale-[.92] [&_svg]:size-[18px]"
        >
          {shown ? <EyeOff aria-hidden strokeWidth={1.5} /> : <Eye aria-hidden strokeWidth={1.5} />}
        </button>
      }
    />
  );
}

/** Three steps, one colour. Says what would make it stronger instead of just grading. */
export function PasswordStrength({ password }: { password: string }) {
  const long = password.length >= 8;
  const mixed = /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
  const symbol = /[\W_]/.test(password) && password.length >= 10;
  const score = !password ? 0 : long && mixed && symbol ? 3 : long && mixed ? 2 : 1;
  const label = ["", "Weak", "Good", "Strong"][score];
  const tip = !password ? "" : !long ? "Use at least 8 characters." : !mixed ? "Mix upper and lower case with a number." : score < 3 ? "10+ characters with a symbol makes it strong." : "";
  return (
    <div className="grid gap-1.5" aria-live="polite">
      <div className="grid grid-cols-3 gap-1.5" aria-hidden>
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-1 rounded-pill transition-colors duration-(--dur-state) ${score >= n ? "bg-fg" : "bg-line"}`} />
        ))}
      </div>
      {password && (
        <p className="t-caption text-fg-3">
          <span className="text-fg">{label}</span>
          {tip && ` · ${tip}`}
        </p>
      )}
    </div>
  );
}
