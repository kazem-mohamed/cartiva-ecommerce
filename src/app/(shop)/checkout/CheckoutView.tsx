"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useCommerce } from "@/ds/commerce/CommerceProvider";
import { EmptyState } from "@/ds/commerce/EmptyState";
import type { CartLine } from "@/ds/commerce/types";
import {
  cleanPhone,
  EG_MOBILE,
  listAddresses,
  placeCashOrder,
  startCardCheckout,
  type Address,
  type Order,
  type ShippingAddress,
} from "@/ds/data/account";
import { Button, ButtonLink } from "@/ds/ui/Button";
import { RadioCard } from "@/ds/ui/Choice";
import { Field } from "@/ds/ui/Field";
import { formatEGP } from "@/ds/ui/Price";
import { ProductShot } from "@/ds/ui/ProductShot";

type Payment = "cash" | "card";
type Errors = Partial<Record<keyof ShippingAddress, string>>;
const EMPTY: ShippingAddress = { city: "", details: "", phone: "" };

function check(field: keyof ShippingAddress, value: string) {
  const v = value.trim();
  if (field === "city") return v ? "" : "Enter your city.";
  if (field === "details") return v ? "" : "Enter the street, building and apartment.";
  if (!v) return "Enter a mobile number for the courier.";
  return EG_MOBILE.test(cleanPhone(v)) ? "" : "Enter an Egyptian mobile number, e.g. 01012345678.";
}

