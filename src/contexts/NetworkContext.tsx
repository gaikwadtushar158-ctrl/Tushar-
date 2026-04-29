import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, CommunityPost, Challenge, Notification, NetworkLevel } from '../types';
import { useAuth } from './AuthContext';

interface NetworkContextType {
  profile: UserProfile | null;
  communityPosts: CommunityPost[];
  challenges: Challenge[];
  notifications: Notification[];
  leaderboard: UserProfile[];
  addPoints: (amount: number, reason: string) => void;
  createPost: (text: string, type: CommunityPost['type'], tags: string[]) => void;
  likePost: (postId: string) => void;
  completeChallenge: (challengeId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  connections: string[]; // IDs of connected users
  connectWithUser: (userId: string) => void;
  disconnectFromUser: (userId: string) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connections, setConnections] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (user) {
      // Mock initial profile
      const initialProfile: UserProfile = {
        id: 'user-1',
        name: user.email?.split('@')[0] || 'Explorer',
        email: user.email || '',
        skills: ['AI', 'Product Design', 'Fintech'],
        interests: ['Startup Trends', 'SaaS', 'Web3'],
        level: 'Beginner',
        points: 450,
        rank: 124,
        referralCode: 'TREND-' + Math.random().toString(36).substring(7).toUpperCase(),
        referrals: 3,
        badges: ['Trend Hunter', 'First Share'],
      };
      setProfile(initialProfile);

      // Mock posts
      setCommunityPosts([
        {
          id: 'post-1',
          userId: 'user-2',
          userName: 'Alex Chen',
          text: 'Just spotted a massive gap in AI-powered legal compliance tools for small businesses. Anyone interested in exploring this?',
          type: 'idea',
          likes: 24,
          comments: 8,
          timestamp: '2h ago',
          tags: ['AI', 'LegalTech', 'SaaS']
        },
        {
          id: 'post-2',
          userId: 'user-3',
          userName: 'Sarah Miller',
          text: 'The 32-hour work week proposal by OpenAI is a game changer. Do you think this will become the new standard for highly creative AI roles?',
          type: 'question',
          likes: 42,
          comments: 15,
          timestamp: '5h ago',
          tags: ['WorkCulture', 'OpenAI', 'Productivity']
        }
      ]);

      // Mock challenges
      setChallenges([
        { id: 'c1', title: 'Daily Reader', description: 'Read 3 high impact news articles', points: 50, completed: false, type: 'daily' },
        { id: 'c2', title: 'Trend Spotter', description: 'Save a startup opportunity', points: 100, completed: true, type: 'daily' },
        { id: 'c3', title: 'Community Hero', description: 'Share an idea in the feed', points: 200, completed: false, type: 'weekly' }
      ]);

      // Mock notifications
      setNotifications([
        { id: 'n1', type: 'connection', message: 'David Zhang wants to connect', timestamp: '10m ago', read: false },
        { id: 'n2', type: 'rank', message: 'You climbed to Rank 124!', timestamp: '1h ago', read: false },
        { id: 'n3', type: 'trend', message: '🔥 Viral Trend Detected: Generative AI Avatars', timestamp: '5m ago', read: false },
        { id: 'n4', type: 'opportunity', message: '💡 New Business Opportunity in Solar Tech', timestamp: '15m ago', read: false }
      ]);

      // Mock leaderboard
      setLeaderboard([
        { id: 'l1', name: 'James King', email: '', points: 12500, rank: 1, level: 'King', badges: [], referralCode: '', referrals: 0, skills: [], interests: [] },
        { id: 'l2', name: 'Emma Watson', email: '', points: 11200, rank: 2, level: 'Expert', badges: [], referralCode: '', referrals: 0, skills: [], interests: [] },
        { id: 'l3', name: 'Robert Fox', email: '', points: 9800, rank: 3, level: 'Expert', badges: [], referralCode: '', referrals: 0, skills: [], interests: [] },
        { id: 'l4', name: 'Sophia Lee', email: '', points: 8400, rank: 4, level: 'Pro', badges: [], referralCode: '', referrals: 0, skills: [], interests: [] },
        { id: 'l5', name: 'Michael Chen', email: '', points: 7900, rank: 5, level: 'Pro', badges: [], referralCode: '', referrals: 0, skills: [], interests: [] },
      ]);
    }
  }, [user]);

  const addPoints = (amount: number, reason: string) => {
    setProfile(prev => {
      if (!prev) return null;
      const newPoints = prev.points + amount;
      
      // Level transition logic
      let newLevel: NetworkLevel = prev.level;
      if (newPoints > 5000) newLevel = 'King';
      else if (newPoints > 2500) newLevel = 'Expert';
      else if (newPoints > 1000) newLevel = 'Pro';
      else if (newPoints > 500) newLevel = 'Intermediate';

      return { ...prev, points: newPoints, level: newLevel };
    });

    // Add notification
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'challenge',
      message: `Earned ${amount} points: ${reason}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const createPost = (text: string, type: CommunityPost['type'], tags: string[]) => {
    const newPost: CommunityPost = {
      id: Math.random().toString(36).substr(2, 9),
      userId: profile?.id || 'anon',
      userName: profile?.name || 'Anonymous',
      text,
      type,
      likes: 0,
      comments: 0,
      timestamp: 'Just now',
      tags
    };
    setCommunityPosts(prev => [newPost, ...prev]);
    addPoints(150, 'Shared a community post');
  };

  const likePost = (postId: string) => {
    setCommunityPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const completeChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId && !c.completed) {
        addPoints(c.points, `Completed challenge: ${c.title}`);
        return { ...c, completed: true };
      }
      return c;
    }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const connectWithUser = (userId: string) => {
    if (!connections.includes(userId)) {
      setConnections(prev => [...prev, userId]);
      addPoints(50, 'New connection');
    }
  };

  const disconnectFromUser = (userId: string) => {
    setConnections(prev => prev.filter(id => id !== userId));
  };

  return (
    <NetworkContext.Provider value={{
      profile,
      communityPosts,
      challenges,
      notifications,
      leaderboard,
      addPoints,
      createPost,
      likePost,
      completeChallenge,
      markNotificationRead,
      connections,
      connectWithUser,
      disconnectFromUser
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
