import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, ChevronDown, User, Bot } from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', content: 'Hello. I am Gaod. How can I assist you with your creative process today?' },
  ]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), type: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiMsg = {
        id: Date.now() + 1,
        type: 'ai',
        content: `I have received your request regarding "${userMsg.content}". As a simulated model running ${selectedModel}, I am processing the context.`
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F8F6] relative">

      {/* Header / Model Selector */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-[#F8F8F6]/80 backdrop-blur-sm z-10">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-[#1A1A1A] font-medium hover:bg-white px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm"
          >
            <span className="font-serif text-lg">{selectedModel}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-20">
              {['GPT-4o', 'Claude 3.5 Sonnet', 'Gemini Pro 1.5'].map((model) => (
                <button
                  key={model}
                  onClick={() => { setSelectedModel(model); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedModel === model ? 'text-[#1A1A1A] font-medium' : 'text-gray-500'}`}
                >
                  {model}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="text-xs font-mono text-gray-400">Context: 24k tokens</div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 max-w-3xl mx-auto ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'ai' ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {msg.type === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col max-w-[80%] ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-6 py-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.type === 'user'
                    ? 'bg-[#1A1A1A] text-white rounded-tr-sm'
                    : 'bg-white border border-gray-200 text-[#1A1A1A] rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] font-mono text-gray-400 mt-2 px-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full">
        <form
          onSubmit={handleSend}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-2 flex items-end gap-2 focus-within:ring-1 focus-within:ring-black focus-within:border-black transition-all"
        >
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50 rounded-xl transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Message Gaod..."
            className="flex-1 bg-transparent border-none outline-none resize-none py-3 text-[#1A1A1A] placeholder-gray-400 max-h-32 text-sm"
            rows={1}
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 bg-[#1A1A1A] text-white rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-400 mt-3 font-mono">
          Gaod can make mistakes. Consider checking important information.
        </p>
      </div>

    </div>
  );
};

export default ChatInterface;
