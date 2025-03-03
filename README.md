# TaxAI - AI-Powered Tax Assistant

TaxAI helps you manage receipts, categorize transactions, and get tax advice using AI.

## Deployment to Vercel

This project is configured for easy deployment to Vercel. Follow these steps:

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
   - `OPENAI_API_KEY`

## Local Development

1. **Install dependencies**
   ```
   npm install
   ```

2. **Start the development server**
   ```
   npm run dev:all
   ```

3. **Open your browser**
   
   Navigate to [http://localhost:5173](http://localhost:5173)

## Project Structure

- `/src` - Frontend React application
- `/api` - Serverless API functions for Vercel deployment
- `/server` - Original Express server (for local development)

## Features

- Receipt processing and analysis
- Transaction categorization
- AI-powered tax advice chat
- Supabase integration for data storage
