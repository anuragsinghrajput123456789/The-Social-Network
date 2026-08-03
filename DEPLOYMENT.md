# Production Deployment Guide

This guide provides step-by-step instructions to deploy the Instagram Clone to production using **Vercel** (Frontend), **Render** (Backend), **MongoDB Atlas** (Database), and **Cloudinary** (Media CDN).

---

## 1. MongoDB Atlas Setup (Database)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user with read/write permissions.
3. Under **Network Access**, add `0.0.0.0/0` (or Render IP ranges) to the IP Whitelist.
4. Click **Connect** -> **Drivers** and copy your Connection String URI:
   ```env
   mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/instagram-clone?retryWrites=true&w=majority
   ```

---

## 2. Render Deployment (Backend Service)

1. Sign in to [Render](https://render.com).
2. Click **New +** -> **Web Service** and connect your GitHub repository.
3. Select the `backend` directory (or use `render.yaml` blueprint).
4. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
5. Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_secure_random_jwt_secret_key`
   - `CORS_ORIGIN`: `https://your-frontend-domain.vercel.app`
6. Click **Deploy Web Service**.

---

## 3. Vercel Deployment (Frontend SPA)

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project** and import your GitHub repository.
3. Set the **Root Directory** to `frontend`.
4. Configure **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://your-render-backend.onrender.com`
5. Click **Deploy**. Vercel will automatically build and assign a production URL.

---

## 4. Production Verification

1. **Health Check**: Visit `https://your-render-backend.onrender.com/health` to confirm `dbState: "connected"`.
2. **Real-time WebSockets**: Login on Vercel and verify real-time chat and notification socket events operate cleanly.
3. **Infinite Scroll & Uploads**: Test post creation and infinite feed scrolling on mobile and desktop.

---

## 5. Maintenance & CI/CD

- Push changes to `main` branch to trigger GitHub Actions CI verification and automatic deployments on Vercel and Render.
