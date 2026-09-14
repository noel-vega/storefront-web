"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiError } from "@ordersail/storefront-sdk";
import { createStorefrontClient } from "@/lib/storefront";
import { getStoredCartToken, setStoredCartToken } from "@/lib/cart-token";

export default function SignUpPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    try {
      const storefront = createStorefrontClient(getStoredCartToken());
      await storefront.signUp({ firstName, lastName, email, password });
      setStoredCartToken(storefront.cartToken);
      router.push("/account");
    } catch (error) {
      setStatus("error");
      // signUp's 409 carries no response body — error.message would just be
      // the generic "Request failed (409)" fallback, so write real copy
      setErrorMessage(
        error instanceof ApiError && error.status === 409
          ? "An account with that email already exists."
          : "Couldn't create your account — try again.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-12">
      <h1 className="text-2xl font-medium">Create an account</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        />
        {status === "error" ? (
          <p className="text-sm text-red-600">{errorMessage}</p>
        ) : null}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          {status === "submitting" ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-black/60 dark:text-white/60">
        Already have an account?{" "}
        <Link href="/signin" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
