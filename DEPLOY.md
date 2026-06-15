# Deploying BSD Garage Supply to Railway

Your app runs as a **single service**: the Node/Express backend serves both the API
and the built React site on one port. Railway builds it automatically.

---

## 1. Create a Railway account
Go to **https://railway.app** → **Login** → sign up (GitHub or email). The Hobby plan
is ~$5/month and includes everything we need.

## 2. Create the project
- **New Project** → **Deploy from GitHub repo** (recommended) or **Empty Project** + CLI.
- Point it at this repository.

## 3. Add a persistent volume (IMPORTANT)
Your database and uploaded product photos must survive restarts.
- In the service → **Settings** → **Volumes** → **New Volume**
- **Mount path:** `/data`
- Size: 1 GB is plenty to start.

## 4. Set environment variables
Service → **Variables** → add these:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATA_DIR` | `/data` |
| `JWT_SECRET` | *(your long random secret — see below)* |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | *(your Railway URL, e.g. `https://bsd-production.up.railway.app` — update after first deploy)* |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `bsdgaragesupply@gmail.com` |
| `SMTP_PASS` | *(your Gmail App Password)* |
| `MAIL_FROM` | `BSD Garage Supply <bsdgaragesupply@gmail.com>` |
| `ADMIN_EMAIL` | `bsdgaragesupply@gmail.com` |
| `ADMIN_PASSWORD` | *(your admin login password)* |
| `STRIPE_SECRET_KEY` | *(add when you set up live payments)* |
| `STRIPE_WEBHOOK_SECRET` | *(add when you set up live payments)* |

> Railway sets `PORT` automatically — don't add it.

## 5. Deploy
Railway builds with:
- **Build:** `npm install && npm run build`
- **Start:** `node server/index.js`

On first boot the app auto-creates your admin account, categories, and all 35 products.

## 6. Get your live URL
Service → **Settings** → **Networking** → **Generate Domain**.
Copy that URL into the `CLIENT_URL` variable (step 4) and redeploy.

## 7. (Later) Connect your custom domain
Once you register a domain, add it under **Settings → Networking → Custom Domain**,
then point your domain's DNS (a CNAME) at the Railway target. Update `CLIENT_URL` to match.

---

### Notes
- **Updating the site later:** push to GitHub and Railway redeploys automatically.
- **Uploaded photos & database** live on the `/data` volume and persist across deploys.
- **Email** works as soon as the SMTP variables are set.
