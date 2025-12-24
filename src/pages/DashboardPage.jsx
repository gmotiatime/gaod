import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import ChatInterface from '../components/dashboard/ChatInterface';
import SettingsModal from '../components/dashboard/SettingsModal';
import { auth } from '../lib/auth';
import { chatStore } from '../lib/chatStore';
import { db } from '../lib/db';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load User & Models
  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    const loadSettings = async () => {
        try {
            const modelsStr = await db.getSetting('gaod_custom_models');
            const models = modelsStr ? JSON.parse(modelsStr) : [];
            setAvailableModels(models);
        } catch (err) {
            console.error("Failed to load models", err);
        } finally {
            setLoading(false);
        }
    };
    loadSettings();
  }, [navigate]);

  // Load Chats on Mount (Async now)
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

  // Update messages when active chat changes
  useEffect(() => {
    const loadActiveChat = async () => {
        if (activeChatId) {
            const chat = await chatStore.getChat(activeChatId);
            if (chat) setActiveMessages(chat.messages);
        }
    };
    loadActiveChat();
  }, [activeChatId]);

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

  // Helper: Generate Title (Simplified, DB handles updates)
  // eslint-disable-next-line no-unused-vars
  const generateTitle = async (firstMessage, chatId) => {
      // Logic for title update is typically handled by AI or simpler logic
      // For now, if chatStore handles it or we manually update:
      // chatStore.addMessage handles simple title gen for "New Chat"
  };

  // MEMORY HELPER (Use DB)
  const getUserMemoryKey = (uid) => `gaod_user_memory_${uid}`;

  const handleSendMessage = async (content, model, attachments = []) => {
    if (!activeChatId || !user) return;

    let finalContent = content;
    if (attachments.length > 0) finalContent += `\n\n[Attached files...]`;

    setIsTyping(true);

    await chatStore.addMessage(activeChatId, 'user', finalContent);
    const chatWithUserMsg = await chatStore.getChat(activeChatId);
    let currentMessages = chatWithUserMsg.messages;

    // Temp Assistant Message
    const tempAssistantId = Date.now() + 1;
    currentMessages = [...currentMessages, { id: tempAssistantId, role: 'assistant', content: '', timestamp: new Date().toISOString() }];
    setActiveMessages(currentMessages);

    let aiResponseText = '';

    try {
        const vertexKey = await db.getSetting('gaod_vertex_key');
        const systemPrompt = (await db.getSetting('gaod_system_prompt')) || '';
        const memKey = getUserMemoryKey(user.id);
        const userMemory = (await db.getSetting(memKey)) || "No previous memory.";

        const toolInstructions = `
You are Gaod.
[LONG-TERM MEMORY]: ${userMemory}
Wrap reasoning in <thinking>...</thinking>.
`;
        const fullSystemPrompt = (systemPrompt ? systemPrompt + "\n" : "") + toolInstructions;

        if (vertexKey) {
             const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/${model.id}:streamGenerateContent?key=${vertexKey}`;
             const payload = {
                contents: [{ role: 'user', parts: [{ text: fullSystemPrompt + "\n\nUser: " + finalContent }] }]
             };

             const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
             });

             if (!response.ok) throw new Error(`API Error ${response.status}`);

             const reader = response.body.getReader();
             const decoder = new TextDecoder();
             let buffer = '';

             // eslint-disable-next-line no-constant-condition
             while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Parse Logic: Vertex returns array of objects like [{...}, {...}]
                // We'll strip array brackets and parse objects by finding balanced braces

                // Remove outer brackets if present at start
                if (buffer.startsWith('[')) buffer = buffer.substring(1);

                let depth = 0;
                let start = 0;

                for (let i = 0; i < buffer.length; i++) {
                    if (buffer[i] === '{') {
                        if (depth === 0) start = i;
                        depth++;
                    } else if (buffer[i] === '}') {
                        depth--;
                        if (depth === 0) {
                            // Full object found
                            const jsonStr = buffer.substring(start, i + 1);
                            try {
                                const json = JSON.parse(jsonStr);
                                if (json.candidates?.[0]?.content?.parts?.[0]?.text) {
                                    const chunkText = json.candidates[0].content.parts[0].text;
                                    aiResponseText += chunkText;

                                    // Update UI
                                    setActiveMessages(prev => {
                                        const newMsgs = [...prev];
                                        const last = newMsgs[newMsgs.length - 1];
                                        if (last.id === tempAssistantId) last.content = aiResponseText;
                                        return newMsgs;
                                    });
                                }
                            } catch(e) { /* ignore */ }

                            // Advance buffer past this object and any comma
                            // We need to slice buffer correctly.
                            // Since we are iterating `i`, we can't slice immediately inside loop easily without adjusting `i`.
                            // Better: process one, slice, break loop to restart on new buffer?
                            // Yes.

                            buffer = buffer.substring(i + 1);
                            if (buffer.startsWith(',')) buffer = buffer.substring(1);
                            if (buffer.startsWith(']')) buffer = buffer.substring(1); // End of stream

                            // Restart loop on new buffer
                            i = -1; // Next iteration will be 0
                            start = 0;
                        }
                    }
                }
             }
        } else {
            aiResponseText = "No API Key.";
             setActiveMessages(prev => {
                const newMsgs = [...prev];
                const last = newMsgs[newMsgs.length - 1];
                if (last.id === tempAssistantId) last.content = aiResponseText;
                return newMsgs;
            });
        }

        // Post-processing (Memory/Code)
        const memRegex = /\[UPDATE_MEMORY:\s*(.*?)\]/g;
        let memMatch;
        let memoryUpdated = false;
        while ((memMatch = memRegex.exec(aiResponseText)) !== null) {
             const fact = memMatch[1];
             const currentMem = (await db.getSetting(memKey)) || "";
             const newMem = currentMem + (currentMem ? "\n" : "") + "- " + fact;
             await db.setSetting(memKey, newMem);
             memoryUpdated = true;
        }
        if (memoryUpdated) aiResponseText = aiResponseText.replace(memRegex, '').trim();

        // Save final
        await chatStore.addMessage(activeChatId, 'assistant', aiResponseText);
        setChats(await chatStore.getChats(user.id));
        const finalChat = await chatStore.getChat(activeChatId);
        setActiveMessages(finalChat.messages);

    } catch (err) {
        console.error(err);
        await chatStore.addMessage(activeChatId, 'assistant', "Error: " + err.message);
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
        availableModels={availableModels}
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
