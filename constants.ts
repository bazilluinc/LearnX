
import { Course } from './types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Professional Web Development',
    description: 'Go from zero to world-class engineer. Mastery focused.',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400',
    category: 'Tech',
    totalModules: 5,
    duration: '12 weeks',
    modules: [
      {
        id: 'm1',
        title: 'The Anatomy of the Web',
        description: 'Understanding how information moves across the world.',
        isCompleted: false,
        steps: [
          { id: 's1', title: 'The Request/Response Cycle', order: 1, isCompleted: false },
          { id: 's2', title: 'HTML: The Skeleton', order: 2, isCompleted: false },
          { id: 's3', title: 'CSS: The Visual Layer', order: 3, isCompleted: false },
          { id: 's4', title: 'Interactivity with JS', order: 4, isCompleted: false }
        ]
      },
      {
        id: 'm2',
        title: 'Advanced Frontend Architectures',
        description: 'Building scalable user interfaces with modern patterns.',
        isCompleted: false,
        steps: [
          { id: 's5', title: 'Component Composition', order: 1, isCompleted: false },
          { id: 's6', title: 'State Management Mastery', order: 2, isCompleted: false }
        ]
      }
    ],
    reviews: [
      { id: 'r1', userName: 'MasterDev', rating: 5, comment: 'The step-by-step approach is unbeatable.', date: '2024-04-01' }
    ]
  },
  {
    id: 'c2',
    title: 'UI/UX Masterclass',
    description: 'Learn the psychology and principles of elite product design.',
    imageUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=400',
    category: 'Design',
    totalModules: 4,
    duration: '8 weeks',
    modules: [
      {
        id: 'm1_ux',
        title: 'Design Psychology',
        description: 'Why we click what we click.',
        isCompleted: false,
        steps: [
          { id: 's1_ux', title: 'Gestalt Principles', order: 1, isCompleted: false },
          { id: 's2_ux', title: 'Color Theory & Emotion', order: 2, isCompleted: false }
        ]
      }
    ],
    reviews: []
  }
];

export const MOCK_USER = {
  id: 'u1',
  name: 'Elite Student',
  email: 'mastery@learnx.com'
};
