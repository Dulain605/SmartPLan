
export interface AgendaItem {
  id: string;
  title: string;
  description: string;
  time: string; // ISO string
  alarmEnabled: boolean;
  completed: boolean;
  category: 'work' | 'personal' | 'health' | 'other';
}

export type ViewType = 'agenda' | 'studio' | 'video' | 'password' | 'clips' | 'connect' | 'settings';
export type StudioMode = 'generate' | 'edit';

export interface ImageStudioState {
  mode: StudioMode;
  originalUrl: string | null;
  resultUrl: string | null;
  loading: boolean;
  error: string | null;
}

export interface VideoStudioState {
  videoUrl: string | null;
  loading: boolean;
  error: string | null;
  progressMessage: string;
}

export interface ClipData {
  id: string | number;
  type: 'video' | 'youtube';
  src: string; // URL for video or Video ID for youtube
  avatar: string;
  user: string;
  description: string;
  likes: number;
  shares: number;
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
}
