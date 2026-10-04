"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Customer } from "@ordersail/storefront-sdk";
import { getStorefrontClient } from "@/lib/storefront";

export default function AccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | undefined>(undefined);
  const [loadError, setLoadError] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [signingOut, setSigningOut] = useState(false);

  // Safe to run twice (StrictMode's double-invoked effect): the tab shares
  // one client, and the SDK shares its token refresh between concurrent
  // calls — see getStorefrontClient.
  useEffect(() => {
    let cancelled = false;

    getStorefrontClient()
      .customer.get()
      .then((result) => {
        if (cancelled) return;
        // not currently signed in (no restored refresh token, or it's
        // expired/revoked) — nothing to show here
        if (!result) {
          router.replace("/signin");
          return;
        }
        setCustomer(result);
        setFirstName(result.firstName);
        setLastName(result.lastName);
        setEmail(result.email);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaveStatus("saving");
    try {
      const storefront = getStorefrontClient();
      const updated = await storefront.customer.update({
        firstName,
        lastName,
        email,
      });
      setCustomer(updated);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    const storefront = getStorefrontClient();
    await storefront.logout();
    router.push("/");
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-sm px-6 py-12 text-center">
        <h1 className="text-2xl font-medium">
          Couldn&apos;t load your account
        </h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Something went wrong — try refreshing the page.
        </p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="mx-auto max-w-sm px-6 py-12 text-center text-sm text-black/60 dark:text-white/60">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-12">
      <h1 className="text-2xl font-medium">Your account</h1>
      <Link
        href="/account/orders"
        className="mt-2 inline-block text-sm underline"
      >
        Order history
      </Link>
      <form onSubmit={handleSave} className="mt-8 space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            required
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-1/2 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
          />
          <input
            type="text"
            required
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-1/2 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
          />
        </div>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        />
        {saveStatus === "error" ? (
          <p className="text-sm text-red-600">
            Couldn&apos;t save your changes — try again.
          </p>
        ) : null}
        {saveStatus === "saved" ? (
          <p className="text-sm text-black/60 dark:text-white/60">Saved.</p>
        ) : null}
        <button
          type="submit"
          disabled={saveStatus === "saving"}
          className="w-full rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          {saveStatus === "saving" ? "Saving…" : "Save changes"}
        </button>
      </form>
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="mt-6 text-sm text-black/60 hover:underline disabled:opacity-50 dark:text-white/60"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
