import { db } from './db';
import { chatStore } from './chatStore';

export const ChatService = {
  /**
   * Generates a response from the AI.
   * Handles tool execution (Memory, Code) and system prompting.
   *
   * @param {string} userId - The user ID.
   * @param {string} message - The user's message.
   * @param {object} model - The model configuration (id, etc.).
   * @param {function} onStream - Callback for streaming chunks (text).
   * @returns {Promise<string>} - The full response text.
   */
  generateResponse: async (userId, message, model, onStream) => {
    // 1. Prepare Context (System Prompt + Memory)
    const vertexKey = await db.getSetting('gaod_vertex_key');
    const systemPrompt = (await db.getSetting('gaod_system_prompt')) || '';
    const memKey = `gaod_user_memory_${userId}`;
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

    let aiResponseText = '';
    let usedRealApi = false;

    // 2. Call API (Vertex / Proxy)
    try {
        if (vertexKey) {
            const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/${model.id}:generateContent?key=${vertexKey}`;
            // Note: Use streamGenerateContent for real streaming if supported by endpoint,
            // but for now we stick to generateContent as per original code,
            // OR we can implement streaming if the endpoint supports it.
            // The original code used generateContent (non-streaming).
            // Let's stick to generateContent for stability as requested,
            // but structure this to support streaming later (via onStream).

            const payload = {
                contents: [{
                    role: 'user',
                    parts: [{ text: fullSystemPrompt + "\n\nUser: " + message }]
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
                if (onStream) onStream(aiResponseText); // Simulate single chunk
            }
        } else {
            throw new Error("No Vertex AI API Key configured.");
        }
    } catch (e) {
        console.error("Chat API Call Failed", e);
        // Fallback or rethrow? Original code simulated a response.
        // We will return the error or simulation in the text.
        if (!usedRealApi) {
             // Simulation Logic
             await new Promise(resolve => setTimeout(resolve, 800));
             aiResponseText = `<thinking>
I see the user wants to chat.
User said: "${message}"
I am running in simulation mode because the API call failed or no key was provided.
<reflection>I should simulate a helpful Vertex AI response.</reflection>
</thinking>

[Simulated Vertex AI Response]
I received: "${message}".
`;
            if (onStream) onStream(aiResponseText);
        }
    }

    // 3. Post-Process (Tools)

    // Memory
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

    // Code
    const codeRegex = /\[EXECUTE_CODE:\s*(.*?)\]/g;
    let codeMatch;
    while ((codeMatch = codeRegex.exec(aiResponseText)) !== null) {
            const code = codeMatch[1];
            try {
            const result = new Function(`return (${code})`)();
            aiResponseText = aiResponseText.replace(codeMatch[0], `\`\`\`output\n${result}\n\`\`\``);
            } catch (e) {
            aiResponseText = aiResponseText.replace(codeMatch[0], `(Code Error: ${e.message})`);
            }
    }

    return aiResponseText;
  }
};
