import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, User, Bell, ChevronRight, Newspaper, TrendingUp, Lightbulb, LogOut, LogIn } from 'lucide-react';
import { MOCK_NEWS, MOCK_MARKETS, STARTUP_OPPORTUNITIES } from '../../constants';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { loginWithGoogle, logout } from '../../lib/firebase';

interface NavbarProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
}

interface Suggestion {
  id: string;
  title: string;
  category: 'News' | 'Market' | 'Startup';
  link?: string;
}

export default function Navbar({ onMenuClick, onProfileClick }: NavbarProps) {
  const { user, profile } = useAuth();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      const lowerQuery = query.toLowerCase();
      const terms = lowerQuery.split(/\s+/).filter(t => t.length > 0);
      const results: Suggestion[] = [];

      // Search News
      MOCK_NEWS.forEach(news => {
        const title = news.title.toLowerCase();
        const summary = news.summary.toLowerCase();
        if (terms.every(term => title.includes(term) || summary.includes(term))) {
          results.push({ id: `news-${news.id}`, title: news.title, category: 'News' });
        }
      });

      // Search Markets
      MOCK_MARKETS.forEach(market => {
        const symbol = market.symbol.toLowerCase();
        const name = market.name.toLowerCase();
        if (terms.every(term => symbol.includes(term) || name.includes(term))) {
          results.push({ id: `market-${market.symbol}`, title: `${market.symbol}: ${market.name}`, category: 'Market' });
        }
      });

      // Search Startups
      STARTUP_OPPORTUNITIES.forEach(opp => {
        const idea = opp.idea.toLowerCase();
        const problem = opp.problem.toLowerCase();
        if (terms.every(term => idea.includes(term) || problem.includes(term))) {
          results.push({ id: `startup-${opp.id}`, title: opp.idea, category: 'Startup' });
        }
      });

      setSuggestions(results.slice(0, 6)); // Limit to 6 suggestions
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle outside clicks to close suggestions and user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      // Simple outside click for user menu (can be refined but enough for now)
      if (showUserMenu && !(event.target as HTMLElement).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const highlightMatch = (text: string, match: string) => {
    if (!match.trim()) return <span>{text}</span>;
    // Split the match into terms and escape them for regex
    const terms = match.trim().split(/\s+/).filter(t => t.length > 0);
    if (terms.length === 0) return <span>{text}</span>;
    
    const pattern = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');
    const parts = text.split(regex);
    
    const lowerTerms = terms.map(t => t.toLowerCase());
    
    return (
      <>
        {parts.map((part, i) => (
          lowerTerms.includes(part.toLowerCase()) ? (
            <mark key={i} className="bg-blue-600/10 text-blue-700 px-0.5 rounded-sm no-underline font-extrabold ring-[0.5px] ring-blue-600/20">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        ))}
      </>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 lg:py-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-200 transition-colors lg:hidden"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          
          <div ref={containerRef} className="relative hidden md:block">
            <div className={cn(
              "flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-2xl w-64 lg:w-96 group focus-within:ring-4 focus-within:ring-slate-900/5 focus-within:border-slate-400 transition-all shadow-sm",
              showSuggestions && suggestions.length > 0 && "rounded-b-none border-b-transparent"
            )}>
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search trends or startups..." 
                className="bg-transparent border-none text-sm font-medium outline-none w-full text-slate-600 placeholder:text-slate-400"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border-x border-b border-slate-200 rounded-b-2xl shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="p-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => {
                        setQuery(suggestion.title);
                        setShowSuggestions(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors group text-left"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                        suggestion.category === 'News' ? "bg-blue-50 border-blue-100 text-blue-600" :
                        suggestion.category === 'Market' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                        "bg-amber-50 border-amber-100 text-amber-600"
                      )}>
                        {suggestion.category === 'News' && <Newspaper className="w-4 h-4" />}
                        {suggestion.category === 'Market' && <TrendingUp className="w-4 h-4" />}
                        {suggestion.category === 'Startup' && <Lightbulb className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                          {suggestion.category}
                        </p>
                        <p className="text-sm font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                          {highlightMatch(suggestion.title, query)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
                    </button>
                  ))}
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    Press Enter to search all results
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            {profile ? (
              <div className="flex flex-col items-end">
                <p className="text-sm font-black text-slate-800 leading-none">{profile.displayName}</p>
                <p className="text-[10px] font-bold text-blue-600 tracking-tight">@{profile.handle}</p>
              </div>
            ) : (
              <p className="text-sm font-bold text-slate-800">
                {user ? `Welcome, ${user.displayName?.split(' ')[0]}` : 'Sign in to sync'}
              </p>
            )}
          </div>
          
          <div className="h-10 w-px bg-slate-200 mx-2 hidden sm:block" />
          
          <div className="relative user-menu-container">
            <button 
              onClick={() => user ? setShowUserMenu(!showUserMenu) : loginWithGoogle()}
              className="relative group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-blue-400 transition-all overflow-hidden p-[2px]">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full rounded-[14px] object-cover" />
                ) : user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full rounded-[14px] object-cover" />
                ) : (
                  <div className="w-full h-full rounded-[14px] bg-gradient-to-tr from-blue-400 to-emerald-400 opacity-80 group-hover:opacity-100 flex items-center justify-center">
                    <User className="text-white w-5 h-5" />
                  </div>
                )}
              </div>
              {user && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-50 rounded-full" />
              )}
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && user && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                  <p className="text-sm font-bold text-slate-900 truncate">{profile?.displayName || user.displayName}</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] text-blue-600 font-bold">@{profile?.handle}</p>
                    <span className="text-[10px] text-slate-300">•</span>
                    <p className="text-[10px] text-slate-400 font-medium truncate italic">{user.email}</p>
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => {
                      onProfileClick();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors group text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100/50 border border-slate-100 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">My Profile</p>
                      <p className="text-[10px] opacity-70">Manage your details</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-600 rounded-xl transition-colors group text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100/50 border border-red-100 flex items-center justify-center shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Sign Out</p>
                      <p className="text-[10px] opacity-70">End your session</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {!user && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden p-2 z-50 group-hover:block hidden">
                <button 
                  onClick={() => loginWithGoogle()}
                  className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors group text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100/50 border border-blue-100 flex items-center justify-center shrink-0">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-bold">Google Login</p>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
