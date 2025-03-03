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
const PORT = process.env.PORT || 3001;

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg'; // Default to jpg if no extension
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

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
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helper function to extract text from images using Tesseract
async function extractTextFromImage(filePath) {
  try {
    // Preprocess the image for better OCR results
    const processedImagePath = `${filePath}-processed.jpg`;
    await sharp(filePath)
      .resize(1800) // Resize to a reasonable size
      .greyscale() // Convert to grayscale
      .normalize() // Normalize the image
      .sharpen() // Sharpen the image
      .toFile(processedImagePath);
    
    // Perform OCR on the processed image
    const result = await Tesseract.recognize(
      processedImagePath,
      'eng',
      { logger: m => console.log(m) }
    );
    
    // Clean up the processed image
    fs.unlinkSync(processedImagePath);
    
    return result.data.text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
}

// Helper function to extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
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

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    // Extract text from the receipt
    let extractedText;
    if (fileExt === '.pdf') {
      extractedText = await extractTextFromPDF(filePath);
    } else {
      extractedText = await extractTextFromImage(filePath);
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
              text: "Extract all relevant information from this receipt for tax purposes. Include vendor name, date (in YYYY-MM-DD format), totalAmount (as a number), taxAmount (as a number), items (as an array of objects with name, price, and quantity if available), category (tax category), deductible (boolean), deductiblePercentage (number), and description (brief summary)."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${req.file.mimetype};base64,${fs.readFileSync(filePath).toString('base64')}`
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
          } else if (parseInt(part1) > 12) {
            // DD/MM/YYYY
            aiResponse.date = `${part3.length === 2 ? '20' + part3 : part3}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`;
          } else {
            // MM/DD/YYYY (default US format)
            aiResponse.date = `${part3.length === 2 ? '20' + part3 : part3}-${part1.padStart(2, '0')}-${part2.padStart(2, '0')}`;
          }
        }
      }
      
      // Ensure numeric values are actually numbers
      if (typeof aiResponse.totalAmount === 'string') {
        aiResponse.totalAmount = parseFloat(aiResponse.totalAmount.replace(/[^\d.-]/g, '')) || 0;
      }
      
      if (typeof aiResponse.taxAmount === 'string') {
        aiResponse.taxAmount = parseFloat(aiResponse.taxAmount.replace(/[^\d.-]/g, '')) || 0;
      }
      
      // Ensure items are properly formatted as objects
      if (Array.isArray(aiResponse.items)) {
        aiResponse.items = aiResponse.items.map(item => {
          if (typeof item === 'string') {
            // Try to extract price from string format like "Item name - $10.99"
            const priceMatch = item.match(/\$?(\d+(\.\d+)?)/);
            const price = priceMatch ? parseFloat(priceMatch[1]) : null;
            
            return {
              name: item.replace(/\s*-?\s*\$?\d+(\.\d+)?/, '').trim(),
              price: price,
              quantity: 1
            };
          } else if (typeof item === 'object' && item !== null) {
            // Ensure object has the expected properties
            return {
              name: item.name || 'Unknown Item',
              price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.-]/g, '')) : item.price,
              quantity: item.quantity || 1
            };
          }
          return { name: 'Unknown Item', price: null, quantity: 1 };
        });
      }
      
    } catch (error) {
      console.error('Error parsing OpenAI response as JSON:', error);
      console.log('Response content:', aiResponseContent);
      aiResponse = { 
        error: 'Failed to parse AI response', 
        rawResponse: aiResponseContent,
        vendor: "Unknown Vendor",
        date: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        items: [],
        category: "Office Expenses",
        deductible: true,
        deductiblePercentage: 100
      };
    }
    
    // Safely serialize the response to avoid Symbol() errors
    const safeResponse = safeSerialize(aiResponse);
    
    // Add the extracted text and file path to the response
    safeResponse.extractedText = extractedText;
    safeResponse.filePath = req.file.filename;
    
    // Create a URL for the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    safeResponse.imageUrl = fileUrl;
    
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
    
    console.log('Categorizing transaction with OpenAI using model: gpt-4o');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in tax categorization for businesses. Your task is to categorize business expenses for tax purposes based on the provided transaction details. Provide a tax category, determine if it's deductible, and explain the tax implications."
        },
        {
          role: "user",
          content: `Categorize this business transaction for tax purposes:
          Description: ${description}
          Amount: ${amount || 'Not provided'}
          Date: ${date || 'Not provided'}
          Vendor: ${vendor || 'Not provided'}
          
          Provide a JSON response with the following fields:
          - category: The tax category this expense falls under
          - deductible: Whether this expense is likely tax-deductible (true/false)
          - deductiblePercentage: If partially deductible, what percentage (e.g., 50 for meals)
          - explanation: A brief explanation of the tax implications
          - suggestedDocumentation: What documentation should be kept for this expense`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse and return the AI response
    const aiResponseContent = response.choices[0].message.content;
    let aiResponse;
    
    try {
      aiResponse = JSON.parse(aiResponseContent);
    } catch (error) {
      console.error('Error parsing OpenAI response as JSON:', error);
      aiResponse = { error: 'Failed to parse AI response', rawResponse: aiResponseContent };
    }
    
    // Safely serialize the response
    const safeResponse = safeSerialize(aiResponse);
    res.json(safeResponse);
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
    
    // In a real application, you would fetch the user's transaction and receipt data
    // from your database here to provide context to the AI
    
    // For now, we'll use a mock context
    const userContext = `
      The user has the following recent transactions:
      1. Office Supplies from Staples - $245.99 on 2025-03-15 (Category: Office Expenses)
      2. Client Dinner at Olive Garden - $189.75 on 2025-03-12 (Category: Meals & Entertainment)
      3. AWS Monthly Subscription - $432.10 on 2025-03-10 (Category: Software & Services)
      4. Uber Ride - $28.50 on 2025-03-08 (Category: Travel)
      5. Marketing Conference Ticket - $899.00 on 2025-03-05 (Category: Professional Development)
      
      Total spending on client meals in March: $189.75
      Total spending on software in Q1 2025: $1,296.30
      Estimated tax savings so far this year: $6,039
    `;
    
    // Prepare chat history for the API
    const formattedChatHistory = chatHistory ? chatHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) : [];
    
    console.log('Sending chat message to OpenAI using model: gpt-4o');
    
    // Create the API request
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI tax assistant for a business expense tracking application. You help users understand their expenses, tax deductions, and answer tax-related questions.
          
          Current user context:
          ${userContext}
          
          When answering questions about expenses or tax implications:
          1. Reference the user's actual transaction data when relevant
          2. Provide specific numbers and calculations when possible
          3. Explain tax implications clearly
          4. If you don't have enough information, ask clarifying questions
          5. Always maintain a professional, helpful tone`
        },
        ...formattedChatHistory,
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    // Return the AI response
    res.json({
      message: response.choices[0].message.content,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: 'Failed to process chat message', details: error.message });
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. The server is likely already running.`);
    console.log('Continuing with the application...');
  } else {
    console.error('Server error:', err);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shut down');
    process.exit(0);
  });
});