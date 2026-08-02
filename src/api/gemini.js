const API_URL = import.meta.env.VITE_API_URL;

let conversationHistory = [];

export function resetChat() {
  conversationHistory = [];
}

export async function sendMessage(message, onChunk) {
  conversationHistory.push({ role: 'user', content: message });

  const messages = [...conversationHistory];

  try {
    const response = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, messages }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.message || errorData?.error || `Error HTTP ${response.status}`;
      throw new Error(errorMsg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data?.choices?.[0]?.delta?.content || data?.content;
            if (text) {
              fullResponse += text;
              if (onChunk) onChunk(fullResponse, false);
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    }

    conversationHistory.push({ role: 'assistant', content: fullResponse });

    if (onChunk) onChunk(fullResponse, true);
    return fullResponse;
  } catch (error) {
    throw error;
  }
}
