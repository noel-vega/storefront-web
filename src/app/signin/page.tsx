"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiError } from "@ordersail/storefront-sdk";
import { createStorefrontClient } from "@/lib/storefront";
import { getStoredCartToken, setStoredCartToken } from "@/lib/cart-token";

export default function SignInPage() {
  const router = useRouter();
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
      await storefront.signIn({ email, password });
      setStoredCartToken(storefront.cartToken);
      router.push("/account");
    } catch (error) {
      setStatus("error");
      // signIn's 401 carries no response body — error.message would just be
      // the generic "Request failed (401)" fallback, so write real copy
      setErrorMessage(
        error instanceof ApiError && error.status === 401
          ? "Incorrect email or password."
          : "Couldn't sign you in — try again.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-12">
      <h1 className="text-2xl font-medium">Sign in</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
          {status === "submitting" ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-black/60 dark:text-white/60">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
