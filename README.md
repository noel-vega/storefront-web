# storefront-web

A minimal reference storefront built on [`@ordersail/storefront-sdk`](https://www.npmjs.com/package/@ordersail/storefront-sdk) — [OrderSail](https://ordersail.com)'s public storefront API. This is **not** a product OrderSail hosts for every merchant: a merchant signs up, gets an app key + this SDK, and forks/hosts their own storefront. This repo is the worked example of doing that.

Covers the core commerce loop: product listing, product detail, cart, and Stripe Embedded Checkout. It doesn't cover customer accounts, order history, or theming — those are left for you to build (or check the SDK's own repo for what's coming next on the platform side).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your app key + Stripe publishable key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

See `.env.example`. You need:

- `NEXT_PUBLIC_STOREFRONT_API_URL` — the storefront-api instance to talk to.
- `NEXT_PUBLIC_APP_KEY` — an account-scoped app key (Settings → Developer API keys in merchant-web). This is a publishable-style key, safe to ship in client code — see the SDK's README for why.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — your platform's Stripe test-mode publishable key.

### CORS

`storefront-api` only allows requests from origins an account has explicitly registered. Register wherever you're running this (e.g. `http://localhost:3000` for local dev) via the merchant-api storefront-origins endpoint before cart/checkout calls from the browser will work.

## Structure

- `src/app/page.tsx` — product listing (Server Component; calls storefront-api server-to-server, no CORS involved).
- `src/app/products/[id]/page.tsx` — product detail + variant picker.
- `src/app/cart/page.tsx` — cart contents, quantity/remove/clear (Client Component; calls storefront-api directly from the browser).
- `src/app/checkout/page.tsx` — Stripe Embedded Checkout.
- `src/app/checkout/return/page.tsx` — post-checkout status.
- `src/lib/storefront.ts` — `StorefrontClient` factory.
- `src/lib/cart-token.ts` — persists the cart token to `localStorage` across page loads.

## Learn more

- [`@ordersail/storefront-sdk` README](https://github.com/noel-vega/ordersail/tree/main/packages/storefront-sdk) — full resource reference, error-handling model, auth model.
- [Next.js documentation](https://nextjs.org/docs).
