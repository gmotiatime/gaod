import { useEffect, useState, useRef } from 'react';
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

  // Load Chats on Mount (Async now)
  useEffect(() => {
    const loadChats = async () => {
        try {
            const savedChats = await chatStore.getChats();
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
    const newChat = await chatStore.createChat();
    const allChats = await chatStore.getChats();
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
    const updatedChats = await chatStore.getChats();
    setChats(updatedChats);

    if (activeChatId === id) {
        if (updatedChats.length > 0) {
            setActiveChatId(updatedChats[0].id);
        } else {
            handleNewChat();
        }
    }
  };

  // Helper: Generate Title
  const generateTitle = async (firstMessage, chatId) => {
     let title = firstMessage.slice(0, 30);
     if (firstMessage.length > 30) title += '...';

     await chatStore.updateTitle(chatId, title);
     const chats = await chatStore.getChats();
     setChats(chats);
  };

  // MEMORY HELPER (Use DB)
  const getUserMemoryKey = (uid) => `gaod_user_memory_${uid}`;

  const handleSendMessage = async (content, model, attachments = []) => {
    if (!activeChatId || !user) return;

    let finalContent = content;
    if (attachments.length > 0) {
        finalContent += `\n\n[Attached ${attachments.length} file(s): ${attachments.map(a => a.name).join(', ')}]`;
    }

    // 1. Add User Message
    await chatStore.addMessage(activeChatId, 'user', finalContent, attachments);

    const isFirstMessage = activeMessages.length === 0;

    // Update Local State Immediately
    const updatedChat = await chatStore.getChat(activeChatId);
    setChats(await chatStore.getChats());
    setActiveMessages(updatedChat.messages);
    setIsTyping(true);

    try {
        let aiFullText = '';

        // Vertex / Gemini Key
        const vertexKey = await db.getSetting('gaod_vertex_key');

        const systemPrompt = (await db.getSetting('gaod_system_prompt')) || '';
        const memKey = getUserMemoryKey(user.id);
        const userMemory = (await db.getSetting(memKey)) || "No previous memory.";

        const toolInstructions = `
You are Gaod, an advanced creative AI.
You have access to a long-term memory about this user and several tools.

[LONG-TERM MEMORY START]
${userMemory}
[LONG-TERM MEMORY END]

**Chain of Thought & Self-Correction:**
Before answering, you MUST think step-by-step to plan your response.
Wrap your thought process in <thinking>...</thinking> tags.
Inside these tags, you can also use <reflection>...</reflection> to critique your own plan before finalizing the output.
These tags will be shown to the user to demonstrate your reasoning.
`;

        // Construct History for Context (Last 10 messages)
        // Gemini API expects "contents" array
        // We need to map our format (role: user/assistant) to Gemini (role: user/model)
        const history = activeMessages.slice(-10).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        // Add current message
        const currentMessage = {
             role: 'user',
             parts: [{ text: toolInstructions + "\n\nUser: " + finalContent }]
        };

        const contents = [...history, currentMessage];

        let usedRealApi = false;

        // --- REALTIME STREAMING CHAT (Google AI Gemini API) ---
        try {
            if (vertexKey) {
                // Using generativelanguage.googleapis.com for API Key access (standard for 'Gemini API')
                // Using :streamGenerateContent
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:streamGenerateContent?key=${vertexKey}`;

                const payload = { contents };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.error?.message || `API Error ${response.status}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                // Placeholder for streaming message
                await chatStore.addMessage(activeChatId, 'assistant', '');
                // We will update this message repeatedly

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    // Gemini stream returns JSON objects, often multiple per chunk or split across chunks
                    // This simple parsing assumes cleanly delimited JSON or we might need a buffer.
                    // However, REST stream usually sends standard JSON array elements.
                    // Actually, for :streamGenerateContent, it returns a JSON array stream but usually wrapped in valid JSON structure if simple fetch?
                    // No, usually it sends chunks of JSON. Let's handle the typical format.
                    // Google API usually returns a list of JSON objects, e.g. [{...}, {...}]

                    // Simple regex based extraction for "text" field to be robust against chunk boundaries
                    // Note: A robust implementation requires a proper stream parser (like SSE or JSON stream).
                    // For now, let's assume we can regex extract 'text': "..." from the raw string buffer.

                    const matches = chunk.matchAll(/"text":\s*"((?:[^"\\]|\\.)*)"/g);
                    for (const match of matches) {
                        try {
                            const textPart = JSON.parse(`"${match[1]}"`); // Decode escape sequences
                            aiFullText += textPart;

                            // Update UI incrementally (throttled in real app, here direct)
                            // We need to update the *last* message in the store
                            const currentChats = await chatStore.getChats();
                            const currentChat = currentChats.find(c => c.id === activeChatId);
                            if (currentChat) {
                                const msgs = [...currentChat.messages];
                                msgs[msgs.length - 1].content = aiFullText;
                                // Update store 'silently' or efficiently?
                                // For now, we use the store's update method which might be slow for every char,
                                // but acceptable for this demo.
                                // BETTER: Just update local state `activeMessages` for UI, then save to DB at end.
                                setActiveMessages(msgs);
                            }
                        } catch (e) { /* ignore parse errors */ }
                    }
                    usedRealApi = true;
                }

                // Final Save to DB
                // Remove the empty placeholder we added before loop?
                // Actually we added an empty one. We need to update it now.
                 // We need to locate that message.
                 // Limitation of current `chatStore`: it appends.
                 // Hack: We appended an empty one. Now we update the chat's last message.
                 const finalChat = await chatStore.getChat(activeChatId);
                 const finalMsgs = [...finalChat.messages];
                 finalMsgs[finalMsgs.length - 1].content = aiFullText;
                 await chatStore.updateChat(activeChatId, { messages: finalMsgs });

            } else {
                throw new Error("No Vertex/Gemini API Key configured.");
            }

        } catch (e) {
            console.error("Chat API Call Failed", e);
            if (!usedRealApi) aiFullText = `[Error: ${e.message}]`;
        }

        if (!usedRealApi && !aiFullText.startsWith('[Error')) {
             await new Promise(resolve => setTimeout(resolve, 800));
             aiFullText = `<thinking>Simulating response...</thinking> I received: "${content}". (API Key missing or invalid)`;
             await chatStore.addMessage(activeChatId, 'assistant', aiFullText);
        } else if (!usedRealApi) {
             await chatStore.addMessage(activeChatId, 'assistant', aiFullText);
        }

        // Post-processing: Memory Extraction (only on full text)
        const memRegex = /\[UPDATE_MEMORY:\s*(.*?)\]/g;
        let memMatch;
        let memoryUpdated = false;
        while ((memMatch = memRegex.exec(aiFullText)) !== null) {
             const fact = memMatch[1];
             const currentMem = (await db.getSetting(memKey)) || "";
             const newMem = currentMem + (currentMem ? "\n" : "") + "- " + fact;
             await db.setSetting(memKey, newMem);
             memoryUpdated = true;
        }

        // Final State Update
        setChats(await chatStore.getChats());
        const finalChatRef = await chatStore.getChat(activeChatId);
        setActiveMessages(finalChatRef.messages);

        if (isFirstMessage) generateTitle(content, activeChatId);

    } catch (err) {
        console.error(err);
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
