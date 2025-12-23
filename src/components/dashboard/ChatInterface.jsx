import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Send, Paperclip, ChevronDown, User, Bot, Menu, Sparkles, X, File as FileIcon, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import MoleculeIcon from '../MoleculeIcon';
import { motion, AnimatePresence } from 'framer-motion';

// --- Typewriter Component ---
const Typewriter = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset if text changes entirely (though usually we append in a chat, but here we replace the block)
    if (currentIndex >= text.length) {
        if (onComplete) onComplete();
        return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText(prev => prev + text[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, 15); // 15ms per char ~ 4000 cpm, fast but visible

    return () => clearTimeout(timeout);
  }, [currentIndex, text, onComplete]);

  return (
    <div className="prose prose-sm max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-pre:bg-[#1e1e1e] prose-pre:text-gray-100 prose-pre:border prose-pre:border-gray-700 prose-code:text-red-500">
       <ReactMarkdown
         remarkPlugins={[remarkGfm]}
         components={{
            img: ({node, ...props}) => <img {...props} className="rounded-xl border border-gray-200 shadow-sm my-2 max-w-full h-auto" />
         }}
       >
         {displayedText}
       </ReactMarkdown>
    </div>
  );
};

Typewriter.propTypes = {
    text: PropTypes.string.isRequired,
    onComplete: PropTypes.func
};

