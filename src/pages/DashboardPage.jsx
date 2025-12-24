import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import ChatInterface from '../components/dashboard/ChatInterface';
import SettingsModal from '../components/dashboard/SettingsModal';
import { auth } from '../lib/auth';
import { chatStore } from '../lib/chatStore';
import { db } from '../lib/db';
import { Validator, chatRateLimiter, logger } from '../lib/security';

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
    const reqId = logger.info('Message attempt', { userId: user?.id, chatLength: content?.length });

    if (!activeChatId || !user) {
        logger.warn('Message attempt failed: No active chat or user', { reqId });
        return;
    }

    // 1. Rate Limiting Check
    const rateLimit = chatRateLimiter.check(user.id, 'sendMessage');
    if (!rateLimit.allowed) {
        const msg = `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds.`;
        logger.warn('Rate limit hit', { userId: user.id, reqId });
        // Optimistically add system message or alert
        // Here we just don't send. In a better UI we'd show a toast.
        // For now, we simulate a system response error.
        await chatStore.addMessage(activeChatId, 'assistant', `[System] ${msg}`);
        const updatedChat = await chatStore.getChat(activeChatId);
        setActiveMessages(updatedChat.messages);
        return;
    }

    // 2. Input Validation
    const validation = Validator.validateMessage(content, 'user');
    if (!validation.isValid) {
        logger.warn('Validation failed', { errors: validation.errors, reqId });
        return; // Or show error to user
    }

    let finalContent = content;
    if (attachments.length > 0) {
        finalContent += `\n\n[Attached ${attachments.length} file(s): ${attachments.map(a => a.name).join(', ')}]`;
    }

    // Add User Message
    await chatStore.addMessage(activeChatId, 'user', finalContent);

    // Refresh UI
    const updatedChat = await chatStore.getChat(activeChatId);
    setChats(await chatStore.getChats(user.id));
    setActiveMessages(updatedChat.messages);
    setIsTyping(true);

    const isFirstMessage = updatedChat.messages.length <= 1;

    try {
        let aiResponseText = '';

        // Vertex Key only
        // SECURITY NOTE: Key is fetched from DB (simulated server env) but used in client.
        // This is a known architectural limitation of Client-Side-Only implementation.
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

**Tools:**
1. **UPDATE_MEMORY**: Save important facts, context, style preferences, or unresolved tasks.
   Syntax: [UPDATE_MEMORY: <fact>]
2. **EXECUTE_CODE**: Run simple JavaScript code (math, logic).
   Syntax: [EXECUTE_CODE: <code>]

**Guidelines:**
- If you learn something new (e.g. user's job, favorite color), use [UPDATE_MEMORY].
- Do not output tool results yourself (e.g., do not hallucinate search results), just output the tag. The system will handle it.
`;

        const fullSystemPrompt = (systemPrompt ? systemPrompt + "\n" : "") + toolInstructions;

        let usedRealApi = false;

        // --- STANDARD TEXT CHAT (VERTEX ONLY) ---
        try {
            if (vertexKey) {
                const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/${model.id}:generateContent?key=${vertexKey}`;

                const payload = {
                    contents: [{
                        role: 'user',
                        parts: [{ text: fullSystemPrompt + "\n\nUser: " + finalContent }]
                    }]
                };

                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error?.message || `Vertex API Error ${res.status}`);
                }

                const data = await res.json();
                if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    aiResponseText = data.candidates[0].content.parts[0].text;
                    usedRealApi = true;
                }
            } else {
                throw new Error("No Vertex AI API Key configured.");
            }

        } catch (e) {
            logger.error("Chat API Call Failed", { error: e.message, reqId });
            aiResponseText = `[Error: ${e.message}]`;
        }

        // --- TOOL PARSING & EXECUTION ---

        // 1. UPDATE_MEMORY
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

        // 2. EXECUTE_CODE
        const codeRegex = /\[EXECUTE_CODE:\s*(.*?)\]/g;
        let codeMatch;
        while ((codeMatch = codeRegex.exec(aiResponseText)) !== null) {
             const code = codeMatch[1];
             try {
                // Safe(r) eval

                const result = new Function(`return (${code})`)();
                aiResponseText = aiResponseText.replace(codeMatch[0], `\`\`\`output\n${result}\n\`\`\``);
             } catch (e) {
                aiResponseText = aiResponseText.replace(codeMatch[0], `(Code Error: ${e.message})`);
             }
        }

        if (!usedRealApi && !aiResponseText.startsWith('[Error') && !aiResponseText.includes('<thinking>')) {
             await new Promise(resolve => setTimeout(resolve, 800));

             // Simulation Logic for CoT
             aiResponseText = `<thinking>
I see the user wants to chat.
User said: "${content}"
I am running in simulation mode because the API call failed or no key was provided.
<reflection>I should simulate a helpful Vertex AI response.</reflection>
</thinking>

[Simulated Vertex AI Response]
I received: "${content}".
`;
        }

        await chatStore.addMessage(activeChatId, 'assistant', aiResponseText);

        const finalChat = await chatStore.getChat(activeChatId);
        setActiveMessages(finalChat.messages);
        setChats(await chatStore.getChats(user.id));

        if (isFirstMessage) generateTitle(content, activeChatId);

    } catch (err) {
        await chatStore.addMessage(activeChatId, 'assistant', "Error generating response.");
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
