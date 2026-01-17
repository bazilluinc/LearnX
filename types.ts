
export interface PlanetData {
  name: string;
  color: string;
  distance: number;
  size: number;
  speed: number;
  description: string;
}

export interface AIInsight {
  cosmicFacts: string[];
  history: string;
  futureMissions: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

// LearnX Types
export enum NavTab {
  EXPLORE = 'explore',
  CAREER = 'career',
  FORUM = 'forum',
  LEARN = 'learn',
  PROFILE = 'settings',
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Step {
  id: string;
  title: string;
  order: number;
  isCompleted: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  steps: Step[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  duration: string;
  modules: Module[];
  totalModules?: number;
  reviews?: any[];
}

export interface GeneratedCourseOutline {
  modules: { title: string; description: string; steps: { title: string }[] }[];
}

export interface Quiz {
  questions: { text: string; options: string[]; correctAnswer: number }[];
}
