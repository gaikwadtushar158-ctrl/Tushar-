import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Instagram, 
  Youtube, 
  Twitter, 
  Linkedin, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  MessageCircle, 
  Heart, 
  Eye,
  ExternalLink,
  Shield,
  Zap,
  Flame,
  AlertTriangle,
  Search,
  Share2,
  Send
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SocialAccount, SocialPost, NewsArticle } from '../../types';
import { MOCK_NEWS } from '../../constants';

const MOCK_ACCOUNTS: SocialAccount[] = [
  { platform: 'Instagram', connected: false },
  { platform: 'YouTube', connected: false },
  { platform: 'Twitter', connected: false },
  { platform: 'LinkedIn', connected: false },
];

const MOCK_POSTS: SocialPost[] = [
  {
    id: '1',
    platform: 'Instagram',
    author: 'tech_guru',
    content: 'Just tested the new AI-powered camera. The background bokeh is insane! 📸 #AI #Photography',
    mediaUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400',
    likes: 12500,
    comments: 450,
    timestamp: '2h ago',
    isViral: true,
    sentiment: 'Positive'
  },
  {
    id: '2',
    platform: 'YouTube',
    author: 'CodeWithMe',
    content: "Why I'm switching to Bun for all my projects... 🚀",
    mediaUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400',
    likes: 45000,
    views: 1200000,
    comments: 2300,
    timestamp: '5h ago',
    isViral: true,
    sentiment: 'Positive'
  },
  {
    id: '3',
    platform: 'Twitter',
    author: 'elonmusk',
    content: 'SpaceX Starship orbital flight test next week!',
    likes: 850000,
    comments: 12000,
    timestamp: '1h ago',
    isViral: true,
    sentiment: 'Neutral'
  },
  {
    id: '4',
    platform: 'LinkedIn',
    author: 'Satya Nadella',
    content: 'Excited to announce our deeper integration with Gemini for Workspace.',
    likes: 34000,
    comments: 1200,
    timestamp: '10h ago',
    isViral: false,
    sentiment: 'Positive'
  }
];

