# TaxAI - AI-Powered Tax Assistant

TaxAI helps you manage receipts, categorize transactions, and get tax advice using AI.

## Deployment Strategy

This project uses a split deployment strategy:

### Frontend Deployment (Vercel)

1. **Install Vercel CLI** (optional, you can also deploy directly from the Vercel website)
   ```
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```
   vercel
   ```

   Or deploy directly from the [Vercel Dashboard](https://vercel.com/new) by importing your GitHub repository.

3. **Set Environment Variables**
   
   Make sure to set these environment variables in your Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_BACKEND_URL` - URL to your deployed backend (e.g., https://taxai-backend.onrender.com/api)

### Backend Deployment

The backend needs to be deployed separately to handle file processing and AI operations. See the [Backend Deployment Guide](./backend-deployment-guide.md) for detailed instructions on deploying to:

- Render.com (recommended)
- DigitalOcean App Platform
- Railway.app
- Traditional VPS

Required environment variables for backend:
- `OPENAI_API_KEY`
- `PORT` (optional, defaults to 3001)
- `FRONTEND_URL` (your Vercel frontend URL for CORS)

## Local Development

1. **Install dependencies**
   ```
   npm install
   ```

2. **Start the development server**
   ```
   npm run dev:all
   ```
   This will start both the frontend and backend servers concurrently.

3. **Or start servers individually**
   ```
   # Frontend only
   npm run dev
   
   # Backend only
   npm run server
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:5173](http://localhost:5173)

## Project Structure

- `/src` - Frontend React application
- `/server` - Express backend server
- `/public` - Static assets

## Features

- Receipt processing and analysis
- Transaction categorization
- AI-powered tax advice chat
- Supabase integration for data storage

## API Endpoints

The backend provides these main endpoints:

- `POST /api/receipts/process` - Upload and analyze receipts
- `POST /api/transactions/categorize` - Categorize financial transactions
- `POST /api/chat` - AI-powered tax assistance
- `GET /api/health` - Health check endpoint

## Troubleshooting

If you encounter issues with the deployment:

1. Check the backend logs for errors
2. Verify that all environment variables are set correctly
3. Ensure CORS is properly configured for your frontend domain
4. Check file upload limits on your hosting provider

## License

MIT
