// ─────────────────────────────────────────────────────────────────────────────
// Purchase / unlock configuration.
//
// Fill these three values in after creating your Lemon Squeezy store + product.
// Everything else in the app reads from here, so this is the ONLY file you edit
// to go from "test mode" to "live selling".
//
// Setup steps live in SETUP.md at the repo root.
// ─────────────────────────────────────────────────────────────────────────────

// The hosted checkout URL for the "unlock everything" product.
// Lemon Squeezy → Products → your product → Share → copy the checkout link.
// Looks like: https://YOURSTORE.lemonsqueezy.com/buy/xxxxxxxx-xxxx-xxxx-...
export const CHECKOUT_URL = 'https://YOURSTORE.lemonsqueezy.com/buy/REPLACE_ME'

// Displayed price. The REAL charge is whatever the checkout page says — this is
// only the label shown on the unlock button, so keep them in sync yourself.
export const PRICE_LABEL = '14,99 lei'

// How many devices one purchased key may activate before Lemon Squeezy refuses
// further activations. Set this on the product in Lemon Squeezy too (Activation
// limit). Here it is only used for the message we show the user.
export const ACTIVATION_LIMIT = 5

// Set to false to bypass the paywall entirely (e.g. local development, or if you
// decide to make the whole web version free after all). When false, everything
// is unlocked and no purchase UI is shown.
export const PAYWALL_ENABLED = true