export default function SocialFeed() {
  const [accounts, setAccounts] = useState<SocialAccount[]>(MOCK_ACCOUNTS);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingStatus, setSharingStatus] = useState<Record<string, string>>({});

  const connectAccount = (platform: string) => {
    setIsConnecting(platform);
    // Simulate OAuth flow
    setTimeout(() => {
      setAccounts(prev => prev.map(acc => 
        acc.platform === platform ? { ...acc, connected: true, username: `@user_${platform.toLowerCase()}` } : acc
      ));
      setIsConnecting(null);
    }, 2000);
  };

  const handleShareNews = (article: NewsArticle, platform: 'Twitter' | 'LinkedIn') => {
    const isConnected = accounts.find(a => a.platform === platform)?.connected;
    
    if (!isConnected) {
      alert(`Please connect your ${platform} account first!`);
      return;
    }

    const shareId = `${article.id}-${platform}`;
    setSharingStatus(prev => ({ ...prev, [shareId]: 'posting' }));

    // Simulate direct post via connected API
    setTimeout(() => {
      setSharingStatus(prev => ({ ...prev, [shareId]: 'success' }));
      setTimeout(() => {
        setSharingStatus(prev => {
          const newState = { ...prev };
          delete newState[shareId];
          return newState;
        });
      }, 3000);
    }, 1500);
  };

  const filteredPosts = MOCK_POSTS.filter(post => {
    const platformMatch = activePlatformFilter === 'All' || post.platform === activePlatformFilter;
    const searchMatch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return platformMatch && searchMatch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Secure Integration</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Social <span className="text-blue-600">Hub</span></h1>
          <p className="text-slate-500 mt-2">Connect your networks to track viral potential and trends.</p>
        </div>
      </div>

      {/* Connection Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((account) => (
          <div 
            key={account.platform}
            className={cn(
              "p-6 rounded-3xl border-2 transition-all relative overflow-hidden group",
              account.connected 
                ? "bg-white border-slate-100 shadow-sm" 
                : "bg-slate-50 border-dashed border-slate-200"
            )}
          >
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "p-3 rounded-2xl",
                  account.platform === 'Instagram' ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white" :
                  account.platform === 'YouTube' ? "bg-red-600 text-white" :
                  account.platform === 'Twitter' ? "bg-black text-white" :
                  "bg-blue-700 text-white"
                )}>
                  {account.platform === 'Instagram' && <Instagram className="w-6 h-6" />}
                  {account.platform === 'YouTube' && <Youtube className="w-6 h-6" />}
                  {account.platform === 'Twitter' && <Twitter className="w-6 h-6" />}
                  {account.platform === 'LinkedIn' && <Linkedin className="w-6 h-6" />}
                </div>
                {account.connected && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              </div>
              
              <div>
                <h3 className="font-black text-slate-900">{account.platform}</h3>
                <p className="text-xs text-slate-500 italic">
                  {account.connected ? account.username : 'Not connected'}
                </p>
              </div>

              {!account.connected ? (
                <button
                  onClick={() => connectAccount(account.platform)}
                  disabled={isConnecting !== null}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-xs hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
                >
                  {isConnecting === account.platform ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {isConnecting === account.platform ? 'Connecting...' : 'Connect'}
                </button>
              ) : (
                <div className="h-[46px] flex items-center gap-2">
                   <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-emerald-500" />
                   </div>
                   <span className="text-[10px] font-bold text-slate-400">SYNCED</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Feed & Controls */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl w-full sm:w-auto">
            {['All', 'Instagram', 'YouTube', 'Twitter', 'LinkedIn'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActivePlatformFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activePlatformFilter === filter 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {filter === 'YouTube' ? 'YT' : filter === 'LinkedIn' ? 'LI' : filter}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search feed..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-slate-50 border-none rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <motion.div
                layout
                key={post.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-blue-900/5 transition-all"
              >
                {post.mediaUrl && (
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={post.mediaUrl} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4">
                      {post.isViral && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                          <Flame className="w-3 h-3" />
                          Viral
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-xl",
                        post.platform === 'Instagram' ? "bg-pink-50 text-pink-600" :
                        post.platform === 'YouTube' ? "bg-red-50 text-red-600" :
                        post.platform === 'Twitter' ? "bg-slate-900 text-white" :
                        "bg-blue-50 text-blue-600"
                      )}>
                        {post.platform === 'Instagram' && <Instagram className="w-4 h-4" />}
                        {post.platform === 'YouTube' && <Youtube className="w-4 h-4" />}
                        {post.platform === 'Twitter' && <Twitter className="w-4 h-4" />}
                        {post.platform === 'LinkedIn' && <Linkedin className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{post.author}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{post.timestamp}</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-full hover:bg-slate-50 transition-colors">
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {post.content}
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Engagement</span>
                         <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span className="text-xs font-black">{(post.likes / 1000).toFixed(1)}k</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <MessageCircle className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-black">{(post.comments / 1000).toFixed(1)}k</span>
                            </div>
                            {post.views && (
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Eye className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-black">{(post.views / 1000000).toFixed(1)}M</span>
                              </div>
                            )}
                         </div>
                      </div>
                    </div>

                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                      post.sentiment === 'Positive' ? "bg-emerald-50 text-emerald-600" :
                      post.sentiment === 'Negative' ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"
                    )}>
                      <TrendingUp className="w-3 h-3" />
                      {post.sentiment}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      {/* News Sharing Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Share <span className="text-blue-600">Intelligence</span></h2>
            <p className="text-slate-500 text-sm mt-1">Directly post trending news to your connected feeds.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_NEWS.slice(0, 3).map((article) => (
            <div key={article.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-400 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
                    article.category === 'Technology' ? "bg-blue-50 text-blue-600" :
                    article.category === 'Business' ? "bg-slate-100 text-slate-700" :
                    "bg-emerald-50 text-emerald-600"
                  )}>
                    {article.category}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{article.timestamp}</span>
                </div>
                <h4 className="text-sm font-black text-slate-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h4>
              </div>

              <div className="flex flex-col gap-2">
                 <div className="h-px bg-slate-50 w-full my-1" />
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleShareNews(article, 'Twitter')}
                      disabled={sharingStatus[`${article.id}-Twitter`] === 'posting'}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        sharingStatus[`${article.id}-Twitter`] === 'success' ? "bg-emerald-500 text-white" :
                        accounts.find(a => a.platform === 'Twitter')?.connected 
                          ? "bg-slate-900 text-white hover:bg-slate-800" 
                          : "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed"
                      )}
                    >
                      {sharingStatus[`${article.id}-Twitter`] === 'posting' ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : sharingStatus[`${article.id}-Twitter`] === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Twitter className="w-3.5 h-3.5" />
                      )}
                      {sharingStatus[`${article.id}-Twitter`] === 'success' ? 'Posted!' : 'Twitter'}
                    </button>
                    
                    <button 
                      onClick={() => handleShareNews(article, 'LinkedIn')}
                      disabled={sharingStatus[`${article.id}-LinkedIn`] === 'posting'}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        sharingStatus[`${article.id}-LinkedIn`] === 'success' ? "bg-emerald-500 text-white" :
                        accounts.find(a => a.platform === 'LinkedIn')?.connected 
                          ? "bg-blue-700 text-white hover:bg-blue-800" 
                          : "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed"
                      )}
                    >
                      {sharingStatus[`${article.id}-LinkedIn`] === 'posting' ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : sharingStatus[`${article.id}-LinkedIn`] === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Linkedin className="w-3.5 h-3.5" />
                      )}
                      {sharingStatus[`${article.id}-LinkedIn`] === 'success' ? 'Posted!' : 'LinkedIn'}
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[32px] flex items-center gap-5">
            <div className="p-4 bg-white rounded-2xl shadow-sm text-emerald-600">
               <Zap className="w-8 h-8" />
            </div>
            <div>
               <h4 className="font-black text-slate-900">Rising Fast</h4>
               <p className="text-xs text-slate-500 font-medium mt-1">AI-generated music videos are seeing 300% growth in reach.</p>
            </div>
         </div>
         <div className="bg-orange-50 border border-orange-100 p-6 rounded-[32px] flex items-center gap-5">
            <div className="p-4 bg-white rounded-2xl shadow-sm text-orange-500">
               <Flame className="w-8 h-8" />
            </div>
            <div>
               <h4 className="font-black text-slate-900">Trending Now</h4>
               <p className="text-xs text-slate-500 font-medium mt-1">Short-form educational bento-grids are top of mind.</p>
            </div>
         </div>
         <div className="bg-red-50 border border-red-100 p-6 rounded-[32px] flex items-center gap-5">
            <div className="p-4 bg-white rounded-2xl shadow-sm text-red-500">
               <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
               <h4 className="font-black text-slate-900">Saturated</h4>
               <p className="text-xs text-slate-500 font-medium mt-1">Generic lifestyle vlogs have low conversion rates currently.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
