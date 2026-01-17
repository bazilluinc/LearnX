
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Quiz, Module, GeneratedCourseOutline, Course } from '../types';

/**
 * Helper to get the AI instance with the current API key.
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Please set the API_KEY environment variable.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

const cleanJsonResponse = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

/**
 * AI CAREER ARCHITECT: Uses Gemini 3 Pro to generate a specialized career roadmap.
 */
export const architectCareerRoadmap = async (goal: string): Promise<Course[]> => {
  const ai = getAI();
  const prompt = `You are a world-class Career Strategist. The user's dream is: "${goal}". 
  Design 3 distinct, high-impact mastery tracks (courses) they must finish. 
  Each must have a professional title and a compelling description.
  Use Google Search to ensure these skills are relevant to current industry trends.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              duration: { type: Type.STRING },
              imageUrl: { type: Type.STRING }
            },
            required: ["id", "title", "description", "category", "duration", "imageUrl"]
          }
        }
      }
    });
    return JSON.parse(cleanJsonResponse(response.text || '[]'));
  } catch (error) {
    console.error("Career Architect Error:", error);
    return [];
  }
};

/**
 * LESSON INSIGHTS: Distills content into 3 nuggets and 1 Socratic question.
 */
export const getLessonInsights = async (text: string): Promise<{nuggets: string[], socraticQuestion: string}> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this lesson content and provide exactly 3 "Mastery Nuggets" (short key takeaways) and 1 "Socratic Challenge" (a deep thinking question).
      CONTENT: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nuggets: { type: Type.ARRAY, items: { type: Type.STRING } },
            socraticQuestion: { type: Type.STRING }
          },
          required: ["nuggets", "socraticQuestion"]
        }
      }
    });
    return JSON.parse(cleanJsonResponse(response.text || '{"nuggets": [], "socraticQuestion": ""}'));
  } catch (error) {
    return { nuggets: ["Mastery is a journey."], socraticQuestion: "What is your primary goal?" };
  }
};

/**
 * SMART RECOMMENDATION: Suggests a track based on vague intent.
 */
export const getSmartRecommendation = async (query: string, availableTracks: Course[]): Promise<string> => {
  const ai = getAI();
  const prompt = `A student says: "${query}". 
  Based on these available tracks: ${availableTracks.map(t => t.title).join(', ')}, 
  which one is the best fit? If none fit, suggest a new course title and a 1-sentence reason why. 
  Return only the title or the new suggestion.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text?.trim() || "Web Development";
  } catch (error) {
    return availableTracks[0].title;
  }
};

/**
 * Tutoring Persona: Conversational, Socratic, Simple.
 */
export const getChirpfyChatResponse = async (userMessage: string, history: {role: string, content: string}[], context?: string): Promise<string> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [...history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })), { role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: `You are Chirpfy AI (Lynx 3.2), a world-class personal tutor.
                Use a conversational, one-on-one tone. 
                ${context ? `CONTEXT OF CURRENT LESSON: ${context}` : ''}
                Your goal is to guide them to mastery by making complex topics feel like a simple conversation between friends.`,
            }
        });
        return response.text || "I'm listening. Tell me more.";
    } catch (e) {
        console.error("Gemini Chat Error:", e);
        return "I'm having a bit of trouble connecting to my brain. Can you try saying that again?";
    }
};

/**
 * Generates conversational content for a specific lesson step.
 */
export const generateStepContent = async (courseTitle: string, moduleTitle: string, stepTitle: string): Promise<string> => {
  const ai = getAI();
  const prompt = `Write a conversational one-on-one lesson for "${stepTitle}" in the module "${moduleTitle}" for "${courseTitle}".
  STYLE: Ultra-conversational. Start with a Socratic question. Focus on one specific "Aha!" moment.
  Length: Around 150-200 words.`;

  try {
    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: prompt 
    });
    return response.text || "Let's dive into this topic together.";
  } catch (error) {
    console.error("Gemini Content Error:", error);
    return "Could not load step content.";
  }
};

export const generateLessonAudio = async (text: string): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this lesson cheerfully and clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Generation failed", error);
    return null;
  }
};

export const findStepVideo = async (query: string): Promise<string> => {
  const ai = getAI();
  const prompt = `Find the absolute BEST educational YouTube video for: "${query}". Return only the URL.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.web?.uri || "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  }
};

export const generateCourseSyllabus = async (courseTitle: string): Promise<GeneratedCourseOutline> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a 5-module curriculum for "${courseTitle}". Divide each module into exactly 3 clear progression steps.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  steps: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING }
                        }
                    }
                  }
                },
                required: ["title", "description", "steps"]
              }
            }
          },
          required: ["modules"]
        }
      }
    });
    return JSON.parse(cleanJsonResponse(response.text || '{"modules": []}'));
  } catch (e) {
    console.error("Gemini Syllabus Error:", e);
    return { modules: [] };
  }
};

export const generateCourseSummary = async (title: string, description: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a short, punchy 1-sentence summary of the following course: "${title}". Description context: "${description}"`,
    });
    return response.text?.trim() || description;
  } catch (error) {
    return description;
  }
};

export const generateCheckpointQuiz = async (courseTitle: string, stepTitles: string[]): Promise<Quiz> => {
    const ai = getAI();
    const prompt = `Generate a 3-question mastery quiz for: ${stepTitles.join(', ')}. Return JSON.`;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswerIndex: { type: Type.INTEGER }
                  },
                  required: ["text", "options", "correctAnswerIndex"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });
      return JSON.parse(cleanJsonResponse(response.text || '{"questions": []}'));
    } catch (e) {
      console.error("Quiz generation error:", e);
      return { questions: [] };
    }
};

export const getYouTubeEmbedUrl = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};
