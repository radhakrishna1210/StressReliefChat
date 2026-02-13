# Deploying StressReliefChat to Render

This guide will walk you through deploying your application to Render using the `render.yaml` Blueprint we created.

## Prerequisites
1.  **GitHub Account:** Ensure your code is pushed to a GitHub repository.
2.  **Render Account:** Sign up at [render.com](https://render.com/).
3.  **MongoDB URI:** You need a connection string for your MongoDB database. You can host one for free on [MongoDB Atlas](https://www.mongodb.com/atlas/database).

## Step-by-Step Deployment

### 1. Push Your Code
Ensure all your changes, including the new `render.yaml` file, are pushed to your GitHub repository.

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create a New Blueprint on Render
1.  Log in to your [Render Dashboard](https://dashboard.render.com/).
2.  Click the **New +** button in the top right corner.
3.  Select **Blueprint**.
4.  Connect your GitHub account if you haven't already.
5.  Select your `StressReliefChat` repository from the list.

### 3. Configure the Blueprint
Render will automatically detect the `render.yaml` file and show you the services it will create:
-   `stress-relief-backend`
-   `stress-relief-frontend`

You will see a prompt to enter environment variables.
1.  **`MONGODB_URI`**: Paste your actual MongoDB connection string here.
    -   Example: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/stressrelief?retryWrites=true&w=majority`
2.  **`JWT_SECRET`**: You can leave this blank or let Render generate it if "Generate" is checked (it's configured to auto-generate in the blueprint). But if asked, you can type a random string.

### 4. Apply the Blueprint
Click **Apply Blueprint**. Render will now:
1.  Clone your repository.
2.  Build the backend (install dependencies).
3.  Build the frontend (install dependencies and run `next build`).
4.  Deploy both services.

### 5. Verify the Deployment
Once the deployment finishes (it might take a few minutes):
1.  Click on the **stress-relief-frontend** service in your dashboard.
2.  Click the URL provided (e.g., `https://stress-relief-frontend.onrender.com`).
3.  Your app should be live!

## Troubleshooting

### Build Failed?
-   **Check Logs:** Click on the failed service and view the "Logs" tab to see what went wrong.
-   **Frontend Build:** Ensure `buildCommand` in `render.yaml` includes `npm install --include=dev`.
-   **Backend Start:** Ensure your `MONGODB_URI` is correct and allows connections from anywhere (0.0.0.0/0) in MongoDB Atlas Network Access.

### App Not Working?
-   **502 Bad Gateway Error:** This usually means the frontend server isn't starting correctly. 
    -   Check the frontend service logs in Render Dashboard to see startup errors
    -   Ensure the build completed successfully (check build logs)
    -   Verify that `npm run start:standalone` command works (the standalone server should start)
    -   Make sure `NEXT_PUBLIC_API_URL` is set correctly and points to your backend service
-   **CORS Issues:** If the frontend can't talk to the backend, check the Browser Console (F12). The backend is configured to accept the frontend URL automatically via `FRONTEND_URL` environment variable, but sometimes a redeploy of the backend is needed if the frontend URL wasn't ready when the backend started (unlikely with Blueprints, but possible).
-   **Environment Variables:** Double-check that `MONGODB_URI` and `JWT_SECRET` are set correctly in the Render Dashboard under **Environment**.
-   **Standalone Mode:** The frontend uses Next.js standalone mode. If you see errors about missing files, ensure the build completed successfully and the `.next/standalone` directory was created.

## Important: Free Tier Limitations
-   Render's free web services spin down after inactivity. The first request after a while might take 30-50 seconds to load.
-   This is normal for the free tier!
