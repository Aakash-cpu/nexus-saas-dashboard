# 🚀 Deployment Guide for Nexus SaaS Dashboard

This guide will help you deploy Nexus to production using **Render** (backend) and **Vercel** (frontend).

---

## Prerequisites

- GitHub account (with repo pushed)
- [Render](https://render.com) account (free)
- [Vercel](https://vercel.com) account (free)
- Your existing MongoDB Atlas database

---

## Step 1: Deploy Backend to Render

### 1.1 Create a New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select `Aakash-cpu/nexus-saas-dashboard` repository
5. Configure the service:
   - **Name**: `nexus-api`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 1.2 Add Environment Variables

Click **"Advanced"** and add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Generate another random string |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (sk_live_... or sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Leave blank for now, add after setting up webhook |
| `STRIPE_PRICE_PRO` | Your Stripe price ID for Pro plan |
| `STRIPE_PRICE_ENTERPRISE` | Your Stripe price ID for Enterprise plan |
| `FRONTEND_URL` | Will add after deploying frontend |

### 1.3 Deploy

Click **"Create Web Service"**. Wait for deployment (2-5 minutes).

Your API will be available at: `https://nexus-api.onrender.com`

> ⚠️ Note: Free tier services spin down after inactivity. First request may take 30-60 seconds.

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import `Aakash-cpu/nexus-saas-dashboard`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.2 Add Environment Variable

Add this environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://nexus-api.onrender.com/api` (your Render URL + /api) |

### 2.3 Deploy

Click **"Deploy"**. Wait 1-2 minutes.

Your frontend will be available at: `https://nexus-saas-dashboard.vercel.app`

---

## Step 3: Update Backend with Frontend URL

### 3.1 Update Render Environment Variable

1. Go to Render Dashboard → Your service → **"Environment"**
2. Add/Update:
   - `FRONTEND_URL`: `https://nexus-saas-dashboard.vercel.app`
3. Click **"Save Changes"** - service will redeploy

---

## Step 4: Configure Stripe for Production (Optional)

### 4.1 Set Up Webhook

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Endpoint URL: `https://nexus-api.onrender.com/api/billing/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (`whsec_...`)
7. Add to Render environment: `STRIPE_WEBHOOK_SECRET`

---

## Step 5: Update MongoDB Atlas Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to **"Network Access"**
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"** (or add Render's IP ranges)
5. Click **"Confirm"**

---

## 🎉 Your App is Live!

| Component | URL |
|-----------|-----|
| **Frontend** | `https://nexus-saas-dashboard.vercel.app` |
| **Backend API** | `https://nexus-api.onrender.com/api` |
| **Health Check** | `https://nexus-api.onrender.com/api/health` |

---

## Troubleshooting

### "Application error" on frontend
- Check that `VITE_API_URL` is correctly set
- Redeploy after adding environment variables

### "Failed to fetch" errors
- Check CORS: Ensure `FRONTEND_URL` is set correctly in Render
- Check if backend is running: Visit `/api/health`

### Database connection issues
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string is correct

### Stripe errors
- Ensure using live keys in production (or test keys for testing)
- Verify webhook secret is correct

---

## Custom Domain (Optional)

### Vercel (Frontend)
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records

### Render (Backend)
1. Go to Service Settings → Custom Domain
2. Add subdomain like `api.yourdomain.com`
3. Update DNS records

---

## Need Help?

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
