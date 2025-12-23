import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import ChatInterface from '../components/dashboard/ChatInterface';
import SettingsModal from '../components/dashboard/SettingsModal';
import { auth } from '../lib/auth';
import { chatStore } from '../lib/chatStore';
import { useChat } from '../hooks/useChat';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);

  // Use the new useChat hook
  const { sendMessage, isTyping, error } = useChat(activeChatId, user);

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
    const loadChats = async () => {
        if (!user) return;
        try {
            const savedChats = await chatStore.getChats(user.id);
            setChats(savedChats);
            if (savedChats.length > 0) {
                setActiveChatId(savedChats[0].id);
                setActiveMessages(savedChats[0].messages);
            } else {
                handleNewChat();
            }
        } catch (err) {
            console.error("Failed to load chats", err);
        }
    };
    if (user) loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Reload chats/messages when typing finishes to sync final state
  useEffect(() => {
      const sync = async () => {
        if (!activeChatId || isTyping) return; // Don't sync while typing (we handle optimistic manually)

        // Reload messages
        const chat = await chatStore.getChat(activeChatId);
        if (chat) setActiveMessages(chat.messages);

        // Reload chat list (for titles/ordering)
        if(user) {
            const allChats = await chatStore.getChats(user.id);
            setChats(allChats);
        }
      };
      sync();
  }, [activeChatId, isTyping, user]);


  const handleNewChat = async () => {
    if (!user) return;
    const newChat = await chatStore.createChat(null, user.id);
    const allChats = await chatStore.getChats(user.id);
    setChats(allChats);
    setActiveChatId(newChat.id);
    setActiveMessages(newChat.messages);
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = async (id) => {
    await chatStore.deleteChat(id);
    const updatedChats = await chatStore.getChats(user.id);
    setChats(updatedChats);

    if (activeChatId === id) {
        if (updatedChats.length > 0) {
            setActiveChatId(updatedChats[0].id);
        } else {
            handleNewChat();
        }
    }
  };

  const handleSendMessageWrapper = async (content, model, attachments) => {
      // 1. Immediate UI Update (Optimistic)
      const tempId = Date.now();
      const optimMsg = {
          id: tempId,
          role: 'user',
          content: content + (attachments.length > 0 ? `\n\n[Attached ${attachments.length} file(s)]` : ''),
          createdAt: new Date().toISOString()
      };

      setActiveMessages(prev => [...prev, optimMsg]);

      // 2. Trigger Hook
      await sendMessage(content, model, attachments);

      // 3. UI sync happens in useEffect when isTyping goes false
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
        onSendMessage={handleSendMessageWrapper}
        isTyping={isTyping}
        onMobileMenu={() => setIsSidebarOpen(true)}
      />

      {error && (
        <div className="absolute bottom-4 right-4 bg-red-100 text-red-800 p-2 rounded shadow z-50">
          {error}
        </div>
      )}

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
