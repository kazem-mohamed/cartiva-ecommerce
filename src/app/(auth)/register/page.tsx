"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { cleanPhone, EG_MOBILE } from "@/ds/data/account";
import { Button } from "@/ds/ui/Button";
import { Checkbox } from "@/ds/ui/Choice";
import { Field } from "@/ds/ui/Field";
import { PasswordField, PasswordStrength } from "@/ds/ui/PasswordField";
import { callbackTarget } from "../callback";

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your name."),
    email: z.string().email("Enter a valid email address."),
    phone: z.string().refine((v) => EG_MOBILE.test(cleanPhone(v)), "Enter an Egyptian mobile number, e.g. 01012345678."),
    password: z.string().min(8, "Use at least 8 characters."),
    rePassword: z.string().min(1, "Type the password again."),
    terms: z.boolean().refine((v) => v, "Accept the terms to create an account."),
  })
  .refine((v) => v.password === v.rePassword, { message: "The passwords don't match.", path: ["rePassword"] });
type Values = z.infer<typeof schema>;

const SIGNUP_API = "https://ecommerce.routemisr.com/api/v1/auth/signup";

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useSession();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "", rePassword: "", terms: false },
  });
  const password = useWatch({ control, name: "password" });

  useEffect(() => {
    if (status === "authenticated") router.replace(callbackTarget());
  }, [status, router]);

  async function onSubmit(values: Values) {
    setFormError("");
    try {
      const res = await fetch(SIGNUP_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email,
          phone: cleanPhone(values.phone),
          password: values.password,
          rePassword: values.rePassword,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setFormError(data?.message ?? "We couldn't create the account. Try again.");
        return;
      }
    } catch {
      setFormError("We couldn't reach the store. Check your connection and try again.");
      return;
    }

    const login = await signIn("credentials", { redirect: false, email: values.email, password: values.password });
    if (login?.error) {
      toast("Account created. Sign in to continue.");
      router.push("/login");
      return;
    }
    toast("Welcome to Cartiva.");
    router.push(callbackTarget());
  }

  return (
    <div className="grid gap-10">
      <header className="grid gap-3">
        <h1 className="t-h1">Create an account</h1>
        <p className="t-body-lg text-fg-2">One account for your bag, wishlist, addresses and orders.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
        <Field label="Name" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <Field
          label="Mobile"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="01012345678"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <div className="grid gap-2.5">
          <PasswordField label="Password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
          <PasswordStrength password={password} />
        </div>
        <PasswordField label="Confirm password" autoComplete="new-password" error={errors.rePassword?.message} {...register("rePassword")} />
        <div className="grid gap-1">
          {/* Plain text: this build has no terms or privacy pages to link to, and a link that goes nowhere breaks trust. */}
          <Checkbox
            label="I agree to the terms of service and privacy policy."
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? "terms-error" : undefined}
            {...register("terms")}
          />
          {errors.terms && (
            <p id="terms-error" role="alert" className="enter t-caption text-error">
              {errors.terms.message}
            </p>
          )}
        </div>
        {formError && (
          <p role="alert" className="enter t-body text-error">
            {formError}
          </p>
        )}
        <Button type="submit" size="lg" fullWidth loading={isSubmitting} loadingLabel="Creating your account" className="mt-2">
          Create account
        </Button>
      </form>

      <p className="border-t border-line pt-8 t-body text-fg-2">
        Already have an account?{" "}
        <Link href="/login" className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-current">
          Sign in
        </Link>
      </p>
    </div>
  );
}
