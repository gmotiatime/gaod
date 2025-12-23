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

  // HELPER: Generate Image via Google AI (Nano Banano Pro)
  const generateImageWithGoogle = async (prompt) => {
      const googleKey = localStorage.getItem('gaod_google_key');
      const modelId = localStorage.getItem('gaod_google_image_model') || 'gemini-3-pro-image-preview';

      if (!googleKey) throw new Error("No Google AI API Key configured for Image Tool.");

      // Endpoint: Try standard Imagen/Gemini Predict
      // Note: "gemini-3-pro-image-preview" might need `generateContent` or `predict`.
      // We will try standard `predict` payload for Imagen style, or `generateContent` if it is a multimodal gemini.
      // Based on snippet, it's a "Gemini" model ID. So `generateContent` is likely correct but for IMAGES it usually returns inline data or needs specific payload.
      // Standard Imagen 3 API: `POST .../models/imagen-3.0-generate-001:predict`
      // If user sets ID to `gemini-3-pro-image-preview`, we assume it behaves like Imagen or Gemini with image output.
      // Let's try the `predict` endpoint structure first as it's common for image generation models in Vertex/AI Studio.

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${googleKey}`;

      // Payload for Imagen
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
          // Fallback: If 404/400, maybe it's a Gemini model needing `generateContent`?
          // But `generateContent` usually returns text/multimodal, unless we ask for media.
          // Let's assume standard error first.
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `Google API Error ${res.status}`);
      }

      const data = await res.json();
      // Expect: { predictions: [ { bytesBase64Encoded: "..." } ] }
      const base64 = data.predictions?.[0]?.bytesBase64Encoded || data.predictions?.[0]; // sometimes just string

      if (typeof base64 === 'string') {
          return `data:image/png;base64,${base64}`;
      } else if (data.predictions?.[0]?.mimeType && data.predictions?.[0]?.bytesBase64Encoded) {
          return `data:${data.predictions[0].mimeType};base64,${data.predictions[0].bytesBase64Encoded}`;
      }

      throw new Error("Unexpected response format from Google Image API");
  };


  const handleSendMessage = async (content, model, attachments = []) => {
    if (!activeChatId) return;

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
        const systemPrompt = localStorage.getItem('gaod_system_prompt') || '';

        // INJECT TOOL INSTRUCTIONS
        const toolInstructions = `
You have access to an image generation tool called "Nano Banano Pro" (Google AI).
If the user asks to generate, create, or draw an image, you MUST output a special tag.
Tag Format: [GENERATE_IMAGE: <detailed prompt>]
Do not describe the image in text if you use the tag. Just output the tag.
Example: [GENERATE_IMAGE: A futuristic city with neon lights, realistic style]
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
                        // Note: Gemini API system instruction format varies, embedding in prompt for broad compatibility here
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
        // Check for [GENERATE_IMAGE: ...]
        const imageTagRegex = /\[GENERATE_IMAGE:\s*(.*?)\]/;
        const match = aiResponseText.match(imageTagRegex);

        if (match) {
            const prompt = match[1];
            // Call Google Image API
            try {
                // Replace tag with loading or placeholder first?
                // We'll wait for generation then replace.
                const imageUrl = await generateImageWithGoogle(prompt);
                // Replace the tag with Markdown Image
                aiResponseText = aiResponseText.replace(match[0], `![Generated Image](${imageUrl})`);
            } catch (imgErr) {
                 // Simulation Fallback if API fails (likely 404 or auth in this demo environment)
                 console.error("Image Gen Failed", imgErr);
                 // If we have a key but it failed (e.g. wrong model ID), show error.
                 // If no key (likely in this sandbox), simulate.
                 if (!googleKey) {
                     aiResponseText = aiResponseText.replace(match[0], `![Simulated Image - Nano Banano Pro](https://placehold.co/1024x1024/1A1A1A/FFF?text=${encodeURIComponent(prompt)})`);
                 } else {
                     aiResponseText += `\n\n(Image Generation Failed: ${imgErr.message})`;
                 }
            }
        }

        // Fallback Simulation for main chat
        if (!usedRealApi && !aiResponseText.startsWith('[Error')) {
             await new Promise(resolve => setTimeout(resolve, 800));

             // Check if user asked for image in simulation
             if (content.toLowerCase().includes('image') || content.toLowerCase().includes('draw')) {
                 aiResponseText = `I will create that for you.\n\n![Simulated Image - Nano Banano Pro](https://placehold.co/1024x1024/1A1A1A/FFF?text=Simulated+Google+Image)`;
             } else {
                 aiResponseText = `[Simulated ${model.name} Response]\n\nI received: "${content}".\n\n(Nano Banano Pro tool is active)`;
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
