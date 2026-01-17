
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Quiz, Module, GeneratedCourseOutline } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Tutoring Persona: Conversational, Socratic, Simple.
 */
export const getChirpfyChatResponse = async (userMessage: string, history: {role: string, content: string}[]): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [...history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })), { role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: `You are Chirpfy AI (Lynx 3.2), a world-class personal tutor.
                Use a conversational, one-on-one tone. Start with relatable, real-world questions like "Have you ever wondered...?" 
                Do NOT use clichéd analogies. Be original. 
                Your goal is to guide them to mastery by making complex topics feel like a simple conversation between friends.`,
            }
        });
        return response.text || "I'm listening. Tell me more.";
    } catch (e) {
        return "I'm processing that. One moment.";
    }
};

/**
 * Generates conversational content for a specific lesson step.
 */
export const generateStepContent = async (courseTitle: string, moduleTitle: string, stepTitle: string): Promise<string> => {
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
    return "Could not load step content.";
  }
};

/**
 * Generates audio for the lesson content using Gemini TTS.
 */
export const generateLessonAudio = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this lesson cheerfully and clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Professional but friendly voice
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

/**
 * Searches for educational video content related to the query.
 */
export const findStepVideo = async (query: string): Promise<string> => {
  const prompt = `Find the absolute BEST educational YouTube video for: "${query}". Return only the URL.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.web?.uri || "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  } catch (error) {
    return "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  }
};

/**
 * Generates a full course syllabus including modules and steps.
 */
export const generateCourseSyllabus = async (courseTitle: string): Promise<GeneratedCourseOutline> => {
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
    return JSON.parse(response.text || '{"modules": []}');
  } catch (e) {
    return { modules: [] };
  }
};

/**
 * Distills a course into a short, punchy, inspiring summary.
 */
export const generateCourseSummary = async (title: string, description: string): Promise<string> => {
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

/**
 * Generates a remedial module for subjects the student is struggling with.
 */
export const generateRemedialModule = async (topic: string): Promise<Module> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a remedial module for someone struggling with "${topic}". Provide a title, description, and exactly 3 learning steps.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
    });
    const data = JSON.parse(response.text || '{}');
    return {
      id: `remedial-${Date.now()}`,
      title: data.title || `Review: ${topic}`,
      description: data.description || `A quick review to master ${topic}.`,
      isCompleted: false,
      isRemedial: true,
      steps: (data.steps || []).map((s: any, i: number) => ({
        id: `rs-${i}`,
        title: s.title,
        order: i + 1,
        isCompleted: false
      }))
    };
  } catch (error) {
    return { id: 'err', title: 'Remedial Help', description: topic, isCompleted: false, steps: [] };
  }
};

/**
 * Generates advanced extension modules for high-performing students.
 */
export const generateAdvancedModules = async (courseTitle: string): Promise<Module[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate 2 advanced extension modules for the course "${courseTitle}".`,
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
        const data = JSON.parse(response.text || '{"modules": []}');
        return (data.modules || []).map((m: any, i: number) => ({
            id: `adv-${i}-${Date.now()}`,
            title: m.title,
            description: m.description,
            isCompleted: false,
            steps: (m.steps || []).map((s: any, si: number) => ({
                id: `adv-s-${i}-${si}`,
                title: s.title,
                order: si + 1,
                isCompleted: false
            }))
        }));
    } catch (error) {
        return [];
    }
};

/**
 * Formats a YouTube URL for embedding.
 */
export const getYouTubeEmbedUrl = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

/**
 * Generates a mastery quiz for specific steps.
 */
export const generateCheckpointQuiz = async (courseTitle: string, stepTitles: string[]): Promise<Quiz> => {
    const prompt = `Generate a 3-question mastery quiz for: ${stepTitles.join(', ')}. Return JSON.`;
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
    return JSON.parse(response.text || '{"questions": []}');
};

/**
 * Generates a quiz specifically for a module's content.
 */
export const generateModuleQuiz = async (courseTitle: string, moduleTitle: string): Promise<Quiz> => {
  return generateCheckpointQuiz(courseTitle, [moduleTitle]);
};
