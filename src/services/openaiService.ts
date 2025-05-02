import axios from 'axios';

// Get the OpenAI API key from environment variables
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';

// Create axios instance for OpenAI API
const openaiApi = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  }
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Helper function to safely serialize data to avoid Symbol() errors
function safeSerialize(obj: any): any {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('Error serializing object:', error);
    // Create a simplified version of the object
    const simplified: Record<string, any> = {};
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

export const openaiService = {
  // Send a chat completion request to OpenAI
  createChatCompletion: async (messages: ChatMessage[], model = 'gpt-4o') => {
    try {
      console.log('Using API key:', OPENAI_API_KEY ? 'API key is set' : 'API key is not set');
      console.log('Using model:', model);
      
      const response = await openaiApi.post('/chat/completions', {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });
      
      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('Error calling OpenAI API:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error(`Failed to get response from AI: ${error.message}`);
    }
  },
  
  // Get tax advice from OpenAI
  getTaxAdvice: async (question: string, userContext: string, chatHistory: ChatMessage[] = []) => {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are an AI tax assistant for a business expense tracking application. You help users understand their expenses, tax deductions, and answer tax-related questions.
      
      Current user context:
      ${userContext}
      
      When answering questions about expenses or tax implications:
      1. Reference the user's actual transaction data when relevant
      2. Reference the user's receipt data when relevant, including specific items from receipts when asked
      3. Provide specific numbers and calculations when possible
      4. Explain tax implications clearly
      5. If you don't have enough information, ask clarifying questions
      6. Always maintain a professional, helpful tone
      7. Always include a disclaimer that you're providing general guidance, not professional tax advice
      
      IMPORTANT: When the user asks about specific items in receipts, look at the detailed receipt information section in the context to find the answer. Each receipt has a list of items with their names, prices, and quantities.`
    };
    
    const messages: ChatMessage[] = [
      systemMessage,
      ...chatHistory,
      { role: 'user', content: question }
    ];
    
    return await openaiService.createChatCompletion(messages);
  },
  
  // Categorize a transaction for tax purposes
  categorizeTaxTransaction: async (description: string, amount?: number, date?: string, vendor?: string) => {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are an AI assistant specialized in tax categorization for businesses. Your task is to categorize business expenses for tax purposes based on the provided transaction details. Provide a tax category, determine if it's deductible, and explain the tax implications.`
    };
    
    const userMessage: ChatMessage = {
      role: 'user',
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
     };
    
    const response = await openaiService.createChatCompletion([systemMessage, userMessage]);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }
};

export default openaiService;