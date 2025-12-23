import { useState, useCallback, useRef } from 'react';
import { chatStore } from '../lib/chatStore';
import { ChatService } from '../lib/chatService';

export const useChat = (activeChatId, user) => {
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const sendMessage = useCallback(async (content, model, attachments = []) => {
    if (!activeChatId || !user || !content.trim()) return;

    // Prevent double submit
    if (isTyping) return;

    setIsTyping(true);
    setError(null);

    // Cancel previous request if any (though logic above prevents new one)
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    let finalContent = content;
    if (attachments.length > 0) {
        finalContent += `\n\n[Attached ${attachments.length} file(s): ${attachments.map(a => a.name).join(', ')}]`;
    }

    try {
        // 1. Optimistic Update
        await chatStore.addMessage(activeChatId, 'user', finalContent);

        // 2. Call Service
        // Note: We are not passing signal to service yet as fetch in service is simple.
        // In a real robust implementation, pass signal down.
        const responseText = await ChatService.generateResponse(
            user.id,
            finalContent,
            model,
            (chunk) => {
                // Handle streaming updates if supported
                // For now, we wait for full response, but this hook is ready.
            }
        );

        // 3. Update with Response
        await chatStore.addMessage(activeChatId, 'assistant', responseText);

        // 4. Update Title if first message
        const chat = await chatStore.getChat(activeChatId);
        if (chat && chat.messages.length <= 2) {
            // chatStore might have already handled title or we do it here.
            // Current `addMessage` logic in chatStore handles title update partially.
        }

    } catch (err) {
        if (err.name === 'AbortError') {
            console.log('Request cancelled');
        } else {
            console.error('Message failed', err);
            setError(err.message);
            await chatStore.addMessage(activeChatId, 'assistant', "Error: Could not generate response.");
        }
    } finally {
        setIsTyping(false);
        abortControllerRef.current = null;
    }
  }, [activeChatId, user, isTyping]);

  const cancelRequest = useCallback(() => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          setIsTyping(false);
      }
  }, []);

  return {
      sendMessage,
      cancelRequest,
      isTyping,
      error
  };
};
