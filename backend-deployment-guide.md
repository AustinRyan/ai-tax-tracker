# TaxAI Backend Deployment Guide

This guide explains how to deploy your TaxAI backend separately from your frontend.

## Backend Hosting Options

Here are several options for hosting your Express.js backend:

### Option 1: Render.com (Recommended for Simplicity)

[Render](https://render.com) is a great option for hosting Node.js applications with minimal configuration.

1. **Create a Render Account**:
   - Sign up at [render.com](https://render.com)

2. **Create a New Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository or use the manual deploy option

3. **Configure Your Service**:
   - Name: `taxai-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server/index.js`
   - Plan: Select the appropriate plan (Free tier is available for testing)

4. **Set Environment Variables**:
   - Add all variables from your `.env` file:
     - `OPENAI_API_KEY`
     - `PORT` (Render will override this, but include it anyway)
     - Any other variables your app needs

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for the deployment to complete

6. **Get Your Backend URL**:
   - Once deployed, Render will provide a URL like `https://taxai-backend.onrender.com`
   - This is your backend URL that you'll use in your frontend

### Option 2: DigitalOcean App Platform

[DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform/) is another user-friendly option.

1. **Create a DigitalOcean Account**:
   - Sign up at [digitalocean.com](https://www.digitalocean.com/)

2. **Create a New App**:
   - Go to App Platform → "Create App"
   - Connect your GitHub repository

3. **Configure Your App**:
   - Select the repository and branch
   - Select Node.js as the environment
   - Set the build command to `npm install`
   - Set the run command to `node server/index.js`

4. **Set Environment Variables**:
   - Add all variables from your `.env` file

5. **Choose a Plan**:
   - Select the Basic or Pro plan based on your needs

6. **Deploy**:
   - Click "Launch App"
   - Your app will be available at a URL like `https://taxai-backend-abcd1234.ondigitalocean.app`

### Option 3: Railway.app

[Railway](https://railway.app/) is a developer-friendly platform with a generous free tier.

1. **Create a Railway Account**:
   - Sign up at [railway.app](https://railway.app/)

2. **Create a New Project**:
   - Click "New Project" → "GitHub Repo"
   - Select your repository

3. **Configure Your Service**:
   - Set the build command to `npm install`
   - Set the start command to `node server/index.js`

4. **Set Environment Variables**:
   - Add all variables from your `.env` file

5. **Deploy**:
   - Railway will automatically deploy your app
   - Your app will be available at a URL provided by Railway

### Option 4: Traditional VPS (More Control)

If you need more control, you can use a VPS from DigitalOcean, AWS, or Linode.

1. **Create a VPS**:
   - Sign up for a VPS provider (DigitalOcean, AWS EC2, Linode)
   - Create a new server (Ubuntu recommended)

2. **Set Up Your Server**:
   ```bash
   # Update packages
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 for process management
   sudo npm install -g pm2

   # Clone your repository
   git clone https://github.com/yourusername/taxai.git
   cd taxai

   # Install dependencies
   npm install

   # Create .env file
   nano .env
   # Add your environment variables

   # Start your server with PM2
   pm2 start server/index.js --name taxai-backend
   pm2 save
   pm2 startup
   ```

3. **Set Up Nginx as a Reverse Proxy**:
   ```bash
   # Install Nginx
   sudo apt install nginx -y

   # Configure Nginx
   sudo nano /etc/nginx/sites-available/taxai
   ```

   Add the following configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/taxai /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Set Up SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

## Connecting Your Frontend to Your Backend

Once your backend is deployed, you need to update your frontend to connect to it:

1. **Add the Backend URL to Vercel Environment Variables**:
   - In your Vercel dashboard, go to your project settings
   - Add an environment variable:
     - Name: `VITE_BACKEND_URL`
     - Value: Your backend URL (e.g., `https://taxai-backend.onrender.com/api`)

2. **Deploy Your Frontend to Vercel**:
   - Push your changes to GitHub
   - Vercel will automatically deploy your frontend
   - Your frontend will use the backend URL from the environment variable

## CORS Configuration

Make sure your backend allows requests from your frontend domain by updating your CORS configuration in `server/index.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

## Troubleshooting

If you encounter issues:

1. **Check Backend Logs**:
   - Most hosting platforms provide logs that can help identify issues

2. **Test API Endpoints**:
   - Use a tool like Postman to test your backend API endpoints directly

3. **Check CORS Issues**:
   - Open browser developer tools to see if there are CORS errors
   - Ensure your backend CORS configuration includes your frontend domain

4. **File Upload Issues**:
   - Check file size limits on your hosting provider
   - Ensure the uploads directory exists and has proper permissions

## Monitoring and Maintenance

- Set up monitoring for your backend (most platforms provide this)
- Regularly back up your data
- Keep your dependencies updated
- Monitor your API usage and costs
