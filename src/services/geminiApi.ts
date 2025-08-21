const GEMINI_API_KEY = "AIzaSyBEbMJuAqBrUitT0U0ZFWN7l5nt3dFqnNw";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GeminiApiService {
  private async makeRequest(messages: ChatMessage[]): Promise<string> {
    // Convert messages to Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    try {
      return await this.makeRequest(messages);
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  async *generateStreamResponse(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
    // For now, we'll simulate streaming by yielding the full response
    // In a real implementation, you'd use the streaming API
    try {
      const response = await this.generateResponse(messages);
      
      // Simulate streaming by yielding words
      const words = response.split(' ');
      for (let i = 0; i < words.length; i++) {
        yield words.slice(0, i + 1).join(' ') + (i < words.length - 1 ? '' : '');
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay between words
      }
    } catch (error) {
      throw error;
    }
  }
}

export const geminiApi = new GeminiApiService();