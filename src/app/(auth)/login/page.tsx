"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/ds/ui/Button";
import { Field } from "@/ds/ui/Field";
import { PasswordField } from "@/ds/ui/PasswordField";
import { callbackTarget } from "../callback";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Passwords here are at least 6 characters."),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  useEffect(() => {
    if (status === "authenticated") router.replace(callbackTarget());
  }, [status, router]);

  async function onSubmit(values: Values) {
    setFormError("");
    const result = await signIn("credentials", { redirect: false, email: values.email, password: values.password });
    if (result?.error) {
      setFormError("That email and password don't match an account. Check them and try again.");
      return;
    }
    toast("Welcome back.");
    router.push(callbackTarget());
  }

  return (
    <div className="grid gap-10">
      <header className="grid gap-3">
        <h1 className="t-h1">Sign in</h1>
        <p className="t-body-lg text-fg-2">Your bag, wishlist and orders are waiting.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
        <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <div className="grid gap-2">
          <PasswordField label="Password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
          <Link href="/forget-password" className="justify-self-end t-caption text-fg-2 underline decoration-line-strong underline-offset-4 hover:text-fg">
            Forgot your password?
          </Link>
        </div>
        {formError && (
          <p role="alert" className="enter t-body text-error">
            {formError}
          </p>
        )}
        <Button type="submit" size="lg" fullWidth loading={isSubmitting} loadingLabel="Signing in" className="mt-2">
          Sign in
        </Button>
      </form>

      <p className="border-t border-line pt-8 t-body text-fg-2">
        New to Cartiva?{" "}
        <Link href="/register" className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-current">
          Create an account
        </Link>
      </p>
    </div>
  );
}
