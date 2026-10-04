"use client";

import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { cleanPhone, EG_MOBILE } from "@/ds/data/account";
import { Button } from "@/ds/ui/Button";
import { Field } from "@/ds/ui/Field";
import { PasswordField, PasswordStrength } from "@/ds/ui/PasswordField";

type Profile = { name: string; email: string; phone: string };
type ApiUser = { _id?: string; id?: string; name?: string; email?: string; phone?: string; role?: string };
type ProfileErrors = Partial<Record<keyof Profile, string>>;
type PasswordErrors = Partial<Record<"currentPassword" | "password" | "rePassword", string>>;

/** The users endpoint may answer with one user or a list; pick this account by id, then by email. */
function pickUser(json: unknown, id?: string | null, email?: string | null): ApiUser | null {
  const j = json as { data?: unknown; user?: unknown } | null;
  const raw = (j?.data as { user?: unknown } | undefined)?.user ?? j?.data ?? j?.user ?? null;
  if (!raw) return null;
  if (!Array.isArray(raw)) return raw as ApiUser;
  const list = raw as ApiUser[];
  return list.find((u) => (id && (u._id ?? u.id) === id) || (email && u.email?.toLowerCase() === email.toLowerCase())) ?? null;
}

function checkProfile(p: Profile): ProfileErrors {
  const e: ProfileErrors = {};
  if (p.name.trim().length < 2) e.name = "Enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(p.email.trim())) e.email = "Enter a valid email address.";
  if (!EG_MOBILE.test(cleanPhone(p.phone))) e.phone = "Enter an Egyptian mobile number, e.g. 01012345678.";
  return e;
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [meta, setMeta] = useState<{ id?: string; role?: string }>({});
  const [pErrors, setPErrors] = useState<ProfileErrors>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ currentPassword: "", password: "", rePassword: "" });
  const [wErrors, setWErrors] = useState<PasswordErrors>({});
  const [savingPw, setSavingPw] = useState(false);

  const id = session?.user?.id;
  const email = session?.user?.email;
  const name = session?.user?.name;

  useEffect(() => {
    let live = true;
    fetch("/api/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((json) => {
        if (!live) return;
        const u = pickUser(json, id, email);
        setProfile({ name: u?.name ?? name ?? "", email: u?.email ?? email ?? "", phone: u?.phone ?? "" });
        setMeta({ id: u?._id ?? u?.id ?? id ?? undefined, role: u?.role });
      });
    return () => {
      live = false;
    };
  }, [id, email, name]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    const errs = checkProfile(profile);
    setPErrors(errs);
    if (Object.keys(errs).length) return;
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name.trim(), email: profile.email.trim(), phone: cleanPhone(profile.phone) }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? json?.errors?.msg ?? "We couldn't save your details. Try again.");
      toast("Details saved.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    const errs: PasswordErrors = {};
    if (!pw.currentPassword) errs.currentPassword = "Enter your current password.";
    if (pw.password.length < 8) errs.password = "Use at least 8 characters.";
    if (pw.password !== pw.rePassword) errs.rePassword = "The passwords don't match.";
    setWErrors(errs);
    if (Object.keys(errs).length) return;
    setSavingPw(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pw),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? json?.errors?.msg ?? "We couldn't change your password. Check the current one and try again.");

      // A password change invalidates the old token. Signing in again with the new password swaps it for
      // a live one — otherwise the session looks signed in while every account call fails.
      const refreshed = await signIn("credentials", { redirect: false, email: profile?.email || email || "", password: pw.password });
      setPw({ currentPassword: "", password: "", rePassword: "" });
      if (refreshed?.error) {
        toast("Password changed. Sign in with the new one.");
        await signOut({ redirect: false });
        router.push("/login?callbackUrl=/profile/settings");
        return;
      }
      toast("Password changed.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingPw(false);
    }
  }

  const setP = (k: keyof Profile, v: string) => {
    setProfile((p) => (p ? { ...p, [k]: v } : p));
    if (pErrors[k]) setPErrors((x) => ({ ...x, [k]: undefined }));
  };

  return (
    <div className="grid gap-14">
      <header className="grid gap-3">
        <h1 className="t-h1">Profile &amp; password</h1>
        <p className="t-body-lg text-fg-2">Your name, contact details and sign-in.</p>
      </header>

      <section aria-labelledby="details" className="grid gap-6">
        <h2 id="details" className="t-h3">
          Details
        </h2>
        {!profile ? (
          <div role="status" aria-label="Loading your details" className="grid max-w-xl gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-12 rounded-pill" />
            ))}
          </div>
        ) : (
          <form onSubmit={saveProfile} noValidate className="enter grid max-w-xl gap-5">
            <Field label="Name" autoComplete="name" value={profile.name} onChange={(e) => setP("name", e.target.value)} error={pErrors.name} />
            <Field label="Email" type="email" autoComplete="email" value={profile.email} onChange={(e) => setP("email", e.target.value)} error={pErrors.email} />
            <Field
              label="Mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="01012345678"
              value={profile.phone}
              onChange={(e) => setP("phone", e.target.value)}
              error={pErrors.phone}
            />
            <div>
              <Button type="submit" variant="secondary" loading={savingProfile} loadingLabel="Saving">
                Save details
              </Button>
            </div>
          </form>
        )}
        {meta.id && (
          <p className="t-caption text-fg-3">
            Account ID <span className="t-num text-fg-2">{meta.id}</span>
            {meta.role && <> · {meta.role}</>}
          </p>
        )}
      </section>

      <section aria-labelledby="password" className="grid gap-6 border-t border-line pt-10">
        <div className="grid gap-1">
          <h2 id="password" className="t-h3">
            Password
          </h2>
          <p className="t-body text-fg-2">You&apos;ll stay signed in on this device.</p>
        </div>
        <form onSubmit={savePassword} noValidate className="grid max-w-xl gap-5">
          <PasswordField
            label="Current password"
            autoComplete="current-password"
            value={pw.currentPassword}
            onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
            error={wErrors.currentPassword}
          />
          <div className="grid gap-2.5">
            <PasswordField label="New password" autoComplete="new-password" value={pw.password} onChange={(e) => setPw((p) => ({ ...p, password: e.target.value }))} error={wErrors.password} />
            <PasswordStrength password={pw.password} />
          </div>
          <PasswordField
            label="Confirm new password"
            autoComplete="new-password"
            value={pw.rePassword}
            onChange={(e) => setPw((p) => ({ ...p, rePassword: e.target.value }))}
            error={wErrors.rePassword}
          />
          <div>
            <Button type="submit" variant="secondary" loading={savingPw} loadingLabel="Changing password">
              Change password
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
