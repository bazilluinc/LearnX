
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
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
  isRemedial?: boolean;
  steps: Step[];
}

export interface GeneratedCourseOutline {
  modules: {
    title: string;
    description: string;
  }[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  modules: Module[];
  totalModules: number;
  duration: string;
  reviews: Review[];
}

export enum NavTab {
  EXPLORE = 'explore',
  CAREER = 'career',
  BOOKS = 'books',
  FORUM = 'forum',
  LEARN = 'learn',
  PROFILE = 'profile',
}

export interface Quiz {
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}