// --- Thinking Block ---
const ThinkingBlock = ({ content }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-4 border-l-2 border-gray-200 pl-4 py-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-mono uppercase text-gray-400 hover:text-gray-600 mb-2 transition-colors select-none"
      >
        <Sparkles className="w-3 h-3" />
        <span>Reasoning Process</span>
        <ChevronRight className={cn("w-3 h-3 transition-transform", isOpen && "rotate-90")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="text-xs text-gray-500 font-mono whitespace-pre-wrap leading-relaxed">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

ThinkingBlock.propTypes = {
  content: PropTypes.string.isRequired
};

const ChatInterface = ({ messages, onSendMessage, isTyping, onMobileMenu }) => {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Track typed message IDs to avoid re-typing old messages
  const [typedMessageIds, setTypedMessageIds] = useState(new Set());

  // Load custom models from local storage
  const [availableModels, setAvailableModels] = useState([]);

  useEffect(() => {
    const customModels = JSON.parse(localStorage.getItem('gaod_custom_models') || '[]');
    setAvailableModels(customModels);

    if (customModels.length > 0 && !customModels.find(m => m.name === selectedModel)) {
        setSelectedModel(customModels[0].name);
    } else if (customModels.length === 0) {
        setSelectedModel('No Models');
    }
  }, [selectedModel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping, attachments]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    const model = availableModels.find(m => m.name === selectedModel) || availableModels[0];
    onSendMessage(input, model, attachments);
    setInput('');
    setAttachments([]);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
       const newFiles = Array.from(e.target.files).map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          rawFile: file
       }));
       setAttachments(prev => [...prev, ...newFiles]);
    }
    e.target.value = null;
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const parseMessageContent = (content) => {
     const thinkingRegex = /<thinking>([\s\S]*?)<\/thinking>/;
     const match = content.match(thinkingRegex);

     if (match) {
         const thoughts = match[1].trim();
         const cleanContent = content.replace(match[0], '').trim();
         return { thoughts, cleanContent };
     }
     return { thoughts: null, cleanContent: content };
  };

  const handleTypeComplete = (id) => {
      setTypedMessageIds(prev => new Set(prev).add(id));
  };

  return (
    <div className="flex-1 flex flex-col h-dvh bg-[#F8F8F6] relative">

      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 bg-[#F8F8F6]/95 backdrop-blur-sm z-30 sticky top-0 shrink-0">
        <div className="flex items-center gap-2">
            <button onClick={onMobileMenu} className="md:hidden p-2 -ml-2 text-gray-500">
                <Menu className="w-6 h-6" />
            </button>
            <div className="relative">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-[#1A1A1A] font-medium hover:bg-white px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm"
            >
                <span className="font-serif text-lg tracking-tight truncate max-w-[150px]">{selectedModel}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </button>

            {isDropdownOpen && (
                <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-20 max-h-[60vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
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
                <h3 className="font-serif text-2xl text-[#1A1A1A] text-center px-4">How can I help you create?</h3>
            </div>
        )}

        {messages.map((msg, index) => {
            const { thoughts, cleanContent } = parseMessageContent(msg.content);
            const isLastMessage = index === messages.length - 1;
            const shouldType = isLastMessage && msg.role !== 'user' && !typedMessageIds.has(msg.id);

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
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
                        "px-5 py-3.5 md:px-6 md:py-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm whitespace-pre-wrap overflow-hidden",
                        msg.role === 'user'
                        ? 'bg-[#1A1A1A] text-white rounded-tr-sm'
                        : 'bg-white border border-gray-200 text-[#1A1A1A] rounded-tl-sm'
                    )}
                  >
                    {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                            {msg.attachments.map((file, i) => (
                                <div key={i} className={cn(
                                    "border p-2 rounded-lg flex items-center gap-2 text-xs",
                                    msg.role === 'user' ? "bg-white/10 border-white/20" : "bg-gray-100 border-gray-200"
                                )}>
                                    <FileIcon className="w-3 h-3" />
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {msg.role !== 'user' && thoughts && (
                        <ThinkingBlock content={thoughts} />
                    )}

                    {/* Markdown Content with Typewriter logic */}
                    {msg.role === 'user' ? (
                       <div>{cleanContent}</div>
                    ) : (
                       shouldType ? (
                           <Typewriter
                               text={cleanContent}
                               onComplete={() => handleTypeComplete(msg.id)}
                           />
                       ) : (
                           <div className="prose prose-sm max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-pre:bg-[#1e1e1e] prose-pre:text-gray-100 prose-pre:border prose-pre:border-gray-700 prose-code:text-red-500">
                             <ReactMarkdown
                               remarkPlugins={[remarkGfm]}
                               components={{
                                  img: ({node, ...props}) => <img {...props} className="rounded-xl border border-gray-200 shadow-sm my-2 max-w-full h-auto" />
                               }}
                             >
                               {cleanContent}
                             </ReactMarkdown>
                           </div>
                       )
                    )}
                  </div>
                </div>
              </motion.div>
            );
        })}

        {isTyping && (
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 max-w-3xl mx-auto"
             >
                 <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                 </div>
                 <div className="bg-white border border-gray-200 px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                 </div>
             </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full sticky bottom-0 z-30 shrink-0">
        <div className="bg-[#F8F8F6] absolute inset-0 -top-8 bg-gradient-to-t from-[#F8F8F6] to-transparent pointer-events-none" />

        {attachments.length > 0 && (
            <div className="mb-2 flex gap-2 overflow-x-auto pb-2 relative z-40 px-1">
                {attachments.map((file, i) => (
                    <div key={i} className="bg-white border border-gray-200 pl-3 pr-8 py-2 rounded-xl shadow-sm text-xs relative group flex-shrink-0 flex items-center gap-2">
                        <FileIcon className="w-3 h-3 text-gray-400" />
                        <span className="max-w-[120px] truncate font-medium text-gray-600">{file.name}</span>
                        <button
                          onClick={() => removeAttachment(i)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        )}

        <form
          onSubmit={handleSend}
          className="bg-white border border-gray-200 rounded-2xl shadow-lg shadow-gray-200/50 p-2 flex items-end gap-2 focus-within:ring-1 focus-within:ring-black focus-within:border-black transition-all relative z-40"
        >
          <input
             type="file"
             ref={fileInputRef}
             onChange={handleFileSelect}
             className="hidden"
             multiple
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
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
            disabled={(!input.trim() && attachments.length === 0) || isTyping}
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

ChatInterface.propTypes = {
  messages: PropTypes.array.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  isTyping: PropTypes.bool,
  onMobileMenu: PropTypes.func.isRequired
};

export default ChatInterface;
