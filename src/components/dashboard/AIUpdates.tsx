import React from 'react';
import { AI_UPDATES } from '../../constants';
import { AITag } from '../../types';
import { Zap, Sparkles, Beaker, Calendar, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

const tagIcons: Record<AITag, React.ElementType> = {
  Breakthrough: Zap,
  'Business Use': Sparkles,
  Experimental: Beaker,
};

const tagStyles: Record<AITag, string> = {
  Breakthrough: 'bg-purple-50 text-purple-600 border-purple-100',
  'Business Use': 'bg-blue-50 text-blue-600 border-blue-100',
  Experimental: 'bg-amber-50 text-amber-600 border-amber-100',
};

export default function AIUpdates() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase">AI Insights</h2>
          <p className="text-slate-500 text-sm mt-1">Machine intelligence tracking and model releases.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AI_UPDATES.map((update, index) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bento-card-dark group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                  tagStyles[update.tag].replace('bg-', 'bg-opacity-20 bg-')
                )}>
                  {update.tag}
                </div>
                {React.createElement(tagIcons[update.tag], { className: cn("w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity", tagStyles[update.tag].split(' ')[1]) })}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">
                {update.name}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {update.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                {update.updatedAt}
              </div>
              <button className="text-xs font-bold text-blue-400 hover:text-white transition-colors">
                Explore Tool
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bento-card bg-slate-50 border-slate-200">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Trending Ecosystem Tools</p>
        <div className="flex flex-wrap gap-3">
          {['Perplexity', 'Cursor', 'v0.dev', 'Midjourney', 'Claude'].map(tool => (
            <span key={tool} className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-600 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all cursor-default">
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
