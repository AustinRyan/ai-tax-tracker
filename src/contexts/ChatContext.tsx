import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatHistoryService } from '../services/supabaseService';
import { openaiService } from '../services/openaiService';
import { Tables } from '../lib/supabaseTypes';
import { useAuth } from './AuthContext';
import { useTransactions } from './TransactionsContext';
import { useReceipts } from '../contexts/ReceiptsContext';
import { checkSupabaseConnection } from '../lib/supabase';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
}

interface ChatContextType {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI tax assistant. How can I help you with your tax questions today?',
      sender: 'ai',
      timestamp: new Date(),
      status: 'sent'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(true);
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { receipts } = useReceipts();

  // Check Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const isAvailable = await checkSupabaseConnection();
      setIsSupabaseAvailable(isAvailable);
    };
    
    checkConnection();
  }, []);

  // Load chat history from Supabase
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user || !isSupabaseAvailable) return;
      
      try {
        // Always reset messages when user changes
        setMessages([{
          id: '1',
          content: 'Hello! I\'m your AI tax assistant. How can I help you with your tax questions today?',
          sender: 'ai',
          timestamp: new Date(),
          status: 'sent'
        }]);
        
        const history = await chatHistoryService.getChatHistory();
        
        if (history.length > 0) {
          // Double check that all messages belong to the current user
          const userMessages = history.filter(msg => msg.user_id === user.id);
          
          if (userMessages.length > 0) {
            const formattedMessages: ChatMessage[] = userMessages.map(msg => ({
              id: msg.id,
              content: msg.message,
              sender: msg.sender as 'user' | 'ai',
              timestamp: new Date(msg.timestamp),
              status: 'sent'
            }));
            
            setMessages(formattedMessages);
          }
        }
      } catch (err) {
        console.error('Error loading chat history:', err);
      }
    };
    
    loadChatHistory();
  }, [user, isSupabaseAvailable]);

  // Generate user context for AI including receipts data
  const generateUserContext = () => {
    let context = '';
    
    // Add transaction data
    if (transactions.length) {
      // Get recent transactions
      const recentTransactions = transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      
      // Calculate some basic stats
      const totalSpending = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      
      // Group by category
      const categorySpending: Record<string, number> = {};
      transactions.forEach(t => {
        if (t.category) {
          categorySpending[t.category] = (categorySpending[t.category] || 0) + Number(t.amount);
        }
      });
      
      // Format the transaction context
      context += `The user has the following recent transactions:\n`;
      
      recentTransactions.forEach((t, i) => {
        context += `${i + 1}. ${t.name} - $${Number(t.amount).toFixed(2)} on ${t.date} (Category: ${t.category || 'Uncategorized'})\n`;
      });
      
      context += `\nTotal spending: $${totalSpending.toFixed(2)}\n`;
      context += `\nSpending by category:\n`;
      
      Object.entries(categorySpending).forEach(([category, amount]) => {
        context += `- ${category}: $${amount.toFixed(2)}\n`;
      });
    } else {
      context += "No transaction data available yet.\n";
    }
    
    // Add receipt data
    if (receipts.length) {
      // Get recent receipts
      const recentReceipts = receipts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      
      // Calculate total receipt amount
      const totalReceiptAmount = receipts.reduce((sum, r) => sum + Number(r.amount), 0);
      
      // Format the receipt context
      context += `\nThe user has the following recent receipts:\n`;
      
      recentReceipts.forEach((r, i) => {
        context += `${i + 1}. ${r.name} from ${r.vendor || 'Unknown'} - $${Number(r.amount).toFixed(2)} on ${r.date}\n`;
        
        // Add extracted data if available
        if (r.extracted_data) {
          if (r.extracted_data.items && Array.isArray(r.extracted_data.items)) {
            const formattedItems = r.extracted_data.items.map((item: any) => {
              if (typeof item === 'string') {
                return item;
              } else if (typeof item === 'object' && item !== null) {
                return `${item.name || 'Unknown item'} - $${typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}${item.quantity ? ` (x${item.quantity})` : ''}`;
              }
              return 'Unknown item';
            }).join(', ');
            
            context += `   Items: ${formattedItems}\n`;
          }
          if (r.extracted_data.taxAmount) {
            const taxAmount = typeof r.extracted_data.taxAmount === 'number' 
              ? r.extracted_data.taxAmount.toFixed(2) 
              : r.extracted_data.taxAmount;
            context += `   Tax: $${taxAmount}\n`;
          }
          if (r.extracted_data.category) {
            context += `   Category: ${r.extracted_data.category}\n`;
          }
        }
      });
      
      context += `\nTotal receipt amount: $${totalReceiptAmount.toFixed(2)}\n`;
      context += `Total number of receipts: ${receipts.length}\n`;
      
      // Add detailed receipt information for all receipts
      context += `\nDetailed receipt information:\n`;
      receipts.forEach((r, i) => {
        context += `Receipt ${i + 1}: ${r.name} from ${r.vendor || 'Unknown'}\n`;
        context += `  Date: ${r.date}\n`;
        context += `  Amount: $${Number(r.amount).toFixed(2)}\n`;
        
        if (r.extracted_data) {
          if (r.extracted_data.taxAmount) {
            const taxAmount = typeof r.extracted_data.taxAmount === 'number' 
              ? r.extracted_data.taxAmount.toFixed(2) 
              : r.extracted_data.taxAmount;
            context += `  Tax: $${taxAmount}\n`;
          }
          
          if (r.extracted_data.items && Array.isArray(r.extracted_data.items)) {
            context += `  Items:\n`;
            r.extracted_data.items.forEach((item: any, itemIndex: number) => {
              if (typeof item === 'string') {
                context += `    - ${item}\n`;
              } else if (typeof item === 'object' && item !== null) {
                const itemName = item.name || 'Unknown item';
                const itemPrice = typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : 'N/A';
                const itemQuantity = item.quantity ? ` (x${item.quantity})` : '';
                context += `    - ${itemName}: ${itemPrice}${itemQuantity}\n`;
              }
            });
          }
          
          if (r.extracted_data.category) {
            context += `  Category: ${r.extracted_data.category}\n`;
          }
          
          if (r.extracted_data.deductible !== undefined) {
            context += `  Deductible: ${r.extracted_data.deductible ? 'Yes' : 'No'}\n`;
            if (r.extracted_data.deductible && r.extracted_data.deductiblePercentage) {
              context += `  Deductible Percentage: ${r.extracted_data.deductiblePercentage}%\n`;
            }
          }
        }
        
        context += `\n`;
      });
    } else {
      context += "\nNo receipt data available yet.\n";
    }
    
    return context;
  };

  // Send message to OpenAI
  const sendMessage = async (content: string) => {
    if (!user) throw new Error('User not authenticated');
    if (!content.trim()) return;
    
    // Generate a unique ID for the message
    const messageId = Date.now().toString();
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: messageId,
      content,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    
    try {
      // Save user message to Supabase if available
      if (isSupabaseAvailable) {
        await chatHistoryService.addChatMessage({
          user_id: user.id,
          message: content,
          sender: 'user'
        });
      }
      
      // Update user message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'sent' } : msg
        )
      );
      
      // Format chat history for OpenAI
      const chatHistory = messages
        .filter(msg => msg.status === 'sent')
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));
      
      // Get user context including receipts
      const userContext = generateUserContext();
      
      // Get response from OpenAI
      const aiResponse = await openaiService.getTaxAdvice(content, userContext, chatHistory);
      
      // Generate a unique ID for the AI response
      const aiMessageId = (Date.now() + 1).toString();
      
      // Save AI response to Supabase if available
      if (isSupabaseAvailable) {
        await chatHistoryService.addChatMessage({
          user_id: user.id,
          message: aiResponse,
          sender: 'ai'
        });
      }
      
      // Add AI response to chat
      setMessages(prev => [
        ...prev, 
        {
          id: aiMessageId,
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
          status: 'sent'
        }
      ]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to get a response. Please try again.');
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'error' } : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Clear chat history
  const clearChat = async () => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      if (isSupabaseAvailable) {
        await chatHistoryService.clearChatHistory();
      }
      
      setMessages([
        {
          id: Date.now().toString(),
          content: 'Hello! I\'m your AI tax assistant. How can I help you with your tax questions today?',
          sender: 'ai',
          timestamp: new Date(),
          status: 'sent'
        }
      ]);
    } catch (err: any) {
      console.error('Error clearing chat history:', err);
      setError(err.message || 'Failed to clear chat history');
    }
  };

  const value = {
    messages,
    loading,
    error,
    sendMessage,
    clearChat
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};