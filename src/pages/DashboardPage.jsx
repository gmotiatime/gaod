import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import ChatInterface from '../components/dashboard/ChatInterface';
import SettingsModal from '../components/dashboard/SettingsModal';
import { auth } from '../lib/auth';
import { chatStore } from '../lib/chatStore';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load User
  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  // Load Chats on Mount
  useEffect(() => {
    const savedChats = chatStore.getChats();
    setChats(savedChats);
    if (savedChats.length > 0) {
        setActiveChatId(savedChats[0].id);
        setActiveMessages(savedChats[0].messages);
    } else {
        handleNewChat();
    }
  }, []);

  // Update messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
        const chat = chatStore.getChat(activeChatId);
        if (chat) setActiveMessages(chat.messages);
    }
  }, [activeChatId]);

  const handleNewChat = () => {
    const newChat = chatStore.createChat();
    setChats(chatStore.getChats());
    setActiveChatId(newChat.id);
    setActiveMessages(newChat.messages);
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setIsSidebarOpen(false); // Close sidebar on mobile on select
  };

  const handleDeleteChat = (id) => {
    chatStore.deleteChat(id);
    const updatedChats = chatStore.getChats();
    setChats(updatedChats);

    if (activeChatId === id) {
        if (updatedChats.length > 0) {
            setActiveChatId(updatedChats[0].id);
        } else {
            handleNewChat();
        }
    }
  };

  // Helper: Generate Title (Simple simulation or light API call)
  const generateTitle = async (firstMessage, chatId) => {
     // In a real app, call a small model to summarize `firstMessage`
     // Here we just truncate and capitalize
     let title = firstMessage.slice(0, 30);
     if (firstMessage.length > 30) title += '...';

     // Update Chat Store
     // We need to extend chatStore to support renaming, or we just manually update localStorage for now
     const chats = JSON.parse(localStorage.getItem('brand_ai_chats') || '[]');
     const chatIndex = chats.findIndex(c => c.id === chatId);
     if (chatIndex >= 0) {
         chats[chatIndex].title = title;
         localStorage.setItem('brand_ai_chats', JSON.stringify(chats));
         setChats(chats); // Trigger re-render
     }
  };

  const handleSendMessage = async (content, model, attachments = []) => {
    if (!activeChatId) return;

    // 1. Add User Message
    // Note: attachments are metadata here.
    // In a real app, we'd process the file content and perhaps append it to `content` string for the LLM
    // or send as separate content parts.

    // Process text files content if any
    let finalContent = content;

    // Very simple "read text file" simulation if needed, but for now we just log it.
    // Ideally we would have read the file in the component and passed the string.
    // Assuming `attachments` has `rawFile` which is a File object, we can't easily read it here async without delay,
    // so we rely on the component having done it or just passing metadata.
    // For this demo, we'll append a note about attachments to the prompt.
    if (attachments.length > 0) {
        finalContent += `\n\n[Attached ${attachments.length} file(s): ${attachments.map(a => a.name).join(', ')}]`;
    }

    // Add message to store
    // We pass attachments to store so they can be rendered in history
    chatStore.addMessage(activeChatId, 'user', finalContent, attachments);

    // Auto-title if this is the first real exchange (length 2 after this user msg + ai response, or just check msg count)
    // Actually `activeMessages` is stale here until next render, so check current length
    const isFirstMessage = activeMessages.length === 0;

    // Refresh state immediately
    const updatedChat = chatStore.getChat(activeChatId);
    setChats(chatStore.getChats());
    setActiveMessages(updatedChat.messages);
    setIsTyping(true);

    try {
        let aiResponseText = '';

        // Load Keys & Configs
        const openAiKey = localStorage.getItem('gaod_openai_key');
        const anthropicKey = localStorage.getItem('gaod_anthropic_key');
        const googleKey = localStorage.getItem('gaod_google_key');
        const systemPrompt = localStorage.getItem('gaod_system_prompt') || '';

        let usedRealApi = false;

        // --- IMAGE GENERATION BRANCH ---
        if (model.type === 'image') {
             // Use DALL-E 3 logic (assuming OpenAI key)
             if (openAiKey) {
                 try {
                     const res = await fetch('https://api.openai.com/v1/images/generations', {
                         method: 'POST',
                         headers: {
                             'Content-Type': 'application/json',
                             'Authorization': `Bearer ${openAiKey}`
                         },
                         body: JSON.stringify({
                             model: model.id || 'dall-e-3', // Default to dall-e-3 if not specified
                             prompt: finalContent,
                             n: 1,
                             size: "1024x1024"
                         })
                     });

                     if (!res.ok) {
                         const err = await res.json();
                         throw new Error(err.error?.message || `Error ${res.status}`);
                     }

                     const data = await res.json();
                     const imageUrl = data.data?.[0]?.url;
                     if (imageUrl) {
                         aiResponseText = `Here is your generated image:\n\n![Generated Image](${imageUrl})`;
                         usedRealApi = true;
                     }
                 } catch (e) {
                     aiResponseText = `[Image Generation Error: ${e.message}]`;
                 }
             } else {
                 aiResponseText = `[Error: No OpenAI API Key found for Image Generation]`;
             }
        }
        // --- TEXT CHAT BRANCH ---
        else {
            try {
                // Construct Messages with System Prompt
                const messagesPayload = [];
                if (systemPrompt) {
                    messagesPayload.push({ role: 'system', content: systemPrompt });
                }
                // Add recent history (last 10 messages)
                // We map 'ai' role to 'assistant' for APIs
                const history = activeMessages.slice(-10).map(m => ({
                    role: m.role === 'ai' ? 'assistant' : m.role,
                    content: m.content
                }));
                messagesPayload.push(...history);
                messagesPayload.push({ role: 'user', content: finalContent });

                if (model.provider === 'openai' && openAiKey) {
                    const res = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAiKey}` },
                        body: JSON.stringify({
                            model: model.id,
                            messages: messagesPayload
                        })
                    });
                    if (!res.ok) throw new Error(`OpenAI Error: ${res.status}`);
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        aiResponseText = data.choices[0].message.content;
                        usedRealApi = true;
                    }
                } else if (model.provider === 'google' && googleKey) {
                    // Google Gemini
                    // Gemini format is different (contents: [{ role: 'user', parts: [{ text: ... }] }])
                    // Simplified for demo
                    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${googleKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: finalContent }] }],
                            // System instructions can be added in v1beta/models/gemini-1.5-pro:generateContent but varies by version
                        })
                    });
                    if (!res.ok) throw new Error(`Google Error: ${res.status}`);
                    const data = await res.json();
                    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                        aiResponseText = data.candidates[0].content.parts[0].text;
                        usedRealApi = true;
                    }
                } else if (model.provider === 'anthropic' && anthropicKey) {
                     // Anthropic
                    const res = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: {
                            'x-api-key': anthropicKey,
                            'anthropic-version': '2023-06-01',
                            'content-type': 'application/json',
                            'dangerously-allow-browser': 'true'
                        },
                        body: JSON.stringify({
                            model: model.id,
                            max_tokens: 1024,
                            system: systemPrompt, // Anthropic supports top-level system param
                            messages: messagesPayload.filter(m => m.role !== 'system') // Filter out system if passing separately
                        })
                    });
                    if (!res.ok) throw new Error(`Anthropic Error: ${res.status}`);
                    const data = await res.json();
                    if (data.content?.[0]?.text) {
                        aiResponseText = data.content[0].text;
                        usedRealApi = true;
                    }
                }
            } catch (e) {
                console.error("API Call Failed", e);
                aiResponseText = `[Error: ${e.message}]`;
            }
        }

        // Fallback Simulation
        if (!usedRealApi && !aiResponseText.startsWith('[Error') && !aiResponseText.startsWith('Here is')) {
            await new Promise(resolve => setTimeout(resolve, 800));
            if (model.type === 'image') {
                 aiResponseText = `![Simulated Image](https://placehold.co/600x400/1A1A1A/FFF?text=Generated+Image)\n\n(Simulated: No OpenAI key for DALL-E)`;
            } else {
                 aiResponseText = `[Simulated ${model.name} Response]\n\nI received your message: "${content}".\n\nAttachments: ${attachments.length}\nMemory/System Prompt active: ${!!systemPrompt}`;
            }
        }

        // 3. Add AI Message
        chatStore.addMessage(activeChatId, 'assistant', aiResponseText);

        // Refresh State
        const finalChat = chatStore.getChat(activeChatId);
        setActiveMessages(finalChat.messages);
        setChats(chatStore.getChats());

        // Generate Title if needed
        if (isFirstMessage) {
            generateTitle(content, activeChatId);
        }

    } catch (err) {
        chatStore.addMessage(activeChatId, 'assistant', "Error generating response.");
    } finally {
        setIsTyping(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex h-dvh w-full bg-[#F8F8F6] font-sans text-[#1A1A1A] overflow-hidden">
      <Sidebar
        user={user}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <ChatInterface
        messages={activeMessages}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
        onMobileMenu={() => setIsSidebarOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUpdateUser={(u) => setUser(u)}
      />
    </div>
  );
};

export default DashboardPage;
