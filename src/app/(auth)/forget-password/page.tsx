"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button, ButtonLink } from "@/ds/ui/Button";
import { Field } from "@/ds/ui/Field";
import { PasswordField, PasswordStrength } from "@/ds/ui/PasswordField";

const API = "https://ecommerce.routemisr.com/api/v1/auth";
type Step = 1 | 2 | 3 | 4;

const COPY: Record<Step, { title: string; body: string }> = {
  1: { title: "Reset your password", body: "Enter your account's email and we'll send a reset code." },
  2: { title: "Check your email", body: "Enter the code we sent." },
  3: { title: "Choose a new password", body: "At least 8 characters. You'll sign in with it next." },
  4: { title: "Password changed.", body: "Sign in with your new password." },
};

async function post(path: string, body: object, method = "POST") {
  const res = await fetch(`${API}/${path}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? data?.errors?.[0]?.msg ?? "Something went wrong. Try again.");
  }
}

export default function ForgetPasswordPage() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<{ field?: "email" | "code" | "password" | "confirm"; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError({ field: "email", message: "Enter a valid email address." });
    setBusy(true);
    try {
      await post("forgotPasswords", { email: email.trim() });
      toast(`Code sent to ${email.trim()}.`);
      setStep(2);
    } catch (e) {
      setError({ field: "email", message: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (step === 1) return sendCode();
    if (step === 2) {
      if (code.trim().length < 4) return setError({ field: "code", message: "Enter the code from the email." });
      setBusy(true);
      try {
        await post("verifyResetCode", { resetCode: code.trim() });
        setStep(3);
      } catch (err) {
        setError({ field: "code", message: (err as Error).message });
      } finally {
        setBusy(false);
      }
      return;
    }
    if (password.length < 8) return setError({ field: "password", message: "Use at least 8 characters." });
    if (password !== confirm) return setError({ field: "confirm", message: "The passwords don't match." });
    setBusy(true);
    try {
      await post("resetPassword", { email: email.trim(), newPassword: password }, "PUT");
      setStep(4);
      setCode("");
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError({ message: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const fieldError = (f: "email" | "code" | "password" | "confirm") => (error?.field === f ? error.message : undefined);

  return (
    // Keyed on the step: each step rises in rather than swapping in place.
    <div key={step} className="enter grid gap-10">
      <header className="grid gap-3">
        {step < 4 ? (
          <p className="t-caption t-num text-fg-3">Step {step} of 3</p>
        ) : (
          <span className="grid size-12 place-items-center rounded-full bg-fg text-canvas lights-on">
            <Check aria-hidden size={22} strokeWidth={1.75} />
          </span>
        )}
        <h1 className="t-h1">{COPY[step].title}</h1>
        <p className="t-body-lg text-fg-2">
          {step === 2 ? (
            <>
              Enter the code we sent to <span className="text-fg">{email.trim()}</span>.
            </>
          ) : (
            COPY[step].body
          )}
        </p>
      </header>

      {step === 4 ? (
        <ButtonLink href="/login" size="lg" fullWidth>
          Sign in
        </ButtonLink>
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-5">
          {step === 1 && (
            <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldError("email")} />
          )}
          {step === 2 && (
            <Field
              label="Reset code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              error={fieldError("code")}
              inputClassName="t-num tracking-[0.4em] text-lg"
            />
          )}
          {step === 3 && (
            <>
              <div className="grid gap-2.5">
                <PasswordField label="New password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={fieldError("password")} />
                <PasswordStrength password={password} />
              </div>
              <PasswordField label="Confirm new password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={fieldError("confirm")} />
            </>
          )}
          {error && !error.field && (
            <p role="alert" className="enter t-body text-error">
              {error.message}
            </p>
          )}
          <Button type="submit" size="lg" fullWidth loading={busy} loadingLabel="One moment" className="mt-2">
            {step === 1 ? "Send code" : step === 2 ? "Verify code" : "Change password"}
          </Button>
          {step === 2 && (
            <div className="flex flex-wrap justify-center gap-x-6">
              <Button variant="text" onClick={() => void sendCode()} disabled={busy}>
                Send a new code
              </Button>
              <Button
                variant="text"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
                disabled={busy}
              >
                Use a different email
              </Button>
            </div>
          )}
        </form>
      )}

      {step < 4 && (
        <p className="border-t border-line pt-8 t-body text-fg-2">
          Remembered it?{" "}
          <Link href="/login" className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-current">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
