import React from 'react';
import { STARTUP_OPPORTUNITIES } from '../../constants';
import { Lightbulb, Target, ShieldAlert, Zap, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export default function StartupOpportunities() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase">Unicorn Hunters</h2>
          <p className="text-slate-500 text-sm mt-1">Daily opportunity gaps identified by market signals.</p>
        </div>
        <div className="bg-emerald-100 p-2 rounded-xl">
          <Target className="h-6 w-6 text-emerald-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STARTUP_OPPORTUNITIES.map((opp, index) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bento-card flex flex-col group hover:shadow-xl hover:shadow-slate-200/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 underline decoration-blue-400">Match {index + 1}</p>
                <div className={cn(
                  "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider inline-block",
                  opp.competition === 'Low' ? "bg-emerald-50 text-emerald-600" :
                  opp.competition === 'Medium' ? "bg-blue-50 text-blue-600" :
                  "bg-orange-50 text-orange-600"
                )}>
                  {opp.competition} Competition
                </div>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  The Friction
                </h4>
                <p className="text-sm text-slate-600 font-medium italic leading-relaxed">
                  "{opp.problem}"
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">
                  The Hypothesis
                </h4>
                <p className="text-sm font-bold text-slate-800 leading-snug">
                  {opp.idea}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-6">
                Signal Source: <span className="opacity-80 italic">{opp.relevance}</span>
              </p>
              <button className="w-full bg-slate-900 text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all hover:scale-[1.02] shadow-sm">
                Deep Dive Concept
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        
        <button className="bento-card border-2 border-dashed border-slate-200 bg-transparent flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-600 group">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:scale-110 transition-all">
            <Zap className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">Forge New Opportunity</p>
            <p className="text-[11px] font-medium opacity-60">Leverages latest news flow</p>
          </div>
        </button>
      </div>
    </div>
  );
}
