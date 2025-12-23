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
     let title = firstMessage.slice(0, 30);
     if (firstMessage.length > 30) title += '...';

     const chats = JSON.parse(localStorage.getItem('brand_ai_chats') || '[]');
     const chatIndex = chats.findIndex(c => c.id === chatId);
     if (chatIndex >= 0) {
         chats[chatIndex].title = title;
         localStorage.setItem('brand_ai_chats', JSON.stringify(chats));
         setChats(chats);
     }
  };

  // MEMORY HELPER
  const getUserMemoryKey = (uid) => `gaod_user_memory_${uid}`;

  const handleSendMessage = async (content, model, attachments = []) => {
    if (!activeChatId || !user) return;

    let finalContent = content;
    if (attachments.length > 0) {
        finalContent += `\n\n[Attached ${attachments.length} file(s): ${attachments.map(a => a.name).join(', ')}]`;
    }

    chatStore.addMessage(activeChatId, 'user', finalContent, attachments);

    const isFirstMessage = activeMessages.length === 0;

    const updatedChat = chatStore.getChat(activeChatId);
    setChats(chatStore.getChats());
    setActiveMessages(updatedChat.messages);
    setIsTyping(true);

    try {
        let aiResponseText = '';

        const openAiKey = localStorage.getItem('gaod_openai_key');
        const anthropicKey = localStorage.getItem('gaod_anthropic_key');
        const googleKey = localStorage.getItem('gaod_google_key');

        // System Prompt Components
        const systemPrompt = localStorage.getItem('gaod_system_prompt') || '';

        // Load User Memory
        const userMemory = localStorage.getItem(getUserMemoryKey(user.id)) || "No previous memory.";

        // INJECT MEMORY & TOOL INSTRUCTIONS
        const toolInstructions = `
You have access to a long-term memory about this user and a calculator tool.

[LONG-TERM MEMORY START]
${userMemory}
[LONG-TERM MEMORY END]

TOOLS:
1. UPDATE_MEMORY: To save important facts about the user (name, preferences, details) for future chats.
   Syntax: [UPDATE_MEMORY: <fact>]
2. CALCULATE: To evaluate mathematical expressions.
   Syntax: [CALCULATE: <expression>]

If you learn something new about the user, ALWAYS use the [UPDATE_MEMORY] tool to save it.
`;

        const fullSystemPrompt = (systemPrompt ? systemPrompt + "\n" : "") + toolInstructions;

        let usedRealApi = false;

        // --- STANDARD TEXT CHAT (With Tool Injection) ---
        try {
            const messagesPayload = [];
            messagesPayload.push({ role: 'system', content: fullSystemPrompt });

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
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${googleKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: fullSystemPrompt + "\n\nUser: " + finalContent }] }]
                    })
                });
                if (!res.ok) throw new Error(`Google Error: ${res.status}`);
                const data = await res.json();
                if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    aiResponseText = data.candidates[0].content.parts[0].text;
                    usedRealApi = true;
                }
            } else if (model.provider === 'anthropic' && anthropicKey) {
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
                        system: fullSystemPrompt,
                        messages: messagesPayload.filter(m => m.role !== 'system')
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
            console.error("Chat API Call Failed", e);
            aiResponseText = `[Error: ${e.message}]`;
        }

        // --- TOOL EXECUTION LOGIC ---

        // 1. UPDATE_MEMORY
        const memRegex = /\[UPDATE_MEMORY:\s*(.*?)\]/g;
        let memMatch;
        let memoryUpdated = false;

        // We use loop to catch multiple updates
        while ((memMatch = memRegex.exec(aiResponseText)) !== null) {
             const fact = memMatch[1];
             const currentMem = localStorage.getItem(getUserMemoryKey(user.id)) || "";
             const newMem = currentMem + (currentMem ? "\n" : "") + "- " + fact;
             localStorage.setItem(getUserMemoryKey(user.id), newMem);
             memoryUpdated = true;
        }

        if (memoryUpdated) {
            // Remove the tags from response to keep it clean, or keep them?
            // Usually we hide tool outputs. Let's remove them for cleaner UI.
            aiResponseText = aiResponseText.replace(memRegex, '').trim();
            // Append a small indicator
            // aiResponseText += "\n\n(Memory Updated)";
        }

        // 2. CALCULATE
        const calcRegex = /\[CALCULATE:\s*(.*?)\]/g;
        let calcMatch;
        let calcReplacements = [];

        while ((calcMatch = calcRegex.exec(aiResponseText)) !== null) {
            const expr = calcMatch[1];
            try {
                // Dangerous eval, but for this demo/proto we can restrict regex or use Function
                // Restrict input to digits and operators
                if (/^[0-9+\-*/().\s]+$/.test(expr)) {
                    // eslint-disable-next-line no-new-func
                    const result = new Function(`return ${expr}`)();
                    calcReplacements.push({ match: calcMatch[0], result: result });
                } else {
                    calcReplacements.push({ match: calcMatch[0], result: "(Invalid Expression)" });
                }
            } catch (e) {
                calcReplacements.push({ match: calcMatch[0], result: "(Calc Error)" });
            }
        }

        // Apply Calc Replacements
        calcReplacements.forEach(rep => {
            aiResponseText = aiResponseText.replace(rep.match, `**${rep.result}**`);
        });


        // Fallback Simulation for main chat
        if (!usedRealApi && !aiResponseText.startsWith('[Error')) {
             await new Promise(resolve => setTimeout(resolve, 800));

             // Simulation Logic
             if (content.toLowerCase().includes('my name is')) {
                 const name = content.split('is')[1].trim();
                 aiResponseText = `Nice to meet you, ${name}. I will remember that.\n[UPDATE_MEMORY: User's name is ${name}]`;
                 // Run local tool logic manually since we set the string
                 const currentMem = localStorage.getItem(getUserMemoryKey(user.id)) || "";
                 localStorage.setItem(getUserMemoryKey(user.id), currentMem + "\n- User's name is " + name);
                 aiResponseText = aiResponseText.replace(/\[UPDATE_MEMORY:.*?\]/, '').trim();
             } else if (content.toLowerCase().includes('calculate')) {
                 aiResponseText = "Sure. [CALCULATE: 25 * 4]";
                 aiResponseText = aiResponseText.replace('[CALCULATE: 25 * 4]', '**100**');
             } else if (content.toLowerCase().includes('who am i') || content.toLowerCase().includes('what is my name')) {
                 aiResponseText = `Based on my memory: \n${userMemory}`;
             } else {
                 aiResponseText = `[Simulated ${model.name} Response]\nI received: "${content}".\nMy memory of you: ${userMemory.length > 20 ? 'Has Data' : 'Empty'}`;
             }
        }

        // 3. Add AI Message
        chatStore.addMessage(activeChatId, 'assistant', aiResponseText);

        // Refresh State
        const finalChat = chatStore.getChat(activeChatId);
        setActiveMessages(finalChat.messages);
        setChats(chatStore.getChats());

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
