# Hooda's Bakery — Production Deployment Guide

English & Hinglish deployment guide for your full-stack automated bakery application.

---

## Step 1: Push your code to GitHub (Code ko GitHub par upload karein)
Both **Render** and **Vercel** deploy directly from GitHub.
1. Create a free account on [GitHub](https://github.com).
2. Create a new **Private or Public Repository** named `bakery-automation`.
3. In your local terminal, initialize git and push the files:
   ```bash
   git init
   git add .
   git commit -m "feat: ready for production"
   git branch -M main
   git remote add origin https://github.com/your-username/bakery-automation.git
   git push -u origin main
   ```

---

## Step 2: Database Setup on MongoDB Atlas (Cloud Database Setup)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register a free account.
2. Create a new database project and choose the **Free Tier (M0 Cluster)**.
3. **Database Access:** Create a user with a username and password (keep these safe!).
4. **Network Access:** Under Security, add a new IP access entry. Choose **"Allow Access from Anywhere"** (`0.0.0.0/0`) so that Render can connect to it.
5. Go to Database -> Click **"Connect"** -> Select **"Drivers"** (Node.js).
6. Copy your connection URL. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/bakery?retryWrites=true&w=majority`
   *(Replace `<username>` and `<password>` with the database user details you created in Step 3).*

---

## Step 3: Deploy Backend on Render (Server and API Deployment)
1. Go to [Render](https://render.com) and log in using your GitHub account.
2. Click **New +** -> Select **Web Service**.
3. Connect your `bakery-automation` GitHub repository.
4. Set the following settings:
   - **Name:** `hoodas-bakery-backend`
   - **Root Directory:** `backend` (Ensure this is set to `backend` since our server files are in this folder!)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Click **Advanced** and add these Environment Variables (`.env` variables):
   - `PORT` = `5000`
   - `NODE_ENV` = `production`
   - `MONGO_URI` = *(Your MongoDB Atlas connection URL from Step 2)*
   - `JWT_SECRET` = *(Any random strong string, e.g. `bakerysecrettokenprod123!`)*
   - `EMAIL_USER` = *(Your Gmail Address)*
   - `EMAIL_PASS` = *(Your Gmail App Password)*
   - `EMAIL_FROM` = `Hooda's Bakery <your-email@gmail.com>`
   - `RAZORPAY_KEY_ID` = *(Your Razorpay Test Key ID)*
   - `RAZORPAY_KEY_SECRET` = *(Your Razorpay Test Key Secret)*
   - `FRONTEND_URL` = `https://your-customer-site.vercel.app` *(Copy this from Vercel after Step 4)*
   - `ADMIN_URL` = `https://your-admin-dashboard.vercel.app` *(Copy this from Vercel after Step 5)*
6. Click **Create Web Service**.
7. Once deployed, Render will provide you a live URL at the top left (e.g. `https://hoodas-bakery-backend.onrender.com`).
8. **Crucial Step:** Open `frontend/customer/js/config.js` on your computer, paste this URL into the placeholder, commit, and push it back to GitHub!
   ```javascript
    // config.js
    const CONFIG = {
      API_BASE: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : 'https://hoodas-bakery-backend.onrender.com/api' // <-- Render link here!
    };
   ```

---

## Step 4: Deploy Customer Frontend on Vercel
1. Go to [Vercel](https://vercel.com) and sign in with GitHub.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Configure these project settings:
   - **Framework Preset:** `Other` (or None)
   - **Root Directory:** `frontend/customer`
5. Click **Deploy**.
6. Vercel will give you a live URL (e.g., `https://hoodas-bakery.vercel.app`).
7. Paste this URL into your Render backend Environment Variables under `FRONTEND_URL`!

---

## Step 5: Deploy React Admin Dashboard on Vercel
1. In Vercel, click **Add New** -> **Project**.
2. Import your GitHub repository again.
3. Configure these project settings:
   - **Framework Preset:** `Vite` (It should auto-detect Vite)
   - **Root Directory:** `frontend/admin`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add this Environment Variable:
   - `VITE_API_URL` = `https://hoodas-bakery-backend.onrender.com/api` *(Your Render backend URL followed by /api)*
5. Click **Deploy**.
6. Vercel will give you a live URL (e.g., `https://hoodas-bakery-admin.vercel.app`).
7. Paste this URL into your Render backend Environment Variables under `ADMIN_URL`!

---

🎉 **Done!** Your bakery website is now 100% live on the internet, completely automated, and accessible from any phone or computer!
