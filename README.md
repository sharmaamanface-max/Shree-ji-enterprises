# Shree Ji Enterprises — store + admin starter

This is a static storefront with a separate admin page. Supabase provides authentication, database, image storage and order records. The project is not live until you configure and deploy it.

## Files
- `index.html` — public mobile-friendly catalogue, cart and WhatsApp order handoff.
- `admin.html` — protected admin login, product add/edit/delete, image upload, price/stock management and order status.
- `config.js` — your Supabase URL, anon/public key and WhatsApp number.
- `store.js`, `admin.js`, `style.css` — site logic and styling.
- `supabase-setup.sql` — tables and row-level security policies.

## 1. Create a free Supabase project
1. Create a project at https://supabase.com and keep the database password private.
2. In Project Settings → API (or Connect), copy the Project URL and **anon/public** key.
3. Put them into `config.js`. Never put a `service_role` or secret key in browser files.
4. Set `WHATSAPP_NUMBER` to your business number, digits only with country code, e.g. `919876543210`.

## 2. Set up the database
1. In Supabase → SQL Editor → New query, paste all of `supabase-setup.sql` and run it.
2. In Supabase → Authentication → Users, create your admin user (email + strong password). If available, disable public sign-ups after creating the admin.
3. Copy the admin user's UUID from Authentication → Users.
4. In SQL Editor run this, replacing the example UUID with the actual user UUID:
   `insert into public.admins (user_id) values ('PASTE-ADMIN-USER-UUID-HERE');`
5. Sign in at `admin.html`. Only UUIDs added to `public.admins` can manage products and see orders.

## 3. Add real products
Open Admin login → sign in → fill product name, category, wholesale price, stock and unit. Select a JPG/PNG/WEBP photo (max 5 MB) or paste an image URL. Save. The public catalogue reads active products from Supabase.
- Sample rates in the demo catalogue are placeholders. Replace them with your actual wholesale rates before publishing.
- Stock is displayed and checked when adding to the cart, but this starter does not reserve/decrement stock automatically.
- Orders are WhatsApp handoffs and also saved in Supabase when configured. Online payments are not included.
- Public order inserts are intentionally enabled so visitors can submit orders; add server-side validation/rate limiting before large-scale public use.

## 4. Deploy free
Recommended simple option: GitHub Pages (free for public repositories).
1. Create a GitHub repository and upload all project files (not your Supabase database password).
2. In repository Settings → Pages, deploy from the `main` branch / root folder.
3. Open the published URL and test storefront and `/admin.html`.
Alternative: Netlify or Cloudflare Pages free static hosting; connect the repository and deploy the root directory.
Do not upload secrets. `config.js` contains only the public anon key; database security comes from RLS policies.

## Important security checks
- Use a unique strong admin password and enable MFA for the Supabase account where available.
- Do not share admin credentials or add unknown user UUIDs to `public.admins`.
- Test in a private browser: public users should see active products but must not be able to add/edit/delete products or read orders.
- The SQL uses RLS to protect admin operations. Public order submissions are allowed by design; the browser cannot securely prove that client-submitted order totals match prices. Confirm every order before fulfilling.
- This is a starter implementation, not a managed service or a guarantee of production security. Review policies and add rate limiting/server-side order validation if traffic grows.
