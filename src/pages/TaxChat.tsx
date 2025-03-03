import React, { useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, AlertCircle, Info, Trash2 } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';

const TaxChat: React.FC = () => {
  const { messages, loading, error, sendMessage, clearChat } = useChat();
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Sample suggested questions
  const suggestedQuestions = [
    "Is my home office deductible?",
    "What expenses can I write off for my business?",
    "How much can I deduct for business meals?",
    "What's my estimated tax liability this quarter?",
    "Can I deduct my new laptop as a business expense?"
  ];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;
    
    await sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear the chat history? This cannot be undone.')) {
      await clearChat();
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Tax Chat Assistant</h1>
          <button
            onClick={handleClearChat}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </button>
        </div>
        
        {/* Chat container */}
        <div className="mt-4 bg-white shadow rounded-lg flex flex-col h-[calc(100vh-12rem)]">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-2">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Tax AI Assistant</h3>
                <p className="text-xs text-gray-500">Ask me anything about taxes and deductions</p>
              </div>
            </div>
          </div>
          
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`flex max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'flex-row-reverse' 
                      : 'flex-row'
                  }`}
                >
                  <div 
                    className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 ml-2' 
                        : 'bg-gray-200 mr-2'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div 
                    className={`rounded-lg px-4 py-2 ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div 
                      className={`text-xs mt-1 ${
                        message.sender === 'user' 
                          ? 'text-blue-200' 
                          : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {message.sender === 'user' && message.status === 'sending' && (
                        <span className="ml-2">Sending...</span>
                      )}
                      {message.sender === 'user' && message.status === 'error' && (
                        <span className="ml-2 text-red-300">Error sending</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%] flex-row">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="rounded-lg px-4 py-2 bg-gray-100">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                      <button 
                        className="mt-1 text-sm font-medium text-red-700 hover:text-red-600"
                        onClick={() => sendMessage(input)}
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggested questions */}
          {messages.length <= 2 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <h4 className="text-xs font-medium text-gray-500 mb-2">SUGGESTED QUESTIONS</h4>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="text-xs bg-white border border-gray-300 rounded-full px-3 py-1 text-gray-700 hover:bg-gray-100"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input area */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-end">
              <button 
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 mr-2"
                title="Attach a file"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <div className="flex-grow relative">
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Ask a question about taxes..."
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <button
                className="ml-2 flex-shrink-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <Info className="h-3 w-3 mr-1" />
              <span>Your chat history is saved and may be used to improve our AI</span>
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Tax Advice Disclaimer</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  The information provided by this AI assistant is for general guidance only and is not a substitute for professional tax advice. 
                  Tax laws change frequently and vary by jurisdiction. 
                  Consult with a qualified tax professional before making financial decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxChat;