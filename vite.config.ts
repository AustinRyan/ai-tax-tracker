import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    // Make environment variables available to the client
    'import.meta.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY || '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'),
  },
});