import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Trophy, Zap, Share2, MessageSquare, 
  UserPlus, Award, Bell, Shield, Star, 
  Target, TrendingUp, CheckCircle2, Copy, X 
} from 'lucide-react';
import { useNetwork } from '../../contexts/NetworkContext';
import { cn } from '../../lib/utils';
import { RECOMMENDED_USERS } from '../../constants';

export default function NetworkKing() {
  const [activeTab, setActiveTab] = useState<'hub' | 'feed' | 'leaderboard' | 'challenges'>('hub');
  const { 
    profile, communityPosts, challenges, 
    notifications, leaderboard, createPost, 
    likePost, completeChallenge, connectWithUser 
  } = useNetwork();

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center border-2 border-white/20 backdrop-blur-md shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black">{profile.name.charAt(0)}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl ring-2 ring-slate-900">
                  {profile.level}
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">{profile.name}</h1>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm border border-white/5">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    <span className="text-xs font-bold">{profile.points} Points</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm border border-white/5">
                    <Trophy className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-bold">Rank #{profile.rank}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl backdrop-blur-md border border-white/5">
              {(['hub', 'feed', 'leaderboard', 'challenges'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab 
                      ? "bg-white text-slate-900 shadow-xl scale-105" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 blur-[100px] -ml-32 -mb-32 rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'hub' && <HubView />}
          {activeTab === 'feed' && <FeedView />}
          {activeTab === 'leaderboard' && <LeaderboardView />}
          {activeTab === 'challenges' && <ChallengesView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function HubView() {
  const { profile, connections, connectWithUser, disconnectFromUser, notifications } = useNetwork();
  if (!profile) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Stats & Referral */}
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Networking Power</h2>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress to {profile.level === 'King' ? 'Legend' : 'Next Level'}</span>
                <span className="text-xs font-black text-blue-600">75%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  className="h-full bg-blue-600 rounded-full shadow-sm shadow-blue-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-xl font-black text-slate-900 mb-1">{profile.referrals}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Referrals</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-xl font-black text-slate-900 mb-1">{profile.badges.length}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Badges</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-sm font-black uppercase tracking-widest mb-4">Refer & Earn</h2>
            <p className="text-xs text-blue-100 mb-6 leading-relaxed">
              Invite friends to TrendScope and earn <span className="font-bold text-white">500 points</span> each.
            </p>
            <div className="flex items-center gap-2 p-2 bg-white/10 rounded-xl border border-white/20">
              <code className="flex-1 font-mono text-sm font-bold text-center tracking-tighter">{profile.referralCode}</code>
              <button className="p-2 bg-white text-blue-600 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <Share2 className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
        </div>
      </div>

      {/* Center Column: Suggested Connections */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">Recommended for You</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Based on your skills & interests</p>
            </div>
            <Users className="w-5 h-5 text-blue-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RECOMMENDED_USERS.map((user, i) => {
              const isFollowed = connections.includes(user.id);
              
              return (
                <motion.div 
                  key={user.id}
                  whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  className={cn(
                    "p-4 rounded-2xl border flex flex-col justify-between group transition-all",
                    isFollowed ? "bg-blue-50/30 border-blue-100" : "bg-slate-50 border-slate-100"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border font-black",
                        isFollowed ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-400 border-slate-200"
                      )}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">{user.name}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{user.role}</p>
                      </div>
                    </div>
                    {isFollowed ? (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[8px] font-black text-emerald-600 animate-in fade-in zoom-in">
                        <CheckCircle2 className="w-3 h-3" />
                        Following
                      </div>
                    ) : (
                      <div className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded-lg text-[9px] font-black text-blue-600">
                        {user.match} Match
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {user.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[8px] font-bold text-slate-500 uppercase">{s}</span>
                    ))}
                  </div>
                  <button 
                    onClick={() => isFollowed ? disconnectFromUser(user.id) : connectWithUser(user.id)}
                    className={cn(
                      "w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                      isFollowed 
                        ? "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 border border-transparent" 
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900"
                    )}
                  >
                    {isFollowed ? (
                      <>
                        <X className="w-3 h-3" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        Follow
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedView() {
  const { communityPosts, createPost, likePost } = useNetwork();
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState<'idea' | 'opportunity' | 'question'>('idea');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        {/* Create Post */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400">U</div>
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
              {(['idea', 'opportunity', 'question'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    postType === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <textarea 
            placeholder="Share an insight or ask the community..."
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all resize-none mb-4"
          />
          <div className="flex justify-end">
            <button 
              onClick={() => {
                if (!postText.trim()) return;
                createPost(postText, postType, []);
                setPostText('');
              }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              Post Insights
              <Zap className="w-3 h-3 fill-current" />
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {communityPosts.map((post) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 border border-slate-100">{post.userName.charAt(0)}</div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">{post.userName}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{post.timestamp}</p>
                  </div>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                  post.type === 'idea' ? "bg-purple-50 text-purple-600 border-purple-100" :
                  post.type === 'opportunity' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  "bg-blue-50 text-blue-600 border-blue-100"
                )}>
                  {post.type}
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
                {post.text}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {post.tags.map(t => (
                  <span key={t} className="text-[9px] font-bold text-blue-500 uppercase">#{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                <button 
                  onClick={() => likePost(post.id)}
                  className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Star className="w-4 h-4" />
                  <span className="text-[10px] font-black">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-[10px] font-black">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-400 hover:text-slate-900 ml-auto transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Trending Topics</h2>
          <div className="space-y-3">
            {['#AIRulemaking', '#Web3Sustainability', '#StartupGrants', '#DataPrivacy'].map((tag, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors">{tag}</span>
                <TrendingUp className="w-3.5 h-3.5 text-slate-200 group-hover:text-blue-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardView() {
  const { leaderboard, profile } = useNetwork();

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-1">Network Kings</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global top performers and trend leaders</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <div className="text-xs font-black text-slate-900">Weekly</div>
            <div className="text-[8px] font-bold text-slate-400 uppercase">Cycle</div>
          </div>
          <div className="px-4 py-2 bg-blue-600 rounded-xl text-center text-white shadow-lg shadow-blue-200">
            <div className="text-xs font-black">All Time</div>
            <div className="text-[8px] font-bold text-blue-100 uppercase">Glory</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Master</th>
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</th>
              <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Power Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaderboard.map((user, i) => (
              <tr key={user.id} className={cn(
                "group transition-all hover:bg-slate-50/50",
                user.id === profile?.id && "bg-blue-50/30"
              )}>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    {i === 0 && <Award className="w-5 h-5 text-yellow-500 fill-current" />}
                    {i === 1 && <Award className="w-5 h-5 text-slate-400 fill-current" />}
                    {i === 2 && <Award className="w-5 h-5 text-amber-700 fill-current" />}
                    {i > 2 && <span className="text-sm font-black text-slate-400 ml-1.5">#{user.rank}</span>}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-100">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                        {user.name}
                        {user.id === profile?.id && (
                          <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded-md text-[7px] font-black tracking-tighter">YOU</span>
                        )}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    user.level === 'King' ? "bg-yellow-400 text-black border-yellow-500" :
                    user.level === 'Expert' ? "bg-slate-900 text-white border-slate-900" :
                    "bg-white text-slate-600 border-slate-200"
                  )}>
                    {user.level}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className="text-sm font-mono font-black text-slate-900">{user.points.toLocaleString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChallengesView() {
  const { challenges, completeChallenge } = useNetwork();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {challenges.map((challenge) => (
        <motion.div 
          key={challenge.id}
          whileHover={{ y: -5 }}
          className={cn(
            "p-6 rounded-3xl border transition-all relative overflow-hidden group",
            challenge.completed 
              ? "bg-slate-50 border-slate-100 opacity-80" 
              : "bg-white border-slate-100 hover:border-blue-200 shadow-sm"
          )}
        >
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                challenge.completed 
                  ? "bg-emerald-50 text-emerald-500" 
                  : iChallengeTypeColor(challenge.type)
              )}>
                {challenge.completed ? <CheckCircle2 className="w-6 h-6" /> : <Target className="w-6 h-6" />}
              </div>
              <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {challenge.type}
              </div>
            </div>
            
            <h3 className="text-sm font-black text-slate-900 mb-2">{challenge.title}</h3>
            <p className="text-[11px] font-medium text-slate-500 leading-relaxed mb-6 h-10 line-clamp-2">
              {challenge.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                <span className="text-xs font-black text-slate-900">+{challenge.points} XP</span>
              </div>
              {challenge.completed ? (
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                  Completed <CheckCircle2 className="w-3 h-3" />
                </span>
              ) : (
                <button 
                  onClick={() => completeChallenge(challenge.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
                >
                  Confirm Goal
                </button>
              )}
            </div>
          </div>

          <div className={cn(
            "absolute -bottom-6 -right-6 w-24 h-24 blur-[60px] opacity-20",
            challenge.type === 'daily' ? "bg-amber-400" : "bg-purple-600"
          )} />
        </motion.div>
      ))}
    </div>
  );
}

function iChallengeTypeColor(type: 'daily' | 'weekly') {
  return type === 'daily' ? "bg-amber-50 text-amber-600" : "bg-purple-50 text-purple-600";
}
