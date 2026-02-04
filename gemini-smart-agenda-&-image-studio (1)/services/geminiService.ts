
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  // Always use process.env.API_KEY directly in the named parameter object.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Edits an existing image based on a prompt.
 */
export const editImageWithGemini = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  const ai = getAIClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error('No response from AI');
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error('No image returned in response parts');
  } catch (error) {
    console.error('Gemini image edit error:', error);
    throw error;
  }
};

/**
 * Generates a completely new image from a text prompt.
 */
export const generateImageWithGemini = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error('No response from AI');
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error('AI did not generate an image for this prompt');
  } catch (error) {
    console.error('Gemini image generation error:', error);
    throw error;
  }
};
