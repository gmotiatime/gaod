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

  const handleSendMessage = async (content, model) => {
    if (!activeChatId) return;

    // 1. Add User Message
    chatStore.addMessage(activeChatId, 'user', content);

    // Refresh state immediately to show user message
    const updatedChat = chatStore.getChat(activeChatId);
    setChats(chatStore.getChats()); // Update order/preview
    setActiveMessages(updatedChat.messages);
    setIsTyping(true);

    // 2. Call AI (Simulated or Real)
    // In a real app, this would use the `model` object to pick the key and endpoint.
    // Since we don't have a backend proxy, we'll try a direct fetch if keys exist, or simulate.

    try {
        let aiResponseText = '';

        // Check for keys
        const openAiKey = localStorage.getItem('gaod_openai_key');
        const anthropicKey = localStorage.getItem('gaod_anthropic_key');
        const googleKey = localStorage.getItem('gaod_google_key');

        let usedRealApi = false;

        // Improved API Implementation
        try {
            if (model.provider === 'openai' && openAiKey) {
                const res = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAiKey}` },
                    body: JSON.stringify({
                        model: model.id,
                        messages: [{ role: 'user', content }]
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
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${googleKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: content }] }]
                    })
                });
                if (!res.ok) throw new Error(`Google Error: ${res.status}`);
                const data = await res.json();
                if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    aiResponseText = data.candidates[0].content.parts[0].text;
                    usedRealApi = true;
                }
            } else if (model.provider === 'anthropic' && anthropicKey) {
                // Anthropic (Note: Likely to fail CORS in browser, but implemented as requested)
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
                        messages: [{ role: 'user', content }]
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
            // Append error details to simulation to help user debug
            aiResponseText = `[Error: ${e.message}]`;
        }

        // Fallback Simulation if no key or failure
        if (!usedRealApi) {
            await new Promise(resolve => setTimeout(resolve, 800));
            // If we caught an error above, aiResponseText might start with [Error...
            // If not, it means no key was found or provider unknown.
            if (!aiResponseText.startsWith('[Error')) {
                aiResponseText = `[Simulated ${model.name} Response]\n\nI have processed your request: "${content}".\n\n(No valid API key found for ${model.provider} or provider not supported in client mode).`;
            } else {
                aiResponseText += `\n\nFalling back to simulation mode due to the error above. Check your API key in Admin.`;
            }
        }

        // 3. Add AI Message
        chatStore.addMessage(activeChatId, 'assistant', aiResponseText);

        // Refresh State
        const finalChat = chatStore.getChat(activeChatId);
        setActiveMessages(finalChat.messages);
        setChats(chatStore.getChats());

    } catch (err) {
        chatStore.addMessage(activeChatId, 'assistant', "Error generating response.");
    } finally {
        setIsTyping(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex h-screen w-full bg-[#F8F8F6] font-sans text-[#1A1A1A] overflow-hidden">
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
