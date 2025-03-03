import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import OpenAI from 'openai';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads with memory storage for serverless
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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',
});

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Helper function to extract text from images using Tesseract
async function extractTextFromImage(buffer) {
  try {
    // Process the image buffer
    const processedImageBuffer = await sharp(buffer)
      .resize(1800) // Resize to a reasonable size
      .greyscale() // Convert to grayscale
      .normalize() // Normalize the image
      .sharpen() // Sharpen the image
      .toBuffer();
    
    // Perform OCR on the processed image
    const result = await Tesseract.recognize(
      processedImageBuffer,
      'eng',
      { logger: m => console.log(m) }
    );
    
    return result.data.text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
}

// Helper function to extract text from PDF
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return "Failed to extract text from PDF. The file may be corrupted or password-protected.";
  }
}

// Helper function to safely serialize data to avoid Symbol() errors
function safeSerialize(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('Error serializing object:', error);
    // Create a simplified version of the object
    const simplified = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        try {
          // Try to serialize each property individually
          const serialized = JSON.stringify(obj[key]);
          simplified[key] = JSON.parse(serialized);
        } catch (err) {
          // If a property can't be serialized, use a placeholder
          simplified[key] = '[Unserializable data]';
        }
      }
    }
    return simplified;
  }
}

// Routes

// Process receipt and extract information
app.post('/api/receipts/process', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;
    
    // Extract text from the receipt
    let extractedText;
    if (fileType === 'application/pdf') {
      extractedText = await extractTextFromPDF(fileBuffer);
    } else {
      extractedText = await extractTextFromImage(fileBuffer);
    }

    console.log('Processing receipt with OpenAI using model: gpt-4o');
    
    // Use OpenAI API to analyze the receipt
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in extracting and analyzing receipt data for tax purposes. Extract all relevant information from the receipt image, including vendor name, date, total amount, tax amount, items purchased, and any other relevant details. Format the response as a structured JSON object."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all relevant information from this receipt for tax purposes. Include vendor name, date (in YYYY-MM-DD format), totalAmount (as a number), taxAmount (as a number), items (as an array), category (tax category), deductible (boolean), deductiblePercentage (number), and description (brief summary)."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${fileType};base64,${fileBuffer.toString('base64')}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    // Parse the AI response
    const aiResponseContent = response.choices[0].message.content;
    console.log('Received response from OpenAI');
    
    let aiResponse;
    try {
      aiResponse = JSON.parse(aiResponseContent);
      
      // Ensure the response has the expected structure
      if (!aiResponse.vendor) aiResponse.vendor = "Unknown Vendor";
      if (!aiResponse.date) aiResponse.date = new Date().toISOString().split('T')[0];
      if (!aiResponse.totalAmount) aiResponse.totalAmount = 0;
      if (!aiResponse.items) aiResponse.items = [];
      if (!aiResponse.category) aiResponse.category = "Office Expenses";
      if (aiResponse.deductible === undefined) aiResponse.deductible = true;
      if (!aiResponse.deductiblePercentage) aiResponse.deductiblePercentage = 100;
      
      // Format date if needed
      if (aiResponse.date && typeof aiResponse.date === 'string') {
        // Try to standardize date format to YYYY-MM-DD
        const dateMatch = aiResponse.date.match(/(\d{1,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,4})/);
        if (dateMatch) {
          let [_, part1, part2, part3] = dateMatch;
          // Determine if the format is MM/DD/YYYY or DD/MM/YYYY or YYYY/MM/DD
          if (part1.length === 4) {
            // YYYY/MM/DD
            aiResponse.date = `${part1}-${part2.padStart(2, '0')}-${part3.padStart(2, '0')}`;
          } else if (parseInt(part1) > 12 && parseInt(part1) <= 31) {
            // DD/MM/YYYY
            aiResponse.date = `${part3.length === 2 ? '20' + part3 : part3}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`;
          } else {
            // MM/DD/YYYY (default US format)
            aiResponse.date = `${part3.length === 2 ? '20' + part3 : part3}-${part1.padStart(2, '0')}-${part2.padStart(2, '0')}`;
          }
        }
      }
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      aiResponse = {
        vendor: "Unknown Vendor",
        date: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        items: [],
        category: "Office Expenses",
        deductible: true,
        deductiblePercentage: 100,
        error: "Failed to parse AI response"
      };
    }
    
    // Add the extracted text to the response
    aiResponse.extractedText = extractedText;
    
    // Safely serialize the response
    const safeResponse = safeSerialize(aiResponse);
    
    // Return the processed data
    res.json(safeResponse);
  } catch (error) {
    console.error('Error processing receipt:', error);
    res.status(500).json({ error: 'Failed to process receipt', details: error.message });
  }
});

