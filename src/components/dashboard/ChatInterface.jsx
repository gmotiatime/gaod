import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Send, Paperclip, ChevronDown, User, Bot, Menu, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

const ChatInterface = ({ messages, onSendMessage, isTyping, onMobileMenu }) => {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load custom models from local storage (User requested removal of defaults)
  const [availableModels, setAvailableModels] = useState([]);

  useEffect(() => {
    const customModels = JSON.parse(localStorage.getItem('gaod_custom_models') || '[]');
    setAvailableModels(customModels);
    // If current selected model is not in list (and list not empty), select first
    if (customModels.length > 0 && !customModels.find(m => m.name === selectedModel)) {
        setSelectedModel(customModels[0].name);
    } else if (customModels.length === 0) {
        setSelectedModel('No Models');
    }
  }, [selectedModel]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Find provider/ID for selected model
    const model = availableModels.find(m => m.name === selectedModel) || availableModels[0];
    onSendMessage(input, model);
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F8F6] relative">

      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 bg-[#F8F8F6]/95 backdrop-blur-sm z-30 sticky top-0">
        <div className="flex items-center gap-2">
            <button onClick={onMobileMenu} className="md:hidden p-2 -ml-2 text-gray-500">
                <Menu className="w-6 h-6" />
            </button>
            <div className="relative">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-[#1A1A1A] font-medium hover:bg-white px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm"
            >
                <span className="font-serif text-lg tracking-tight">{selectedModel}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isDropdownOpen && (
                <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-20 max-h-[60vh] overflow-y-auto">
                {availableModels.map((model) => (
                    <button
                    key={model.id + model.name}
                    onClick={() => { setSelectedModel(model.name); setIsDropdownOpen(false); }}
                    className={cn(
                        "w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between",
                        selectedModel === model.name ? "text-[#1A1A1A] font-medium bg-gray-50" : "text-gray-500"
                    )}
                    >
                    <span>{model.name}</span>
                    <span className="text-[10px] uppercase font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">{model.provider}</span>
                    </button>
                ))}
                </div>
                </>
            )}
            </div>
        </div>
        <div className="text-xs font-mono text-gray-400 hidden md:block">
            {isTyping ? <span className="flex items-center gap-1 animate-pulse text-[#1A1A1A]"><Sparkles className="w-3 h-3"/> Thinking...</span> : 'Ready'}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 scroll-smooth">
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 select-none pb-20">
                <MoleculeIcon className="w-24 h-24 text-[#1A1A1A] mb-6" />
                <h3 className="font-serif text-2xl text-[#1A1A1A]">How can I help you create?</h3>
            </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 md:gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'assistant' || msg.role === 'ai' ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {msg.role === 'assistant' || msg.role === 'ai' ? <MoleculeIcon className="w-4 h-4 text-white" mode="static" /> : <User className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col max-w-[85%] md:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={cn(
                    "px-5 py-3.5 md:px-6 md:py-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm whitespace-pre-wrap",
                    msg.role === 'user'
                    ? 'bg-[#1A1A1A] text-white rounded-tr-sm'
                    : 'bg-white border border-gray-200 text-[#1A1A1A] rounded-tl-sm'
                )}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
             <div className="flex gap-4 max-w-3xl mx-auto">
                 <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                 </div>
                 <div className="bg-white border border-gray-200 px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                 </div>
             </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full sticky bottom-0 z-30">
        <div className="bg-[#F8F8F6] absolute inset-0 -top-8 bg-gradient-to-t from-[#F8F8F6] to-transparent pointer-events-none" />
        <form
          onSubmit={handleSend}
          className="bg-white border border-gray-200 rounded-2xl shadow-lg shadow-gray-200/50 p-2 flex items-end gap-2 focus-within:ring-1 focus-within:ring-black focus-within:border-black transition-all relative z-40"
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
            style={{ minHeight: '44px' }}
          />

          <button
            type="submit"
            disabled={!input.trim() || isTyping}
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

// Lazy import for icon to avoid cycle if needed, but here straightforward
import MoleculeIcon from '../MoleculeIcon';

ChatInterface.propTypes = {
  messages: PropTypes.array.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  isTyping: PropTypes.bool,
  onMobileMenu: PropTypes.func.isRequired
};

export default ChatInterface;
