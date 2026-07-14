# Launch setup — web (Firebase) + payment (Lemon Squeezy)

This describes the manual steps only *you* can do (they need your accounts/login).
The code and config are already in place.

---

## Part A — Put the app on the web (Firebase Hosting)

Firebase CLI is already installed locally, so every command below uses `npx firebase`.

1. **Create a Firebase project** (free)
   - Go to <https://console.firebase.google.com> → **Add project**.
   - Name it e.g. `joaca-si-invata`. Google Analytics is optional (not needed).
   - After it's created, note the **Project ID** (shown under the name, e.g.
     `joaca-si-invata` or `joaca-si-invata-1234`).

2. **Log in** (opens a browser)
   ```bash
   npx firebase login
   ```

3. **Point this repo at your project** — replace the placeholder in `.firebaserc`:
   ```bash
   npx firebase use --add     # pick your project, alias it "default"
   ```
   (This rewrites `.firebaserc` for you.)

4. **Build + deploy**
   ```bash
   npm run build
   npx firebase deploy
   ```
   The CLI prints your live URL, e.g. `https://joaca-si-invata.web.app`.
   That URL is also your **privacy policy** host: `…/privacy.html`.

Re-deploy any time by repeating step 4.

---

## Part B — Turn on payments (Lemon Squeezy)

Until this is done, the app is live and the free games work; the unlock button
just points at a placeholder.

1. **Create a store** at <https://lemonsqueezy.com> (free; they take a cut per sale).
   - Business/website URL: use your Firebase URL from Part A (or leave blank for now).

2. **Create the product**
   - New product → name it (e.g. “Joacă și Învață — acces complet”).
   - Price: **3,99 $** (or your chosen tier). One-time (not subscription).
   - **Enable License Keys** for the product. Set **Activation limit = 5**
     (matches `ACTIVATION_LIMIT` in `src/lib/config.ts`).

3. **Copy the checkout link**
   - Product → **Share** → copy the “Buy” URL
     (looks like `https://YOURSTORE.lemonsqueezy.com/buy/xxxxxxxx-…`).

4. **Paste it into the app** — edit `src/lib/config.ts`:
   ```ts
   export const CHECKOUT_URL = 'https://YOURSTORE.lemonsqueezy.com/buy/xxxxxxxx-…'
   ```
   (Also confirm `PRICE_LABEL` matches the price you set.)

5. **Rebuild + redeploy**
   ```bash
   npm run build && npx firebase deploy
   ```

### How a customer flows through it
1. Taps a locked game or the “Deblochează tot” banner → paywall.
2. Taps **Cumpără** → Lemon Squeezy checkout (in a new tab) → pays.
3. Gets a **license key** on screen + by email.
4. Back in the app → **“Introdu cheia” → Activează** → unlocked.
5. New device / new browser → enters the same key again (up to 5 devices).

### Free testing without paying
In Lemon Squeezy you can **manually generate a license key** for a product
(License Keys → create). Use it in the app’s “Introdu cheia” box to test the full
unlock, and to hand free access to family/reviewers.

---

## Reference

- **Free games (9):** colors, counting, shapes, animals, memory, letters, digits,
  bubbles, coloring.
- **Premium (32):** everything else. Edit the free set in `src/lib/entitlement.ts`
  (`FREE_GAMES`).
- **Kill switch:** set `PAYWALL_ENABLED = false` in `src/lib/config.ts` to make the
  whole app free (e.g. during development), then rebuild.
- Unlock state is stored in the browser under `ji_unlocked` / `ji_license_key`.
