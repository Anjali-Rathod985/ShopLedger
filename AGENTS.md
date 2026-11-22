# ShopLedger guidance

## Stack
- Node.js CommonJS application using Express 4 and body-parser.
- Browser UI is static HTML, CSS, and JavaScript served from `public/`.
- Runtime data is stored in `data/db.json` through `lib/store.js`.

## Module map
- `routes/products.js` — product and active coupon API.
- `routes/orders.js` — order listing, creation, and cancellation API.
- `routes/customers.js` — customer listing and Khata settlement API.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and export API.
- `lib/coupons.js` — coupon lookup, validation, and discount calculation.
- `lib/dates.js` — date formatting, normalization, and fiscal year helpers.
- `lib/inventory.js` — product lookup, stock checks, reservation, and summaries.
- `lib/invoice.js` — invoice figures and printable HTML rendering.
- `lib/ledger.js` — customer balances, Khata charges, reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtering.
- `lib/pricing.js` — subtotal, coupon discount, and GST-inclusive totals.
- `lib/reports.js` — dashboard summary and GST reconciliation.
- `lib/store.js` — JSON database read/write and audit log updates.
- `lib/tax.js` — GST rate resolution and CGST/SGST split.

## Commands
- Start the app: `npm start` (runs `node server.js`).
- Run tests: `node --test`.

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; they use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
Invoice total and GST breakdown do not match what the customer was billed. Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
