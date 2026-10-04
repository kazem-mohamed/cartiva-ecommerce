"use client";

import { MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/ds/commerce/EmptyState";
import { cleanPhone, deleteAddress, EG_MOBILE, listAddresses, saveAddress, type Address } from "@/ds/data/account";
import { Button } from "@/ds/ui/Button";
import { Field } from "@/ds/ui/Field";
import { IconButton } from "@/ds/ui/IconButton";
import { Sheet } from "@/ds/ui/Sheet";

type Draft = { name: string; details: string; city: string; phone: string };
type Errors = Partial<Record<keyof Draft, string>>;
const BLANK: Draft = { name: "", details: "", city: "", phone: "" };

function check(d: Draft): Errors {
  const e: Errors = {};
  if (!d.name.trim()) e.name = "Give it a name, like Home or Work.";
  if (!d.details.trim()) e.details = "Enter the street, building and apartment.";
  if (!d.city.trim()) e.city = "Enter the city.";
  if (!EG_MOBILE.test(cleanPhone(d.phone))) e.phone = "Enter an Egyptian mobile number, e.g. 01012345678.";
  return e;
}

function AddressForm({ initial, busy, onSubmit, onCancel }: { initial: Draft; busy: boolean; onSubmit: (d: Draft) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const set = (k: keyof Draft, v: string) => {
    setDraft((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };
  function submit(e: FormEvent) {
    e.preventDefault();
    const errs = check(draft);
    setErrors(errs);
    if (!Object.keys(errs).length) onSubmit({ ...draft, phone: cleanPhone(draft.phone) });
  }
  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <Field label="Name" placeholder="Home" value={draft.name} onChange={(e) => set("name", e.target.value)} error={errors.name} data-autofocus />
      <Field label="Street address" autoComplete="street-address" placeholder="Building, street, apartment" value={draft.details} onChange={(e) => set("details", e.target.value)} error={errors.details} />
      <Field label="City" autoComplete="address-level2" placeholder="Cairo" value={draft.city} onChange={(e) => set("city", e.target.value)} error={errors.city} />
      <Field
        label="Mobile"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="01012345678"
        value={draft.phone}
        onChange={(e) => set("phone", e.target.value)}
        error={errors.phone}
        hint="The courier calls this number."
      />
      <div className="mt-2 flex flex-wrap gap-3">
        <Button type="submit" loading={busy} loadingLabel="Saving address">
          Save address
        </Button>
        <Button type="button" variant="text" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function AddressesPage() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;
  const [list, setList] = useState<Address[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let live = true;
    listAddresses(token)
      .then((l) => live && setList(l))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [token]);

  async function save(d: Draft) {
    if (!token || !editing) return;
    setSaving(true);
    try {
      const next = await saveAddress(token, d, editing === "new" ? undefined : editing._id);
      setList(next.length ? next : await listAddresses(token));
      toast(editing === "new" ? "Address added." : "Address updated.");
      setEditing(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!token) return;
    setRemoving(id);
    try {
      setList(await deleteAddress(token, id));
      toast("Address removed.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setRemoving(null);
      setConfirming(null);
    }
  }

  const header = (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-3">
        <h1 className="t-h1">Addresses</h1>
        <p className="t-body-lg text-fg-2">Saved here, one tap at checkout.</p>
      </div>
      {list && list.length > 0 && (
        <Button variant="secondary" leadingIcon={<Plus aria-hidden strokeWidth={1.5} />} onClick={() => setEditing("new")}>
          Add address
        </Button>
      )}
    </header>
  );

  return (
    <div className="grid gap-10">
      {header}

      {failed && !list ? (
        <EmptyState className="py-10" title="Your addresses didn't load." body="Refresh the page to try again." />
      ) : !list ? (
        <div role="status" aria-label="Loading your addresses" className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-40 rounded-card" />
          ))}
        </div>
      ) : !list.length ? (
        <EmptyState
          className="py-10"
          title="No saved addresses."
          body="Add one and checkout fills itself in."
          action={
            <Button leadingIcon={<Plus aria-hidden strokeWidth={1.5} />} onClick={() => setEditing("new")}>
              Add address
            </Button>
          }
        />
      ) : (
        <ul className="enter grid gap-3 sm:grid-cols-2">
          {list.map((a) => (
            <li key={a._id} className="grid content-between gap-6 rounded-card border border-line p-6">
              <div className="flex items-start gap-3">
                <MapPin aria-hidden size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-fg-3" />
                <div className="grid min-w-0 gap-1">
                  <h2 className="t-label">{a.name || a.city}</h2>
                  <p className="t-body text-fg-2">
                    {a.details}, {a.city}
                  </p>
                  <p className="t-caption t-num text-fg-3">{a.phone}</p>
                </div>
              </div>
              {confirming === a._id ? (
                <div role="group" aria-label={`Confirm removing ${a.name || "this address"}`} className="enter flex flex-wrap items-center gap-3">
                  <span className="t-caption text-fg-2">Remove this address?</span>
                  <Button variant="danger" onClick={() => remove(a._id)} loading={removing === a._id} loadingLabel="Removing">
                    Remove
                  </Button>
                  <Button variant="text" onClick={() => setConfirming(null)} autoFocus>
                    Keep
                  </Button>
                </div>
              ) : (
                <div className="-ml-3 flex gap-1">
                  <Button variant="text" className="px-3" leadingIcon={<Pencil aria-hidden strokeWidth={1.5} />} onClick={() => setEditing(a)}>
                    Edit
                  </Button>
                  <Button variant="text" className="px-3" leadingIcon={<Trash2 aria-hidden strokeWidth={1.5} />} onClick={() => setConfirming(a._id)}>
                    Remove
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Sheet open={editing !== null} onClose={() => setEditing(null)} labelledBy="address-title">
        <div className="flex items-center border-b border-line px-6 py-4">
          <h2 id="address-title" className="t-h3">
            {editing === "new" ? "New address" : "Edit address"}
          </h2>
          <IconButton label="Close" icon={<X strokeWidth={1.5} aria-hidden />} onClick={() => setEditing(null)} className="-mr-2 ml-auto" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {editing !== null && (
            <AddressForm
              key={editing === "new" ? "new" : editing._id}
              initial={editing === "new" ? BLANK : { name: editing.name ?? "", details: editing.details, city: editing.city, phone: editing.phone }}
              busy={saving}
              onSubmit={save}
              onCancel={() => setEditing(null)}
            />
          )}
        </div>
      </Sheet>
    </div>
  );
}
