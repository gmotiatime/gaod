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
    // If text is extremely long initially, or grows, this might lag.
    // For streaming, we might skip this component.
    if (currentIndex >= text.length) {
        if (onComplete) onComplete();
        return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText(prev => prev + text[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, 12); // Slightly faster typing

    return () => clearTimeout(timeout);
  }, [currentIndex, text, onComplete]);

  return (
    <div className="prose prose-sm max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-pre:bg-[#1e1e1e] prose-pre:text-gray-100 prose-pre:border prose-pre:border-gray-700 prose-code:text-red-500">
       <ReactMarkdown
         remarkPlugins={[remarkGfm]}
         components={{
              // eslint-disable-next-line no-unused-vars
            img: ({node, ...props}) => <img {...props} className="rounded-xl border border-gray-200 shadow-lg my-3 max-w-full h-auto" />
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
    <div className="mb-4 ml-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-gray-400 hover:text-gray-600 mb-2 transition-colors select-none group bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 hover:border-gray-200 w-fit"
      >
        <Sparkles className="w-3 h-3 text-purple-400 group-hover:text-purple-600 transition-colors" />
        <span>Reasoning Process</span>
        <ChevronRight className={cn("w-3 h-3 transition-transform duration-200", isOpen && "rotate-90")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="text-xs text-gray-500 font-mono whitespace-pre-wrap leading-relaxed pl-4 border-l-2 border-purple-100 py-2 my-1 bg-purple-50/30 rounded-r-lg">
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

const ChatInterface = ({ messages, onSendMessage, isTyping, onMobileMenu, availableModels = [] }) => {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize selected model from props
  useEffect(() => {
    if (availableModels.length > 0) {
        // If current selected is not in available, select first
        if (!availableModels.find(m => m.name === selectedModel)) {
             setSelectedModel(availableModels[0].name);
        }
    } else {
        setSelectedModel('Default Model');
    }
  }, [availableModels, selectedModel]);

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
     // Safety check
     if (!content) return { thoughts: null, cleanContent: '' };

     const thinkingRegex = /<thinking>([\s\S]*?)<\/thinking>/;
     const match = content.match(thinkingRegex);

     if (match) {
         const thoughts = match[1].trim();
         const cleanContent = content.replace(match[0], '').trim();
         return { thoughts, cleanContent };
     }
     return { thoughts: null, cleanContent: content };
  };

  return (
    <div className="flex-1 flex flex-col h-dvh bg-[#F8F8F6] relative font-sans">

      {/* Header */}
      <div className="h-16 border-b border-gray-200/80 flex items-center justify-between px-4 md:px-6 bg-[#F8F8F6]/80 backdrop-blur-md z-30 sticky top-0 shrink-0">
        <div className="flex items-center gap-2">
            <button onClick={onMobileMenu} className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-white rounded-lg transition-all">
                <Menu className="w-5 h-5" />
            </button>
            <div className="relative">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-[#1A1A1A] font-medium hover:bg-white px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
            >
                <span className="font-serif text-lg tracking-tight truncate max-w-[150px]">{selectedModel}</span>
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>

            {isDropdownOpen && (
                <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 py-2 z-20 max-h-[60vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-2 text-[10px] font-mono uppercase text-gray-400 tracking-wider">Select Model</div>
                {availableModels.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-400 italic">No models available</div>
                )}
                {availableModels.map((model) => (
                    <button
                    key={model.id + model.name}
                    onClick={() => { setSelectedModel(model.name); setIsDropdownOpen(false); }}
                    className={cn(
                        "w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors",
                        selectedModel === model.name ? "bg-gray-50/80 text-[#1A1A1A] font-semibold" : "text-gray-500"
                    )}
                    >
                    <span>{model.name}</span>
                    <span className="text-[9px] uppercase font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-400 border border-gray-200">{model.provider}</span>
                    </button>
                ))}
                </div>
                </>
            )}
            </div>
        </div>
        <div className="text-[10px] font-mono text-gray-400 hidden md:block uppercase tracking-wider">
            {isTyping ? <span className="flex items-center gap-2 text-[#1A1A1A] animate-pulse"><Sparkles className="w-3 h-3 text-purple-500"/> Processing...</span> : 'System Ready'}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-40 select-none pb-20">
                <div className="bg-white p-6 rounded-full shadow-sm mb-6 animate-in zoom-in duration-500">
                    <MoleculeIcon className="w-16 h-16 text-[#1A1A1A]" />
                </div>
                <h3 className="font-serif text-3xl text-[#1A1A1A] tracking-tight text-center px-4">How can I help you create?</h3>
            </div>
        )}

        {messages.map((msg) => {
            const { thoughts, cleanContent } = parseMessageContent(msg.content);

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex gap-4 md:gap-6 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${msg.role === 'assistant' || msg.role === 'ai' ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-white border-gray-200 text-gray-600'}`}>
                  {msg.role === 'assistant' || msg.role === 'ai' ? <MoleculeIcon className="w-4.5 h-4.5 text-white" mode="static" /> : <User className="w-4.5 h-4.5" />}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col max-w-[85%] md:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={cn(
                        "px-6 py-5 rounded-2xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap overflow-hidden transition-all",
                        msg.role === 'user'
                        ? 'bg-[#1A1A1A] text-white rounded-tr-sm shadow-md'
                        : 'bg-white border border-gray-200 text-[#1A1A1A] rounded-tl-sm shadow-sm'
                    )}
                  >
                    {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {msg.attachments.map((file, i) => (
                                <div key={i} className={cn(
                                    "border p-2.5 rounded-xl flex items-center gap-3 text-xs backdrop-blur-sm",
                                    msg.role === 'user' ? "bg-white/10 border-white/20" : "bg-gray-50 border-gray-200"
                                )}>
                                    <div className="p-1.5 bg-white/20 rounded-lg">
                                        <FileIcon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {msg.role !== 'user' && thoughts && (
                        <ThinkingBlock content={thoughts} />
                    )}

                    {/* Content */}
                    {msg.role === 'user' ? (
                       <div>{cleanContent}</div>
                    ) : (
                       <div className="prose prose-sm max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-pre:bg-[#1e1e1e] prose-pre:text-gray-100 prose-pre:border prose-pre:border-gray-700 prose-code:text-red-500">
                         <ReactMarkdown
                           remarkPlugins={[remarkGfm]}
                           components={{
                              // eslint-disable-next-line no-unused-vars
                              img: ({node, ...props}) => <img {...props} className="rounded-xl border border-gray-200 shadow-lg my-3 max-w-full h-auto" />
                           }}
                         >
                           {cleanContent}
                         </ReactMarkdown>
                       </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
        })}

        {isTyping && (
             <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex gap-4 md:gap-6 max-w-3xl mx-auto items-center"
             >
                 <div className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="w-4.5 h-4.5" />
                 </div>
                 <div className="bg-white border border-gray-200 px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                 </div>
             </motion.div>
        )}
        <div ref={messagesEndRef} className="h-6" />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full sticky bottom-0 z-30 shrink-0">
        <div className="absolute inset-0 -top-12 bg-gradient-to-t from-[#F8F8F6] via-[#F8F8F6]/90 to-transparent pointer-events-none" />

        {attachments.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-2 relative z-40 px-1 scrollbar-hide">
                {attachments.map((file, i) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={i}
                        className="bg-white border border-gray-200 pl-3 pr-8 py-2.5 rounded-xl shadow-md text-xs relative group flex-shrink-0 flex items-center gap-3 transition-transform hover:-translate-y-0.5"
                    >
                        <div className="p-1.5 bg-gray-50 rounded-lg">
                            <FileIcon className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <span className="max-w-[120px] truncate font-medium text-gray-700">{file.name}</span>
                        <button
                          onClick={() => removeAttachment(i)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                ))}
            </div>
        )}

        <form
          onSubmit={handleSend}
          className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/40 p-2 flex items-end gap-2 focus-within:ring-1 focus-within:ring-black/5 focus-within:border-gray-300 transition-all relative z-40"
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
            className="p-3 text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50 rounded-xl transition-all active:scale-95"
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
            className="flex-1 bg-transparent border-none outline-none resize-none py-3 text-[#1A1A1A] placeholder-gray-400 max-h-32 text-sm font-medium"
            rows={1}
            style={{ minHeight: '44px' }}
          />

          <button
            type="submit"
            disabled={(!input.trim() && attachments.length === 0) || isTyping}
            className="p-3 bg-[#1A1A1A] text-white rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 hover:shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-400 mt-4 font-mono tracking-wide opacity-60">
          Gaod AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

ChatInterface.propTypes = {
  messages: PropTypes.array.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  isTyping: PropTypes.bool,
  onMobileMenu: PropTypes.func.isRequired,
  availableModels: PropTypes.array
};

export default ChatInterface;
