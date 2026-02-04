
import { ClipData } from '../types';

export const clips: ClipData[] = [
  {
    id: 'yt1',
    type: 'youtube',
    src: 'M7lc1UVf-VE', // Example YT ID
    avatar: 'https://i.pravatar.cc/150?img=12',
    user: '@google',
    description: 'Welcome to the future of AI with Gemini. #AI #Google #Shorts',
    likes: 85000,
    shares: 12000
  },
  {
    id: 1,
    type: 'video',
    src: 'https://videos.pexels.com/video-files/4434246/4434246-hd_960_1920_25fps.mp4',
    avatar: 'https://i.pravatar.cc/150?img=1',
    user: '@naturelover',
    description: 'Beautiful waterfall in the middle of the forest. 🌳 #nature #waterfall #travel',
    likes: 12345,
    shares: 678
  },
  {
    id: 'yt2',
    type: 'youtube',
    src: 'dQw4w9WgXcQ', // Classic
    avatar: 'https://i.pravatar.cc/150?img=8',
    user: '@retro_vibes',
    description: 'Never gonna give you up! Classical hits. #music #legends',
    likes: 1000000,
    shares: 500000
  },
  {
    id: 2,
    type: 'video',
    src: 'https://videos.pexels.com/video-files/8310332/8310332-hd_960_1920_25fps.mp4',
    avatar: 'https://i.pravatar.cc/150?img=2',
    user: '@cityscapes',
    description: 'Night time in the city that never sleeps. ✨ #city #nightlife #vibes',
    likes: 23456,
    shares: 1234
  }
];