function Step({ n, title, children, aside }: { n: number; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="grid gap-6 border-t border-line pt-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={`step-${n}`} className="flex items-baseline gap-3 t-h3">
          <span className="t-label t-num text-fg-3">{n}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function OrderLines({ lines }: { lines: CartLine[] }) {
  return (
    <ul className="grid gap-4">
      {lines.map((l) => (
        <li key={l.productId} className="flex items-center gap-4">
          <ProductShot src={l.image} alt="" sizes="48px" className="w-12 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 t-body">{l.title}</p>
            <p className="t-caption t-num text-fg-3">
              {l.count} × {formatEGP(l.price)}
            </p>
          </div>
          <p className="shrink-0 t-body t-num">{formatEGP(l.price * l.count)}</p>
        </li>
      ))}
    </ul>
  );
}

function Placed({ order, lines, total, address }: { order: Order | null; lines: CartLine[]; total: number; address: ShippingAddress }) {
  return (
    <div className="mx-auto grid max-w-xl gap-10 py-16 lg:py-24">
      <div className="grid justify-items-start gap-5">
        <span className="grid size-14 place-items-center rounded-full bg-fg text-canvas lights-on">
          <Check aria-hidden size={26} strokeWidth={1.75} />
        </span>
        <h1 className="t-display">Order placed.</h1>
        <p className="t-body-lg text-fg-2">
          {order?.id != null && (
            <>
              Order <span className="t-num text-fg">#{order.id}</span> ·{" "}
            </>
          )}
          Cash on delivery · <span className="t-num text-fg">{formatEGP(order?.totalOrderPrice ?? total)}</span>
        </p>
      </div>
      <dl className="grid gap-6 border-y border-line py-8 sm:grid-cols-2">
        <div className="grid gap-1">
          <dt className="t-caption text-fg-3">Delivering to</dt>
          <dd className="t-body">
            {address.details}, {address.city}
          </dd>
        </div>
        <div className="grid gap-1">
          <dt className="t-caption text-fg-3">Courier will call</dt>
          <dd className="t-body t-num">{address.phone}</dd>
        </div>
      </dl>
      <OrderLines lines={lines} />
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/orders" size="lg">
          View your orders
        </ButtonLink>
        <ButtonLink href="/products" size="lg" variant="secondary">
          Keep shopping
        </ButtonLink>
      </div>
    </div>
  );
}

export function CheckoutView() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;
  const { cart, cartStatus, signedIn, refreshCart } = useCommerce();

  const [saved, setSaved] = useState<Address[] | null>(null);
  const [choice, setChoice] = useState<string>("new");
  const [form, setForm] = useState<ShippingAddress>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [payment, setPayment] = useState<Payment>("cash");
  const [sending, setSending] = useState(false);
  const [placed, setPlaced] = useState<{ order: Order | null; lines: CartLine[]; total: number; address: ShippingAddress } | null>(null);

  useEffect(() => {
    if (!token) return;
    let live = true;
    listAddresses(token)
      .then((list) => {
        if (!live) return;
        setSaved(list);
        if (list.length) setChoice(list[0]._id);
      })
      .catch(() => live && setSaved([]));
    return () => {
      live = false;
    };
  }, [token]);

  const total = cart.totalAfterDiscount ?? cart.subtotal;
  const picked = saved?.find((a) => a._id === choice);

  if (placed) return <Placed {...placed} />;

  if (!signedIn && cartStatus === "ready") {
    return (
      <EmptyState
        heading="h1"
        className="py-20"
        title="Sign in to check out."
        body="Orders are placed from your account's bag."
        action={<ButtonLink href="/login?callbackUrl=/checkout">Sign in</ButtonLink>}
      />
    );
  }
  if (cartStatus !== "ready" && !cart.lines.length) {
    return (
      <div role="status" aria-label="Loading checkout" className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
        <div className="grid content-start gap-4">
          <div className="skeleton h-10 w-48 rounded-pill" />
          <div className="skeleton h-40 rounded-card" />
          <div className="skeleton h-40 rounded-card" />
        </div>
        <div className="skeleton h-96 rounded-card" />
      </div>
    );
  }
  if (!cart.lines.length) {
    return (
      <EmptyState
        heading="h1"
        className="py-20"
        title="Nothing to check out."
        body="Your bag is empty, so there's no order to place yet."
        action={<ButtonLink href="/products">Browse products</ButtonLink>}
      />
    );
  }

  const set = (field: keyof ShippingAddress, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    // Clear an error the moment it's fixed; never raise a new one mid-typing.
    if (errors[field] && !check(field, value)) setErrors((e) => ({ ...e, [field]: undefined }));
  };
  const blur = (field: keyof ShippingAddress) => setErrors((e) => ({ ...e, [field]: check(field, form[field]) || undefined }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (sending || !token) return;
    if (!cart.id) {
      toast.error("Your bag is still loading. Try again in a moment.");
      return;
    }
    let address: ShippingAddress;
    if (picked) {
      address = { city: picked.city, details: picked.details, phone: cleanPhone(picked.phone) };
    } else {
      const next: Errors = {};
      (Object.keys(EMPTY) as (keyof ShippingAddress)[]).forEach((f) => {
        const msg = check(f, form[f]);
        if (msg) next[f] = msg;
      });
      setErrors(next);
      const first = (Object.keys(next) as (keyof ShippingAddress)[])[0];
      if (first) {
        document.getElementById(`ship-${first}`)?.focus();
        return;
      }
      address = { city: form.city.trim(), details: form.details.trim(), phone: cleanPhone(form.phone) };
    }

    setSending(true);
    try {
      if (payment === "card") {
        window.location.href = await startCardCheckout(token, cart.id, address, window.location.origin);
        return;
      }
      const snapshot = { lines: cart.lines, total };
      const order = await placeCashOrder(token, cart.id, address);
      setPlaced({ order, address, ...snapshot });
      window.scrollTo({ top: 0 });
      void refreshCart(); // the order consumed the bag
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed. Try again.");
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="enter grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-16 lg:py-14">
      <div className="grid gap-12">
        <h1 className="t-h1">Checkout</h1>

        <Step
          n={1}
          title="Delivery"
          aside={
            saved && saved.length > 0 ? (
              <Link href="/profile/addresses" className="t-caption text-fg-2 underline decoration-line-strong underline-offset-4 hover:text-fg">
                Manage addresses
              </Link>
            ) : null
          }
        >
          {token && saved === null ? (
            <div className="skeleton h-24 rounded-card" aria-label="Loading saved addresses" role="status" />
          ) : (
            <div className="enter grid gap-6">
              {saved && saved.length > 0 && (
                <fieldset className="grid gap-3 sm:grid-cols-2">
                  <legend className="sr-only">Deliver to</legend>
                  {saved.map((a) => (
                    <RadioCard
                      key={a._id}
                      name="address"
                      value={a._id}
                      checked={choice === a._id}
                      onChange={() => setChoice(a._id)}
                      title={a.name || a.city}
                      body={
                        <>
                          {a.details}, {a.city}
                          <span className="mt-1 block t-num text-fg-3">{a.phone}</span>
                        </>
                      }
                    />
                  ))}
                  <RadioCard name="address" value="new" checked={choice === "new"} onChange={() => setChoice("new")} title="A new address" body="Enter it below." />
                </fieldset>
              )}
              {!picked && (
                <div className="enter grid gap-5 sm:grid-cols-2">
                  <Field
                    id="ship-details"
                    className="sm:col-span-2"
                    label="Street address"
                    required
                    autoComplete="street-address"
                    placeholder="Building, street, apartment"
                    value={form.details}
                    onChange={(e) => set("details", e.target.value)}
                    onBlur={() => blur("details")}
                    error={errors.details}
                  />
                  <Field
                    id="ship-city"
                    label="City"
                    required
                    autoComplete="address-level2"
                    placeholder="Cairo"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    onBlur={() => blur("city")}
                    error={errors.city}
                  />
                  <Field
                    id="ship-phone"
                    label="Mobile"
                    required
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="01012345678"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    onBlur={() => blur("phone")}
                    error={errors.phone}
                    hint="The courier calls this number."
                  />
                </div>
              )}
            </div>
          )}
        </Step>

        <Step n={2} title="Payment">
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Pay with</legend>
            <RadioCard name="payment" value="cash" checked={payment === "cash"} onChange={() => setPayment("cash")} title="Cash on delivery" body="Pay the courier when it arrives." />
            <RadioCard name="payment" value="card" checked={payment === "card"} onChange={() => setPayment("card")} title="Card" body="On Stripe's secure payment page." />
          </fieldset>
        </Step>
      </div>

      <aside aria-labelledby="step-3" className="grid gap-6 rounded-card bg-surface p-6 sm:p-8 lg:sticky lg:top-8">
        <h2 id="step-3" className="flex items-baseline gap-3 t-h3">
          <span className="t-label t-num text-fg-3">3</span>
          Review
        </h2>
        <OrderLines lines={cart.lines} />
        <dl className="grid gap-3 border-t border-line pt-5 t-body">
          <div className="flex justify-between gap-4">
            <dt className="text-fg-2">Subtotal</dt>
            <dd className="t-num">{formatEGP(cart.subtotal)}</dd>
          </div>
          {cart.totalAfterDiscount !== null && (
            <div className="flex justify-between gap-4">
              <dt className="text-fg-2">Coupon</dt>
              <dd className="t-num">−{formatEGP(cart.subtotal - cart.totalAfterDiscount)}</dd>
            </div>
          )}
          <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-5">
            <dt className="t-label">Total</dt>
            <dd className="t-h3 t-num">{formatEGP(total)}</dd>
          </div>
        </dl>
        <p className="t-caption text-fg-3">Delivery is arranged after the order is placed and isn&apos;t included above.</p>
        <Button type="submit" size="lg" fullWidth loading={sending} loadingLabel={payment === "cash" ? "Placing order" : "Opening payment"}>
          {payment === "cash" ? `Place order · ${formatEGP(total)}` : "Continue to payment"}
        </Button>
      </aside>
    </form>
  );
}
