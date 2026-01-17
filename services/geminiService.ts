import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Course, GeneratedCourseOutline, Quiz } from '../types';

/**
 * Helper to get the AI instance.
 * It strictly uses process.env.API_KEY which is populated from your .env file.
 */
const getAI = () => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn("Gemini API Key is not set correctly in .env file.");
  }
  return new GoogleGenAI({ apiKey });
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
  Design 3 distinct, high-impact mastery tracks (courses) they must finish to reach this goal. 
  Each must have a professional title and a compelling description.
  Return the tracks in a JSON array format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
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
    return { nuggets: ["Focus on understanding the core principles."], socraticQuestion: "How does this apply to your current goals?" };
  }
};

/**
 * SMART RECOMMENDATION: Suggests a track based on vague intent.
 */
export const getSmartRecommendation = async (query: string, availableTracks: Course[]): Promise<string> => {
  const ai = getAI();
  const prompt = `A student says: "${query}". 
  Based on these available tracks: ${availableTracks.map(t => t.title).join(', ')}, 
  which one is the best fit? Return only the title of the course.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text?.trim() || availableTracks[0].title;
  } catch (error) {
    return availableTracks[0].title;
  }
};

/**
 * Tutoring Persona Chat Response.
 */
export const getChirpfyChatResponse = async (userMessage: string, history: {role: string, content: string}[], context?: string): Promise<string> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [...history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })), { role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: `You are Chirpfy AI, a world-class personal tutor for LearnX.
                Use a conversational, one-on-one tone. 
                ${context ? `CONTEXT OF CURRENT LESSON: ${context}` : ''}
                Help the user master the topic with clear explanations and encouragement.`,
            }
        });
        return response.text || "I'm listening. Could you tell me more about that?";
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
  Style: Engaging and easy to understand. Length: ~200 words.`;

  try {
    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: prompt 
    });
    return response.text || "Let's dive into this topic together.";
  } catch (error) {
    return "I couldn't generate the lesson content right now. Please try again.";
  }
};

/**
 * Generates audio for the lesson content using Gemini TTS.
 */
export const generateLessonAudio = async (text: string): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    return null;
  }
};

export const findStepVideo = async (query: string): Promise<string> => {
  return "https://www.youtube.com/watch?v=R9OC6UMTf_E";
};

export const getYouTubeEmbedUrl = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
};

export const generateCourseSyllabus = async (courseTitle: string): Promise<GeneratedCourseOutline> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a 5-module curriculum for "${courseTitle}". Each module must have 3 steps.`,
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
    return { modules: [] };
  }
};

export const generateCourseSummary = async (title: string, description: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize this course in one punchy sentence: "${title}". Original description: "${description}"`,
    });
    return response.text?.trim() || description;
  } catch (error) {
    return description;
  }
};

export const generateCheckpointQuiz = async (courseTitle: string, stepTitles: string[]): Promise<Quiz> => {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a 3-question quiz for: ${stepTitles.join(', ')}.`,
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
                    text: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.INTEGER }
                  },
                  required: ["text", "options", "correctAnswer"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });
      return JSON.parse(cleanJsonResponse(response.text || '{"questions": []}'));
    } catch (e) {
      return { questions: [] };
    }
};
