# Lavéra owner dashboard setup

This setup connects the public gallery to Supabase and gives the owner a private dashboard at `/admin`. The site uses a Supabase **publishable** key in the browser; never put a Supabase secret/service-role key in this React app.

## 1. Create the Supabase project

1. Open [Supabase](https://supabase.com/dashboard) and create a project for Lavéra.
2. In the project dashboard, open **Connect** (or **Project Settings → API Keys**) and copy the **Project URL** and **Publishable key**. The publishable key begins with `sb_publishable_`. An existing project may also show the older `anon` key; that works too.
3. In the project, open **SQL Editor → New query**. Open `supabase/setup.sql` from this code project, copy all of its contents into the SQL Editor, and press **Run**. This creates the product table, enquiry table, private owner allowlist, product image bucket, access rules, and four demo catalog entries.

## 2. Create and approve the owner login (no invitation required)

1. In Supabase, open **Authentication → Users → Add user → Create new user**. Enter the owner's email and a temporary password you make for her. Confirm the email in the form if Supabase offers that option. The login screen does not have a public sign-up button.
2. Copy the user’s **UUID/ID** from the Users list.
3. In **SQL Editor**, run this query after replacing the example UUID with that user’s ID:

   ```sql
   insert into public.admin_users (user_id)
   values ('PASTE-OWNER-USER-UUID-HERE')
   on conflict (user_id) do nothing;
   ```

Only users in this allowlist can manage products or read enquiries. Do not add customer accounts here. Give the temporary password to the owner privately. She can sign in with her email and temporary password, then open **Account settings** in the control panel to change it. Supabase Auth manages the password securely; this project never stores it as readable text.

## 3. Add keys for local development

Copy `.env.example` to a new file named `.env.local` in the project root. Replace the placeholder values:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_key
```

Get the Web3Forms access key from [Web3Forms](https://web3forms.com/) using the Gmail inbox that should receive enquiries. It is a public client-side form key, not a Gmail password. The Supabase publishable key is also meant for browser use; database permissions are enforced by the SQL security policies.

Restart the Vite server after editing `.env.local` (stop the running terminal with **Ctrl+C**, then run `npm run dev`). Open `/admin` on the local site and sign in as the approved owner.

## 4. Configure Netlify

In Netlify, open the Lavéra site → **Project configuration → Environment variables**. Add the same three variable names and their real values. Do not put these values in `netlify.toml` or commit `.env.local`. Trigger a new deploy after adding them; Vite reads these values while building the site.

The owner dashboard will be at `https://YOUR-SITE.netlify.app/admin` (or `https://YOUR-SITE.netlify.app/#admin`). The public website stays at the regular homepage.

## 5. Check everything

1. Visit the public site. Once connected, its product cards should load from Supabase instead of the local sample list.
2. Visit `/admin`, sign in, and add a product. The reference is generated from its category; add details and upload multiple product photos. The first photo is the cover image.
3. Submit a test enquiry from the public site. It should appear in **Message center** and be emailed to the Gmail attached to the Web3Forms key. Change the message status in the dashboard and use **Reply** to open an email to the customer.

If the project credentials or SQL setup are missing, the public gallery falls back to the local demo catalog and the admin page shows setup guidance. The dashboard cannot be fully tested until you create the Supabase project, run the SQL, and add the owner user.
