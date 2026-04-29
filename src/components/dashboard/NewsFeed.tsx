import React, { useState, useEffect, useRef } from 'react';
import { MOCK_NEWS } from '../../constants';
import { BadgeAlert, Clock, ChevronRight, Bookmark, BookmarkCheck, Accessibility, Filter, Sparkles, MapPin, Radio, Bot, Loader2, Sparkle, TrendingUp, TrendingDown, Activity, Globe, Zap, Brain, Flag, AlertTriangle, CheckCircle, Share2, Twitter, Linkedin, Facebook, Link as LinkIcon, MessageSquare, Send, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { useNetwork } from '../../contexts/NetworkContext';
import { summarizeArticle, analyzeArticleDeeply, moderateArticle } from '../../services/aiService';
import { NewsArticle, NewsCategory } from '../../types';

const categoryColors: Record<NewsCategory, string> = {
  Technology: 'bg-blue-50 text-blue-600 border-blue-100',
  Business: 'bg-slate-100 text-slate-700 border-slate-200',
  Politics: 'bg-purple-50 text-purple-600 border-purple-100',
  Environment: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const categoryHighContrast: Record<NewsCategory, string> = {
  Technology: 'bg-black text-white border-white',
  Business: 'bg-black text-white border-white',
  Politics: 'bg-black text-white border-white',
  Environment: 'bg-black text-white border-white',
};

export default function NewsFeed() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [viewMode, setViewMode] = useState<'Detailed' | 'Standard'>('Detailed');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'All'>('All');
  const [showHighImpactOnly, setShowHighImpactOnly] = useState(false);
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});
  const [aiDeepAnalyses, setAiDeepAnalyses] = useState<Record<string, string>>({});
  const [loadingDeepSummaries, setLoadingDeepSummaries] = useState<Record<string, boolean>>({});
  const [moderationReports, setModerationReports] = useState<Record<string, any>>({});
  const [loadingReports, setLoadingReports] = useState<Record<string, boolean>>({});
  const [recommendations, setRecommendations] = useState<NewsArticle[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [confirmingUnbookmark, setConfirmingUnbookmark] = useState<string | null>(null);
  const [activeShareMenu, setActiveShareMenu] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Array<{ id: string; user: string; text: string; timestamp: string }>>>({});
  const [activeComments, setActiveComments] = useState<string[]>([]);
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [displayNews, setDisplayNews] = useState<NewsArticle[]>([]);
  const { user } = useAuth();
  const { addPoints } = useNetwork();

  const categories: (NewsCategory | 'All')[] = ['All', 'Technology', 'Business', 'Politics', 'Environment'];
  const itemsPerPage = 6;

  // Load bookmarks and comments on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('trendscope_bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error('Failed to parse bookmarks', e);
      }
    }

    const savedComments = localStorage.getItem('trendscope_comments');
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (e) {
        console.error('Failed to parse comments', e);
      }
    }
  }, []);

  // Save bookmarks when they change
  useEffect(() => {
    localStorage.setItem('trendscope_bookmarks', JSON.stringify(bookmarks));
    if (user) {
      fetchRecommendations();
    }
  }, [bookmarks, user]);

  // Save comments when they change
  useEffect(() => {
    localStorage.setItem('trendscope_comments', JSON.stringify(comments));
  }, [comments]);

  const filteredNews = MOCK_NEWS.filter(article => {
    const categoryMatch = selectedCategory === 'All' || article.category === selectedCategory;
    const impactMatch = !showHighImpactOnly || article.isHighImpact;
    return categoryMatch && impactMatch;
  });

  // Handle Initial Load and Filtering
  useEffect(() => {
    setDisplayNews(filteredNews.slice(0, itemsPerPage));
    setPage(1);
  }, [selectedCategory, showHighImpactOnly]);

  const isFetchingMoreRef = useRef(false);

  // Handle Scroll to Bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 800 && 
        !isFetchingMoreRef.current && 
        displayNews.length > 0
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayNews, page, filteredNews]);

  const loadMore = () => {
    if (isFetchingMoreRef.current) return;
    
    isFetchingMoreRef.current = true;
    setIsFetchingMore(true);

    // Simulate network delay
    setTimeout(() => {
      setDisplayNews(prev => {
        const currentIds = new Set(prev.map(a => a.id));
        const currentLength = prev.length;
        const nextBatch = filteredNews.slice(currentLength, currentLength + itemsPerPage);
        
        if (nextBatch.length === 0 && filteredNews.length > 0) {
          // If we ran out of filtered items, wrap around to simulate infinity
          const wrapBatch = filteredNews.slice(0, itemsPerPage)
            .map((a, i) => ({
              ...a,
              id: `${a.id}-infinite-${page}-${i}-${Date.now()}`,
              timestamp: `Simulated Update ${page}`
            }))
            .filter(a => !currentIds.has(a.id));
            
          return [...prev, ...wrapBatch];
        } else {
          // Only add items that aren't already there
          const uniqueNextBatch = nextBatch.filter(a => !currentIds.has(a.id));
          return [...prev, ...uniqueNextBatch];
        }
      });
      
      setPage(prev => prev + 1);
      setIsFetchingMore(false);
      isFetchingMoreRef.current = false;
      addPoints(15, 'Infinite intelligence exploration');
    }, 800);
  };

  const fetchRecommendations = async () => {
    if (!user) return;
    setLoadingRecommendations(true);
    try {
      const response = await fetch(`/api/recommendations?userId=${user.uid}&bookmarks=${bookmarks.join(',')}`);
      
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Rate exceeded')) {
          console.warn('Recommendation rate limit exceeded. Using defaults.');
          setRecommendations([]); // or some fallback
          return;
        }
        throw new Error(`Server error: ${response.status} ${text}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Expected JSON but got ${contentType}: ${text.substring(0, 100)}`);
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmarks.includes(id)) {
      setConfirmingUnbookmark(id);
    } else {
      setBookmarks(prev => [...prev, id]);
      addPoints(100, 'Saved an opportunity');
    }
  };

  const confirmUnbookmark = () => {
    if (confirmingUnbookmark) {
      setBookmarks(prev => prev.filter(b => b !== confirmingUnbookmark));
      setConfirmingUnbookmark(null);
    }
  };

  const highImpactCount = MOCK_NEWS.filter(a => a.isHighImpact).length;

  const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook' | 'copy', article: NewsArticle) => {
    const url = window.location.href; // In real app, this would be article URL
    const text = `Check out this insight on TrendScope: ${article.title}`;
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(`${text} - ${url}`);
      setCopySuccess(article.id);
      setTimeout(() => setCopySuccess(null), 2000);
      return;
    }

    const shares = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };

    window.open(shares[platform], '_blank', 'noopener,noreferrer');
    setActiveShareMenu(null);
    addPoints(75, `Shared news via ${platform}`);
  };

  const toggleComments = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveComments(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleAddComment = (articleId: string) => {
    const text = newCommentText[articleId];
    if (!text?.trim()) return;

    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      user: user?.email?.split('@')[0] || 'Anonymous',
      text: text.trim(),
      timestamp: 'Just now'
    };

    setComments(prev => ({
      ...prev,
      [articleId]: [newComment, ...(prev[articleId] || [])]
    }));

    setNewCommentText(prev => ({ ...prev, [articleId]: '' }));
    addPoints(150, 'Contributed to a discussion');
  };

  const handleDeleteComment = (articleId: string, commentId: string) => {
    setComments(prev => ({
      ...prev,
      [articleId]: prev[articleId].filter(c => c.id !== commentId)
    }));
  };

  const handleGenerateSummary = async (id: string, title: string, summary: string, category: string) => {
    if (aiSummaries[id]) return;
    
    setLoadingSummaries(prev => ({ ...prev, [id]: true }));
    try {
      const result = await summarizeArticle(title, summary, category);
      if (result) {
        setAiSummaries(prev => ({ ...prev, [id]: result }));
        addPoints(50, 'Used AI summary for deep learning');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleGenerateDeepAnalysis = async (id: string, title: string, summary: string, category: string, trendSymbol?: string) => {
    if (aiDeepAnalyses[id]) return;
    
    setLoadingDeepSummaries(prev => ({ ...prev, [id]: true }));
    try {
      const result = await analyzeArticleDeeply(title, summary, category, trendSymbol);
      if (result) {
        setAiDeepAnalyses(prev => ({ ...prev, [id]: result }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDeepSummaries(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleReportArticle = async (id: string, title: string, summary: string) => {
    if (moderationReports[id]) return;
    
    setLoadingReports(prev => ({ ...prev, [id]: true }));
    try {
      const result = await moderateArticle(title, summary);
      if (result) {
        setModerationReports(prev => ({ ...prev, [id]: result }));
      }
    } catch (error) {
      console.error("Moderation error:", error);
    } finally {
      setLoadingReports(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Confirmation Modal for Unbookmarking */}
      <AnimatePresence>
        {confirmingUnbookmark && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmingUnbookmark(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-sm p-6 rounded-3xl shadow-2xl overflow-hidden",
                isHighContrast ? "bg-black border-4 border-white" : "bg-white border border-slate-100"
              )}
            >
              <div className="flex flex-col items-center text-center">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                  isHighContrast ? "bg-white text-black" : "bg-amber-50 text-amber-500"
                )}>
                  <BookmarkCheck className="w-8 h-8" />
                </div>
                <h3 className={cn(
                  "text-xl font-black uppercase tracking-tight mb-2",
                  isHighContrast ? "text-white" : "text-slate-900"
                )}>Remove Bookmark?</h3>
                <p className={cn(
                  "text-sm mb-6 leading-relaxed",
                  isHighContrast ? "text-white" : "text-slate-500"
                )}>
                  Are you sure you want to remove this article from your list of saved intelligence?
                </p>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={() => setConfirmingUnbookmark(null)}
                    className={cn(
                      "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      isHighContrast ? "bg-black text-white border-2 border-white hover:bg-white hover:text-black" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmUnbookmark}
                    className={cn(
                      "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      isHighContrast ? "bg-yellow-400 text-black shadow-lg" : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100"
                    )}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 italic uppercase">World Headlines</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time global impact analysis.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('Detailed')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'Detailed' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              )}
            >
              Detailed
            </button>
            <button
              onClick={() => setViewMode('Standard')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'Standard' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              )}
            >
              Standard
            </button>
          </div>
          <button 
            onClick={() => setIsHighContrast(!isHighContrast)}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full border transition-all",
              isHighContrast 
                ? "bg-slate-900 text-white border-slate-900" 
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            )}
            title="Accessibility Mode"
          >
            <Accessibility className={cn("w-3 h-3", isHighContrast && "animate-pulse")} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isHighContrast ? 'Standard View' : 'High Contrast'}
            </span>
          </button>
          {bookmarks.length > 0 && (
            <div className={cn(
              "hidden sm:flex items-center gap-2 px-3 py-1 border rounded-full",
              isHighContrast ? "bg-black border-white text-white" : "bg-amber-50 border-amber-100 text-amber-600"
            )}>
              <BookmarkCheck className={cn("w-3 h-3", isHighContrast ? "text-white" : "text-amber-600")} />
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                isHighContrast ? "text-white" : "text-amber-600"
              )}>{bookmarks.length} Saved</span>
            </div>
          )}
          <span className={cn(
            "text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider",
            isHighContrast ? "bg-black text-white border border-white" : "bg-blue-50 text-blue-600"
          )}>Global Live</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                selectedCategory === cat
                  ? (isHighContrast ? "bg-white text-black border-white" : "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200")
                  : (isHighContrast ? "bg-black text-white border-white hover:bg-yellow-400 hover:text-black" : "bg-white text-slate-500 border-slate-100 hover:border-slate-300")
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowHighImpactOnly(!showHighImpactOnly)}
          className={cn(
            "flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all self-start sm:self-center group",
            showHighImpactOnly
              ? (isHighContrast ? "bg-yellow-400 text-black border-yellow-400" : "bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-100 ring-2 ring-red-100 ring-offset-2")
              : (isHighContrast ? "bg-black text-white border-white" : "bg-white text-slate-500 border-slate-100 hover:border-red-200 hover:text-red-500 hover:bg-red-50/30")
          )}
        >
          <div className="relative">
            <BadgeAlert className={cn("w-3.5 h-3.5 transition-transform", showHighImpactOnly && "scale-110")} />
            {showHighImpactOnly && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            {showHighImpactOnly ? 'Impact Only' : 'All Impact'}
            <span className={cn(
              "px-1.5 py-0.5 rounded-md text-[8px] font-bold transition-colors",
              showHighImpactOnly
                ? (isHighContrast ? "bg-black text-yellow-400" : "bg-red-600 text-white")
                : (isHighContrast ? "bg-white text-black" : "bg-slate-100 text-slate-400 group-hover:bg-red-100 group-hover:text-red-500")
            )}>
              {highImpactCount}
            </span>
          </span>
        </button>
      </div>

      <div className={cn(
        "grid gap-6",
        viewMode === 'Detailed' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
      )}>
        <AnimatePresence mode="popLayout">
          {displayNews.map((article, index) => {
            const isBookmarked = bookmarks.includes(article.id);
            if (viewMode === 'Standard') {
              return (
                <motion.div
                  key={article.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={cn(
                    "p-3 sm:p-4 rounded-2xl flex items-start gap-3 sm:gap-4 group transition-all",
                    isHighContrast ? "bg-black border-2 border-white" : "bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg"
                  )}
                >
                  <div className={cn(
                    "flex w-10 h-10 sm:w-12 sm:h-12 rounded-xl items-center justify-center shrink-0 transition-colors mt-0.5",
                    isHighContrast ? "bg-white text-black" : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                  )}>
                    {article.category === 'Technology' && <Zap className="w-5 h-5 sm:w-6 sm:h-6" />}
                    {article.category === 'Business' && <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
                    {article.category === 'Politics' && <Globe className="w-5 h-5 sm:w-6 sm:h-6" />}
                    {article.category === 'Environment' && <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />}
                  </div>
                  
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0",
                        isHighContrast ? categoryHighContrast[article.category] : categoryColors[article.category]
                      )}>{article.category}</span>
                      {article.newsPoint && (
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                          <Flag className="w-2 h-2" />
                          {article.newsPoint}
                        </span>
                      )}
                      <span className={cn(
                        "text-[10px] font-bold whitespace-nowrap",
                        isHighContrast ? "text-yellow-400" : "text-slate-400"
                      )}>{article.timestamp}</span>
                    </div>
                    <h3 className={cn(
                      "font-black transition-all leading-snug break-words",
                      isHighContrast ? "text-base text-white" : "text-slate-900 group-hover:text-blue-600",
                      "line-clamp-3 sm:line-clamp-2"
                    )}>
                      {article.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-3 shrink-0 self-center sm:self-center">
                    {article.relatedTrend && (
                      <div className={cn(
                        "hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[11px] font-black",
                        article.relatedTrend.change >= 0 
                          ? (isHighContrast ? "text-yellow-400 bg-none border border-yellow-400" : "text-emerald-600 bg-emerald-50") 
                          : (isHighContrast ? "text-red-400 bg-none border border-red-400" : "text-red-600 bg-red-50")
                      )}>
                        {article.relatedTrend.symbol}
                        <span className="opacity-50">|</span>
                        {article.relatedTrend.change >= 0 ? '+' : ''}{article.relatedTrend.change}%
                        {article.relatedTrend.marketData && (
                          <div className={cn(
                            "flex items-center gap-1 ml-2 pl-2 border-l transition-opacity",
                            isHighContrast ? "border-white/20" : "border-slate-300/20"
                          )}>
                            <Globe className="w-2.5 h-2.5" />
                            <span className="text-[8px] uppercase tracking-tighter opacity-70">
                              Data+
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveShareMenu(activeShareMenu === article.id ? null : article.id);
                          }}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-full transition-all min-h-[44px]",
                            activeShareMenu === article.id
                              ? (isHighContrast ? "bg-white text-black" : "bg-blue-50 text-blue-600")
                              : (isHighContrast ? "text-white hover:bg-white hover:text-black border border-white" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100")
                          )}
                        >
                          <Share2 className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Share</span>
                        </button>

                      <AnimatePresence>
                        {activeShareMenu === article.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className={cn(
                              "absolute right-0 bottom-full mb-2 w-48 p-2 rounded-2xl shadow-2xl z-50",
                              isHighContrast ? "bg-black border-2 border-white" : "bg-white border border-slate-100"
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex flex-col gap-1">
                              <button 
                                onClick={() => handleShare('twitter', article)}
                                className={cn(
                                  "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left transition-colors",
                                  isHighContrast ? "text-white hover:bg-white hover:text-black" : "text-slate-600 hover:bg-slate-50"
                                )}
                              >
                                <Twitter className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Twitter</span>
                              </button>
                              <button 
                                onClick={() => handleShare('linkedin', article)}
                                className={cn(
                                  "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left transition-colors",
                                  isHighContrast ? "text-white hover:bg-white hover:text-black" : "text-slate-600 hover:bg-slate-50"
                                )}
                              >
                                <Linkedin className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">LinkedIn</span>
                              </button>
                              <button 
                                onClick={() => handleShare('facebook', article)}
                                className={cn(
                                  "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left transition-colors",
                                  isHighContrast ? "text-white hover:bg-white hover:text-black" : "text-slate-600 hover:bg-slate-50"
                                )}
                              >
                                <Facebook className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
                              </button>
                              <div className={cn("h-px my-1", isHighContrast ? "bg-white/20" : "bg-slate-100")} />
                              <button 
                                onClick={() => handleShare('copy', article)}
                                className={cn(
                                  "flex items-center justify-between w-full px-3 py-2 rounded-xl text-left transition-colors",
                                  isHighContrast ? "text-yellow-400 hover:bg-white hover:text-black" : "text-blue-600 hover:bg-blue-50"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <LinkIcon className="w-4 h-4" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Copy Link</span>
                                </div>
                                {copySuccess === article.id && (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button 
                      aria-label="View article"
                      className={cn(
                        "p-3 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center",
                        isHighContrast ? "text-white hover:bg-white hover:text-black" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      )}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Standard View Comments */}
                  <div className="w-full mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComments(article.id);
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        activeComments.includes(article.id)
                          ? (isHighContrast ? "bg-white text-black" : "bg-slate-100 text-slate-800")
                          : (isHighContrast ? "bg-black border border-white text-white" : "bg-white text-slate-400 border border-slate-100 hover:text-slate-600")
                      )}
                    >
                      <MessageSquare className="w-3 h-3" />
                      {comments[article.id]?.length > 0 ? `${comments[article.id].length} Comments` : 'Add Comment'}
                    </button>

                    <AnimatePresence>
                      {activeComments.includes(article.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-4 pt-4 border-t border-slate-50"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                value={newCommentText[article.id] || ''}
                                onChange={(e) => setNewCommentText(prev => ({ ...prev, [article.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddComment(article.id);
                                }}
                                className={cn(
                                  "flex-1 px-3 py-1.5 rounded-lg text-[11px] font-bold outline-none",
                                  isHighContrast ? "bg-black border border-white text-white" : "bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-200"
                                )}
                              />
                              <button
                                onClick={() => handleAddComment(article.id)}
                                className={cn(
                                  "p-2 rounded-lg",
                                  isHighContrast ? "bg-white text-black" : "bg-blue-600 text-white"
                                )}
                              >
                                <Send className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                              {comments[article.id]?.map((comment) => (
                                <div key={comment.id} className={cn(
                                  "p-2 rounded-xl relative group",
                                  isHighContrast ? "border border-white/10" : "bg-slate-50/50"
                                )}>
                                  <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <span className="text-[8px] font-black text-blue-600 uppercase">@{comment.user}</span>
                                    <span className="text-[7px] font-bold text-slate-400 capitalize">{comment.timestamp}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-600 leading-tight pr-6">{comment.text}</p>
                                  <button
                                    onClick={() => handleDeleteComment(article.id, comment.id)}
                                    className="absolute top-1.5 right-1.5 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            }
            return (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={!isHighContrast ? { 
                  scale: 1.01, 
                  y: -4,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" 
                } : { scale: 1.01 }}
                transition={{ duration: 0.2, delay: (index % itemsPerPage) * 0.05 }}
                className={cn(
                  "bento-card group cursor-pointer transition-all",
                  isHighContrast 
                    ? "bg-black border-4 border-white hover:border-yellow-400 !shadow-none ring-4 ring-black" 
                    : "hover:border-blue-400"
                )}
              >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors",
                      isHighContrast ? categoryHighContrast[article.category] : categoryColors[article.category]
                    )}>
                      {article.category}
                    </span>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => toggleBookmark(article.id, e)}
                      className={cn(
                        "p-1.5 rounded-lg transition-all border relative",
                        isBookmarked 
                          ? (isHighContrast ? "bg-yellow-400 text-black border-yellow-400" : "bg-amber-50 text-amber-500 border-amber-100") 
                          : (isHighContrast ? "text-white border-white hover:bg-white hover:text-black" : "text-slate-300 hover:text-slate-600 hover:bg-slate-50 border-transparent")
                      )}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isBookmarked ? 'saved' : 'unsaved'}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                        </motion.div>
                      </AnimatePresence>
                    </motion.button>

                    <div className="relative">
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveShareMenu(activeShareMenu === article.id ? null : article.id);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl transition-all border",
                          activeShareMenu === article.id
                            ? (isHighContrast ? "bg-white text-black border-white" : "bg-blue-50 text-blue-600 border-blue-100")
                            : (isHighContrast ? "text-white border-white hover:bg-white hover:text-black" : "text-slate-300 hover:text-slate-600 hover:bg-slate-50 border-transparent")
                        )}
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
                      </motion.button>

                      <AnimatePresence>
                        {activeShareMenu === article.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className={cn(
                              "absolute right-0 top-full mt-2 w-48 p-2 rounded-2xl shadow-2xl z-50",
                              isHighContrast ? "bg-black border-2 border-white" : "bg-white border border-slate-100"
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex flex-col gap-1">
                              <button 
                                onClick={() => handleShare('twitter', article)}
                                className={cn(
                                  "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left transition-colors",
                                  isHighContrast ? "text-white hover:bg-white hover:text-black" : "text-slate-600 hover:bg-slate-50"
                                )}
                              >
                                <Twitter className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Twitter</span>
                              </button>
                              <button 
                                onClick={() => handleShare('linkedin', article)}
                                className={cn(
                                  "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left transition-colors",
                                  isHighContrast ? "text-white hover:bg-white hover:text-black" : "text-slate-600 hover:bg-slate-50"
                                )}
                              >
                                <Linkedin className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">LinkedIn</span>
                              </button>
                              <button 
                                onClick={() => handleShare('facebook', article)}
                                className={cn(
                                  "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left transition-colors",
                                  isHighContrast ? "text-white hover:bg-white hover:text-black" : "text-slate-600 hover:bg-slate-50"
                                )}
                              >
                                <Facebook className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
                              </button>
                              <div className={cn("h-px my-1", isHighContrast ? "bg-white/20" : "bg-slate-100")} />
                              <button 
                                onClick={() => handleShare('copy', article)}
                                className={cn(
                                  "flex items-center justify-between w-full px-3 py-2 rounded-xl text-left transition-colors",
                                  isHighContrast ? "text-yellow-400 hover:bg-white hover:text-black" : "text-blue-600 hover:bg-blue-50"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <LinkIcon className="w-4 h-4" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Copy Link</span>
                                </div>
                                {copySuccess === article.id && (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {article.isHighImpact && (
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded uppercase",
                        isHighContrast ? "text-black bg-yellow-400" : "text-red-600 bg-red-100"
                      )}>
                        High Impact
                      </span>
                    )}
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter",
                      isHighContrast ? "text-white" : "text-slate-400"
                    )}>
                      <Clock className="w-3 h-3" />
                      {article.timestamp}
                    </div>
                  </div>
                </div>

                <h3 className={cn(
                  "font-bold leading-tight mb-3 transition-all",
                  isHighContrast ? "text-3xl text-white underline decoration-yellow-400" : "text-lg text-slate-800"
                )}>
                  {article.title}
                </h3>

                {/* Live and Location Indicators */}
                {(article.isLive || article.location || article.newsPoint) && (
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {article.isLive && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 animate-pulse">
                        <Radio className="w-3 h-3 text-emerald-600" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live Report</span>
                      </div>
                    )}
                    {article.location && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">{article.location}</span>
                        {article.coordinates && (
                          <span className="text-[8px] font-mono opacity-50">[{article.coordinates.lat.toFixed(2)}, {article.coordinates.lng.toFixed(2)}]</span>
                        )}
                      </div>
                    )}
                    {article.newsPoint && (
                      <div className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors",
                        isHighContrast ? "bg-white text-black border-white" : "bg-blue-50 text-blue-600 border-blue-100"
                      )}>
                        <Flag className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{article.newsPoint}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Related Market Trend */}
                {article.relatedTrend && (
                  <div className={cn(
                    "mb-4 flex flex-col gap-2 p-3 rounded-xl transition-all",
                    isHighContrast 
                      ? "bg-black border border-white" 
                      : "bg-slate-50 border border-slate-100 shadow-sm"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Market Link</span>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-tight",
                            isHighContrast ? "text-white" : "text-slate-800"
                          )}>{article.relatedTrend.symbol}</span>
                        </div>
                        <div className="h-6 w-px bg-slate-200 mx-1" />
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Live Price</span>
                          <span className={cn(
                            "text-xs font-black font-mono",
                            isHighContrast ? "text-yellow-400" : "text-slate-900"
                          )}>{article.relatedTrend.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {article.relatedTrend.volume && (
                          <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Vol</span>
                            <div className="flex items-center gap-1 text-slate-500">
                              <Activity className="w-2.5 h-2.5" />
                              <span className="text-[10px] font-bold">{(article.relatedTrend.volume/1000).toFixed(1)}K</span>
                            </div>
                          </div>
                        )}
                        <div className={cn(
                          "flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-black",
                          article.relatedTrend.change >= 0 
                            ? (isHighContrast ? "text-yellow-400 bg-none border border-yellow-400" : "text-emerald-600 bg-emerald-50 border border-emerald-100") 
                            : (isHighContrast ? "text-red-400 bg-none border border-red-400" : "text-red-600 bg-red-50 border border-red-100")
                        )}>
                          {article.relatedTrend.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(article.relatedTrend.change).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    {article.relatedTrend.marketData && (
                      <div className={cn(
                        "pt-2 border-t flex items-center gap-2",
                        isHighContrast ? "border-white/20" : "border-slate-200/50"
                      )}>
                        <Globe className="w-2.5 h-2.5 text-blue-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{article.relatedTrend.marketData}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <p className={cn(
                  "leading-snug mb-3 transition-all",
                  isHighContrast ? "text-xl text-white font-medium" : "text-sm text-slate-500"
                )}>
                  {article.summary}
                </p>

                {article.sceneDetails && (
                  <div className={cn(
                    "mb-4 p-3 rounded-xl border-l-2 text-[11px] leading-relaxed italic",
                    isHighContrast ? "bg-black border-white text-white/80" : "bg-slate-50 border-slate-200 text-slate-400"
                  )}>
                    <span className="font-black uppercase tracking-widest block mb-1 opacity-50 text-[8px]">Scene Detail</span>
                    "{article.sceneDetails}"
                  </div>
                )}

                {/* AI Summary Section */}
                <div className="mb-4 space-y-3">
                  {!aiSummaries[article.id] ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateSummary(article.id, article.title, article.summary, article.category);
                      }}
                      disabled={loadingSummaries[article.id]}
                      className={cn(
                        "flex items-center gap-2 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full justify-center",
                        isHighContrast
                          ? "bg-black border border-white text-white hover:bg-yellow-400 hover:text-black"
                          : "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100"
                      )}
                    >
                      {loadingSummaries[article.id] ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3" />
                          Generate Gemini AI Summary
                        </>
                      )}
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-3 rounded-xl border-l-4 transition-all",
                        isHighContrast
                          ? "bg-black border-yellow-400 text-white shadow-none"
                          : "bg-gradient-to-r from-blue-50/50 to-emerald-50/50 border-blue-400 shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkle className={cn("w-3 h-3", isHighContrast ? "text-yellow-400" : "text-blue-500")} />
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          isHighContrast ? "text-yellow-400" : "text-blue-600"
                        )}>AI Insight</span>
                      </div>
                      <p className={cn(
                        "text-xs leading-relaxed",
                        isHighContrast ? "font-bold" : "text-slate-700 font-medium"
                      )}>
                        {aiSummaries[article.id]}
                      </p>
                    </motion.div>
                  )}

                  {/* Detailed Analysis Button/Display */}
                  {!aiDeepAnalyses[article.id] ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateDeepAnalysis(article.id, article.title, article.summary, article.category, article.relatedTrend?.symbol);
                      }}
                      disabled={loadingDeepSummaries[article.id]}
                      className={cn(
                        "flex items-center gap-2 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full justify-center",
                        isHighContrast
                          ? "bg-black border border-white text-white hover:bg-emerald-400 hover:text-black"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100"
                      )}
                    >
                      {loadingDeepSummaries[article.id] ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Analyzing Strategy...
                        </>
                      ) : (
                        <>
                          <Brain className="w-3 h-3" />
                          Deep Strategic Analysis
                        </>
                      )}
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all space-y-3",
                        isHighContrast
                          ? "bg-black border-emerald-400 text-white"
                          : "bg-slate-900 text-slate-100 border-slate-800 shadow-xl"
                      )}
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Strategic Intelligence</span>
                        </div>
                        <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                      </div>
                      
                      {aiDeepAnalyses[article.id].split('\n').filter(line => line.trim()).map((line, idx) => {
                        const [label, content] = line.split(': ');
                        return (
                          <div key={idx} className="space-y-1">
                            <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-500 block">
                              {label}
                            </span>
                            <p className="text-[11px] leading-relaxed text-slate-300 font-medium whitespace-pre-wrap">
                              {content || label}
                            </p>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </div>

                {article.sceneDetails && (
                  <div className="mb-6 p-3 bg-slate-50/50 border-l-2 border-slate-200 rounded-r-xl">
                    <p className="text-[11px] italic text-slate-500 leading-relaxed">
                      <span className="font-bold text-[9px] uppercase tracking-widest text-slate-400 block mb-1">On-Scene Intelligence:</span>
                      "{article.sceneDetails}"
                    </p>
                  </div>
                )}

                <div className={cn(
                  "flex items-center justify-between mt-auto pt-4 border-t gap-2",
                  isHighContrast ? "border-white" : "border-slate-100"
                )}>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.1em]",
                      isHighContrast ? "text-yellow-400" : "text-slate-400"
                    )}>{article.source}</span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportArticle(article.id, article.title, article.summary);
                      }}
                      disabled={loadingReports[article.id]}
                      className={cn(
                        "flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        moderationReports[article.id]
                          ? (moderationReports[article.id].isViolating 
                              ? (isHighContrast ? "bg-red-600 text-white" : "bg-red-50 text-red-600 border border-red-100")
                              : (isHighContrast ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600 border border-emerald-100"))
                          : (isHighContrast 
                              ? "text-white hover:bg-white/10" 
                              : "text-slate-400 hover:text-red-500 hover:bg-red-50")
                      )}
                    >
                      {loadingReports[article.id] ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : moderationReports[article.id] ? (
                        moderationReports[article.id].isViolating ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            Violating
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Cleared
                          </>
                        )
                      ) : (
                        <>
                          <Flag className="w-3 h-3" />
                          Report
                        </>
                      )}
                    </button>
                  </div>

                  <button className={cn(
                    "font-bold flex items-center gap-1 transition-all",
                    isHighContrast ? "text-xl text-yellow-400 hover:underline" : "text-sm text-blue-600 group-hover:translate-x-1"
                  )}>
                    View Analysis <ChevronRight className={cn("w-4 h-4", isHighContrast && "w-6 h-6")} />
                  </button>
                </div>
                {/* Comments Section Toggle */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComments(article.id);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      activeComments.includes(article.id)
                        ? (isHighContrast ? "bg-white text-black" : "bg-slate-900 text-white shadow-lg")
                        : (isHighContrast ? "bg-black border border-white text-white hover:bg-yellow-400 hover:text-black" : "bg-white text-slate-500 border border-slate-100 hover:border-slate-300")
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Discussion {comments[article.id]?.length > 0 && `(${comments[article.id].length})`}
                  </button>
                </div>

                {/* Collapsible Comments Area */}
                <AnimatePresence>
                  {activeComments.includes(article.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Add your intelligence..."
                            value={newCommentText[article.id] || ''}
                            onChange={(e) => setNewCommentText(prev => ({ ...prev, [article.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(article.id);
                              }
                            }}
                            className={cn(
                              "flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all outline-none",
                              isHighContrast 
                                ? "bg-black border-2 border-white text-white focus:border-yellow-400" 
                                : "bg-slate-50 border border-slate-100 focus:border-blue-400 focus:bg-white"
                            )}
                          />
                          <button
                            onClick={() => handleAddComment(article.id)}
                            className={cn(
                              "p-2.5 rounded-xl transition-all",
                              isHighContrast ? "bg-yellow-400 text-black" : "bg-blue-600 text-white hover:bg-blue-700"
                            )}
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {(!comments[article.id] || comments[article.id].length === 0) ? (
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center py-4 italic">
                              No insights shared yet. Be the first to contribute.
                            </p>
                          ) : (
                            comments[article.id].map((comment) => (
                              <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(
                                  "p-3 rounded-2xl relative group",
                                  isHighContrast ? "bg-white/10 border border-white/20" : "bg-slate-50 border border-slate-100"
                                )}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest",
                                    isHighContrast ? "text-yellow-400" : "text-blue-600"
                                  )}>@{comment.user}</span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase">{comment.timestamp}</span>
                                </div>
                                <p className={cn(
                                  "text-xs leading-relaxed",
                                  isHighContrast ? "text-white" : "text-slate-600"
                                )}>
                                  {comment.text}
                                </p>
                                <button
                                  onClick={() => handleDeleteComment(article.id, comment.id)}
                                  className={cn(
                                    "absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all",
                                    isHighContrast ? "text-red-400 hover:bg-white hover:text-black" : "text-slate-300 hover:text-red-500 hover:bg-red-50"
                                  )}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
        
        {filteredNews.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400"
          >
            <Filter className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">No articles match your filters</p>
            <button 
              onClick={() => { setSelectedCategory('All'); setShowHighImpactOnly(false); }}
              className="mt-4 text-blue-600 text-[10px] font-black uppercase hover:underline"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Infinite Scroll Loader */}
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        {isFetchingMore ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Bot className="w-5 h-5 text-blue-600" />
              </motion.div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 animate-pulse">
              Synthesizing Intelligence...
            </p>
          </div>
        ) : (
          <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1/2 h-full bg-blue-600/20"
            />
          </div>
        )}
      </div>
      
      {/* Personalized Recommendations Section */}
      {user && (
        <div className="mt-12 bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">For You</h3>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">AI-Curated Intelligence Based on Your Interests</p>
            </div>
            {loadingRecommendations && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.length > 0 ? (
              recommendations.map((article) => (
                <motion.div
                  key={`rec-${article.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex flex-col h-full",
                    isHighContrast 
                      ? "bg-black border-2 border-white text-white" 
                      : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                      isHighContrast ? categoryHighContrast[article.category] : categoryColors[article.category]
                    )}>{article.category}</span>
                    <Bot className="w-3 h-3 text-blue-400" />
                  </div>
                  <h4 className={cn(
                    "text-sm font-black mb-2 line-clamp-2 leading-tight flex-1",
                    isHighContrast ? "text-yellow-400" : "text-slate-900"
                  )}>
                    {article.title}
                  </h4>
                  <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between relative">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{article.source}</span>
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveShareMenu(activeShareMenu === `rec-${article.id}` ? null : `rec-${article.id}`);
                          }}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            activeShareMenu === `rec-${article.id}` ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          )}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <AnimatePresence>
                          {activeShareMenu === `rec-${article.id}` && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 10 }}
                              className={cn(
                                "absolute right-0 bottom-full mb-2 w-40 p-1.5 rounded-xl shadow-2xl z-50",
                                isHighContrast ? "bg-black border-2 border-white" : "bg-white border border-slate-100"
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex flex-col gap-0.5">
                                <button onClick={() => handleShare('twitter', article)} className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-left hover:bg-slate-50 text-slate-600">
                                  <Twitter className="w-3.5 h-3.5" />
                                  <span className="text-[9px] font-black uppercase">Twitter</span>
                                </button>
                                <button onClick={() => handleShare('linkedin', article)} className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-left hover:bg-slate-50 text-slate-600">
                                  <Linkedin className="w-3.5 h-3.5" />
                                  <span className="text-[9px] font-black uppercase">LinkedIn</span>
                                </button>
                                <button onClick={() => handleShare('facebook', article)} className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-left hover:bg-slate-50 text-slate-600">
                                  <Facebook className="w-3.5 h-3.5" />
                                  <span className="text-[9px] font-black uppercase">Facebook</span>
                                </button>
                                <button onClick={() => handleShare('copy', article)} className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-left hover:bg-blue-50 text-blue-600">
                                  <div className="flex items-center gap-2.5">
                                    <LinkIcon className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase">Copy</span>
                                  </div>
                                  {copySuccess === article.id && <CheckCircle className="w-3 h-3" />}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <button className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        isHighContrast ? "text-white" : "text-blue-600 hover:bg-blue-50"
                      )}>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : !loadingRecommendations ? (
              <div className="col-span-full py-8 text-center text-slate-400">
                <p className="text-[10px] font-black uppercase tracking-widest">Bookmark articles to see recommendations</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
