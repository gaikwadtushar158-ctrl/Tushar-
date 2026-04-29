export type NewsCategory = 'Technology' | 'Business' | 'Politics' | 'Environment';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  isHighImpact: boolean;
  timestamp: string;
  source: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  sceneDetails?: string;
  newsPoint?: string;
  isLive?: boolean;
  relatedTrend?: {
    symbol: string;
    price: number;
    change: number;
    volume?: number;
    marketData?: string;
  };
}

export interface MarketTrend {
  symbol: string;
  name: string;
  price: number;
  change: number;
  history: { time: string; value: number; volume: number }[];
  volume?: number;
  marketCap?: string;
  peRatio?: number;
  range52w?: { low: number; high: number };
  open?: number;
  high?: number;
  low?: number;
}

export interface IndustryTrend {
  name: string;
  status: 'Rising' | 'Falling' | 'Stable';
  growth: number;
}

export type AITag = 'Breakthrough' | 'Business Use' | 'Experimental';

export interface AIUpdate {
  id: string;
  name: string;
  description: string;
  tag: AITag;
  updatedAt: string;
}

export interface StartupOpportunity {
  id: string;
  problem: string;
  idea: string;
  competition: 'Low' | 'Medium' | 'High';
  relevance: string;
}

export interface UserAlerts {
  marketCrashes: boolean;
  aiUpdates: boolean;
  startupTrends: boolean;
  notificationsEnabled: boolean;
}

export type NetworkLevel = 'Beginner' | 'Intermediate' | 'Pro' | 'Expert' | 'King';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  skills: string[];
  interests: string[];
  level: NetworkLevel;
  points: number;
  rank: number;
  referralCode: string;
  referrals: number;
  badges: string[];
  avatar?: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  text: string;
  type: 'idea' | 'opportunity' | 'question';
  likes: number;
  comments: number;
  timestamp: string;
  tags: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  type: 'daily' | 'weekly';
}

export interface Notification {
  id: string;
  type: 'connection' | 'like' | 'comment' | 'rank' | 'challenge' | 'trend' | 'opportunity';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface SocialAccount {
  platform: 'Instagram' | 'YouTube' | 'Twitter' | 'LinkedIn';
  connected: boolean;
  username?: string;
  avatar?: string;
  followers?: number;
}

export interface SocialPost {
  id: string;
  platform: 'Instagram' | 'YouTube' | 'Twitter' | 'LinkedIn';
  author: string;
  content: string;
  mediaUrl?: string;
  likes: number;
  views?: number;
  comments: number;
  timestamp: string;
  isViral: boolean;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'text' | 'image' | 'analysis';
  imageUrl?: string;
  analysis?: {
    summary: string;
    details: string;
    opportunity: string;
    nextSteps: string[];
    ocrText?: string;
  };
}
