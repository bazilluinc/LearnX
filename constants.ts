
import { PlanetData, Course } from './types';

export const PLANETS: PlanetData[] = [
  { name: 'Mercury', color: '#A5A5A5', distance: 15, size: 0.8, speed: 0.04, description: 'The smallest and innermost planet in the Solar System.' },
  { name: 'Venus', color: '#E3BB76', distance: 22, size: 1.2, speed: 0.015, description: 'Second planet from the Sun and the hottest in our solar system.' },
  { name: 'Earth', color: '#2271B3', distance: 30, size: 1.3, speed: 0.01, description: 'Our home planet, the only place known to harbor life.' },
  { name: 'Mars', color: '#E27B58', distance: 38, size: 0.9, speed: 0.008, description: 'The Red Planet, home to Olympus Mons, the largest volcano in the solar system.' },
  { name: 'Jupiter', color: '#D39C7E', distance: 55, size: 2.5, speed: 0.004, description: 'A giant gas world, the largest planet in our solar system.' },
  { name: 'Saturn', color: '#C5AB6E', distance: 75, size: 2.1, speed: 0.002, description: 'Adorned with a dazzling, complex system of icy rings.' },
  { name: 'Uranus', color: '#B5E3E3', distance: 90, size: 1.8, speed: 0.001, description: 'An ice giant with a unique tilt, orbiting on its side.' },
  { name: 'Neptune', color: '#4B70DD', distance: 105, size: 1.7, speed: 0.0008, description: 'The most distant major planet, dark, cold and whipped by supersonic winds.' }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: '1',
    title: 'Modern Web Development',
    description: 'Learn React, Tailwind, and modern tooling to build responsive web apps.',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    category: 'Development',
    duration: '24h 15m',
    modules: []
  },
  {
    id: '2',
    title: 'UI/UX Masterclass',
    description: 'Design beautiful, user-centered interfaces from scratch using Figma.',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    category: 'Design',
    duration: '18h 30m',
    modules: []
  },
  {
    id: '3',
    title: 'Python for Data Science',
    description: 'Analyze data and build machine learning models with Python and Pandas.',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    category: 'Data Science',
    duration: '32h 00m',
    modules: []
  }
];