// Categorize a transaction
app.post('/api/transactions/categorize', async (req, res) => {
  try {
    const { description, amount, date, vendor } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Transaction description is required' });
    }
    
    console.log('Categorizing transaction with OpenAI');
    
    // Use OpenAI API to categorize the transaction
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in categorizing financial transactions for tax purposes. Based on the transaction description, amount, date, and vendor, determine the most appropriate tax category, whether it's deductible, and the deductible percentage. Format the response as a structured JSON object."
        },
        {
          role: "user",
          content: `Categorize this transaction for tax purposes:
          Description: ${description}
          Amount: ${amount || 'Unknown'}
          Date: ${date || 'Unknown'}
          Vendor: ${vendor || 'Unknown'}
          
          Provide a JSON response with the following fields:
          - category: The tax category (e.g., "Office Expenses", "Travel", "Meals and Entertainment", etc.)
          - deductible: Boolean indicating if the expense is deductible
          - deductiblePercentage: The percentage that is deductible (e.g., 100 for fully deductible, 50 for partially deductible)
          - explanation: A brief explanation of the categorization`
        }
      ],
      max_tokens: 500,
      response_format: { type: "json_object" }
    });
    
    // Parse the AI response
    const aiResponseContent = response.choices[0].message.content;
    console.log('Received response from OpenAI');
    
    let aiResponse;
    try {
      aiResponse = JSON.parse(aiResponseContent);
      
      // Ensure the response has the expected structure
      if (!aiResponse.category) aiResponse.category = "Uncategorized";
      if (aiResponse.deductible === undefined) aiResponse.deductible = false;
      if (!aiResponse.deductiblePercentage) aiResponse.deductiblePercentage = 0;
      if (!aiResponse.explanation) aiResponse.explanation = "No explanation provided";
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      aiResponse = {
        category: "Uncategorized",
        deductible: false,
        deductiblePercentage: 0,
        explanation: "Failed to parse AI response"
      };
    }
    
    // Return the categorization
    res.json(aiResponse);
  } catch (error) {
    console.error('Error categorizing transaction:', error);
    res.status(500).json({ error: 'Failed to categorize transaction', details: error.message });
  }
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId, chatHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log('Processing chat message with OpenAI');
    
    // Format chat history for OpenAI
    const formattedHistory = chatHistory && Array.isArray(chatHistory) 
      ? chatHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      : [];
    
    // Use OpenAI API for chat
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful tax assistant. You provide information about tax deductions, expense categorization, and general tax advice for small businesses and individuals. You are knowledgeable about US tax laws and regulations. Provide concise, accurate responses to user queries about taxes and financial matters."
        },
        ...formattedHistory,
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1000
    });
    
    // Get the AI response
    const aiResponse = response.choices[0].message.content;
    console.log('Received response from OpenAI');
    
    // Return the chat response
    res.json({
      message: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to process chat message', details: error.message });
  }
});

// Export the Express API as a serverless function
export default async function handler(req, res) {
  // Don't process the request if it's an OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Forward the request to the Express app
  return new Promise((resolve, reject) => {
    app(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}
