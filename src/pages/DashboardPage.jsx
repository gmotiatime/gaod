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

  // HELPER: Generate Image via Google AI (Restored)
  const generateImageWithGoogle = async (prompt) => {
      const googleKey = localStorage.getItem('gaod_google_key');
      const modelId = localStorage.getItem('gaod_google_image_model') || 'gemini-3-pro-image-preview';

      if (!googleKey) throw new Error("No Google AI API Key configured for Image Tool.");

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${googleKey}`;

      const payload = {
          instances: [{ prompt: prompt }],
          parameters: { sampleCount: 1 }
      };

      const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `Google API Error ${res.status}`);
      }

      const data = await res.json();
      const base64 = data.predictions?.[0]?.bytesBase64Encoded || data.predictions?.[0];

      if (typeof base64 === 'string') {
          return `data:image/png;base64,${base64}`;
      } else if (data.predictions?.[0]?.mimeType && data.predictions?.[0]?.bytesBase64Encoded) {
          return `data:${data.predictions[0].mimeType};base64,${data.predictions[0].bytesBase64Encoded}`;
      }

      throw new Error("Unexpected response format from Google Image API");
  };

  // HELPER: Web Search (Google Programmable Search)
  const performWebSearch = async (query) => {
      const apiKey = localStorage.getItem('gaod_search_key');
      const cx = localStorage.getItem('gaod_search_cx');

      if (!apiKey || !cx) {
          throw new Error("Google Search API Key or Engine ID (CX) not configured in Admin.");
      }

      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
      const res = await fetch(url);

      if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `Search API Error ${res.status}`);
      }

      const data = await res.json();
      if (!data.items || data.items.length === 0) {
          return "No results found.";
      }

      // Format top 3 results
      return data.items.slice(0, 3).map((item, i) => (
          `**${i+1}. [${item.title}](${item.link})**\n${item.snippet}`
      )).join('\n\n');
  };

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
        const userMemory = localStorage.getItem(getUserMemoryKey(user.id)) || "No previous memory.";

        // EXPANDED TOOL & COT INSTRUCTIONS
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
2. **WEB_SEARCH**: Search the web for current information.
   Syntax: [WEB_SEARCH: <query>]
3. **GENERATE_IMAGE**: Generate an image based on a prompt.
   Syntax: [GENERATE_IMAGE: <prompt>]
4. **EXECUTE_CODE**: Run simple JavaScript code (math, logic).
   Syntax: [EXECUTE_CODE: <code>]

**Guidelines:**
- If the user asks for an image, use [GENERATE_IMAGE].
- If the user asks for real-time info, use [WEB_SEARCH].
- If you learn something new (e.g. user's job, favorite color), use [UPDATE_MEMORY].
- Do not output tool results yourself (e.g., do not hallucinate search results), just output the tag. The system will handle it.
`;

        const fullSystemPrompt = (systemPrompt ? systemPrompt + "\n" : "") + toolInstructions;

        let usedRealApi = false;

        // --- STANDARD TEXT CHAT ---
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

        // --- TOOL PARSING & EXECUTION ---

        // 1. UPDATE_MEMORY
        const memRegex = /\[UPDATE_MEMORY:\s*(.*?)\]/g;
        let memMatch;
        let memoryUpdated = false;
        while ((memMatch = memRegex.exec(aiResponseText)) !== null) {
             const fact = memMatch[1];
             const currentMem = localStorage.getItem(getUserMemoryKey(user.id)) || "";
             const newMem = currentMem + (currentMem ? "\n" : "") + "- " + fact;
             localStorage.setItem(getUserMemoryKey(user.id), newMem);
             memoryUpdated = true;
        }
        if (memoryUpdated) aiResponseText = aiResponseText.replace(memRegex, '').trim();

        // 2. WEB_SEARCH
        const searchRegex = /\[WEB_SEARCH:\s*(.*?)\]/g;
        let searchMatch;
        while ((searchMatch = searchRegex.exec(aiResponseText)) !== null) {
            const query = searchMatch[1];
            try {
                const searchResults = await performWebSearch(query);
                aiResponseText = aiResponseText.replace(searchMatch[0], `**Search Results for "${query}":**\n\n${searchResults}`);
            } catch (e) {
                // Fallback / Error
                const searchKey = localStorage.getItem('gaod_search_key');
                if (!searchKey) {
                    // Sim
                    const mockResult = `**Found simulated results for "${query}":**\n- Wikipedia: ${query}\n- News: Latest on ${query}`;
                    aiResponseText = aiResponseText.replace(searchMatch[0], mockResult + "\n\n(Note: Add Google Search Key in Admin for real results)");
                } else {
                    aiResponseText = aiResponseText.replace(searchMatch[0], `(Search Failed: ${e.message})`);
                }
            }
        }

        // 3. GENERATE_IMAGE
        const imgRegex = /\[GENERATE_IMAGE:\s*(.*?)\]/g;
        let imgMatch;
        while ((imgMatch = imgRegex.exec(aiResponseText)) !== null) {
             const prompt = imgMatch[1];
             try {
                const imageUrl = await generateImageWithGoogle(prompt);
                aiResponseText = aiResponseText.replace(imgMatch[0], `![Generated Image](${imageUrl})`);
             } catch (e) {
                // Fallback simulation
                if (!googleKey) {
                    aiResponseText = aiResponseText.replace(imgMatch[0], `![Simulated Image - Nano Banano Pro](https://placehold.co/1024x1024/1A1A1A/FFF?text=${encodeURIComponent(prompt)})`);
                } else {
                    aiResponseText = aiResponseText.replace(imgMatch[0], `(Image Gen Failed: ${e.message})`);
                }
             }
        }

        // 4. EXECUTE_CODE
        const codeRegex = /\[EXECUTE_CODE:\s*(.*?)\]/g;
        let codeMatch;
        while ((codeMatch = codeRegex.exec(aiResponseText)) !== null) {
             const code = codeMatch[1];
             try {
                // Safe(r) eval
                // eslint-disable-next-line no-new-func
                const result = new Function(`return (${code})`)();
                aiResponseText = aiResponseText.replace(codeMatch[0], `\`\`\`output\n${result}\n\`\`\``);
             } catch (e) {
                aiResponseText = aiResponseText.replace(codeMatch[0], `(Code Error: ${e.message})`);
             }
        }

        // Fallback Simulation (if no API used or explicit error without text)
        if (!usedRealApi && !aiResponseText.startsWith('[Error') && !aiResponseText.includes('<thinking>')) {
             await new Promise(resolve => setTimeout(resolve, 800));

             // Simulation Logic for CoT
             aiResponseText = `<thinking>
I should check if the user is asking for a specific task.
User said: "${content}"
This looks like a general query. I will respond politely.
<reflection>My tone should be helpful and concise.</reflection>
</thinking>

[Simulated ${model.name} Response]
I received: "${content}".
`;
             if (content.toLowerCase().includes('search')) {
                 aiResponseText += `\n[WEB_SEARCH: ${content}]`;
                 // Manually run search replace for simulation if we hit this block
                 // But wait, the loop above already ran. If we add tag now, it won't be processed.
                 // So we must manually process simulation here or re-run regex.
                 // Ideally simulation emits tags, then we re-run loop. But simplest is just replace here.
                 aiResponseText = aiResponseText.replace(/\[WEB_SEARCH:\s*(.*?)\]/, '**Simulated Search Result** (No API Key)');
             }
        }

        chatStore.addMessage(activeChatId, 'assistant', aiResponseText);

        const finalChat = chatStore.getChat(activeChatId);
        setActiveMessages(finalChat.messages);
        setChats(chatStore.getChats());

        if (isFirstMessage) generateTitle(content, activeChatId);

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
