import React, { useState } from 'react';
import { MOCK_MARKETS, INDUSTRY_TRENDS, VIRAL_TRENDS } from '../../constants';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Info, BarChart3, Flame, Zap, AlertTriangle, ArrowUpRight, Target, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

const exportToCSV = (data: any[], filename: string) => {
  const headers = ['Timestamp', 'Value', 'Volume'];
  const csvContent = [
    headers.join(','),
    ...data.map(item => `${item.time},${item.value},${item.volume}`)
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const CustomTooltip = ({ active, payload, label, change }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Info className="w-3 h-3" />
          {label} Snapshot
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center gap-8">
            <span className="text-xs font-bold text-slate-400">Price</span>
            <span className={cn(
              "text-sm font-black font-mono",
              change >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {payload[0].value.toLocaleString()}
            </span>
          </div>
          {payload[1] && (
            <div className="flex justify-between items-center gap-8">
              <span className="text-xs font-bold text-slate-400">Volume</span>
              <span className="text-sm font-black font-mono text-blue-400">
                {payload[1].value.toLocaleString()}K
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function MarketTrends() {
  const [visibleVolumes, setVisibleVolumes] = useState<Record<string, boolean>>({
    'NIFTY 50': true,
    'S&P 500': true
  });

  const toggleVolume = (symbol: string) => {
    setVisibleVolumes(prev => ({
      ...prev,
      [symbol]: !prev[symbol]
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase">Market Intelligence</h2>
          <p className="text-slate-500 text-sm mt-1">Global benchmarks and sector health indicators.</p>
        </div>
        <div className="flex items-center gap-2 text-slate-400 group cursor-help">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Volume Tracking Active</span>
          <BarChart3 className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {MOCK_MARKETS.map((market) => (
          <div key={market.symbol} className="bento-card flex flex-col h-[420px] group/card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{market.symbol}</h3>
                  {market.volume && (
                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">
                    {market.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className={cn(
                    "text-xs font-black font-mono px-2 py-1 rounded-lg",
                    market.change >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                  )}>
                    {market.change >= 0 ? '↑' : '↓'} {market.change >= 0 ? '+' : ''}{market.change}%
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-400 mt-1">{market.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleVolume(market.symbol)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-inner",
                    visibleVolumes[market.symbol] 
                      ? "bg-blue-50 border-blue-100 text-blue-600 shadow-blue-100/50" 
                      : "bg-slate-50 border-slate-100 text-slate-300"
                  )}
                  title={visibleVolumes[market.symbol] ? "Hide Volume" : "Show Volume"}
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => exportToCSV(market.history, `${market.name.replace(/\s+/g, '_')}_Historical`)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border bg-slate-50 border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-white transition-all shadow-inner"
                  title="Export Data (CSV)"
                >
                  <Download className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 italic font-serif text-slate-300 text-xl shadow-inner group-hover/card:scale-110 transition-transform">
                  i
                </div>
              </div>
            </div>

            {/* Accurate Stats Detail */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Volume</p>
                <p className="text-xs font-black text-slate-700 font-mono">{(market.volume! / 1000).toFixed(1)}K</p>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">High</p>
                <p className="text-xs font-black text-emerald-600 font-mono">{market.high?.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Low</p>
                <p className="text-xs font-black text-red-600 font-mono">{market.low?.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Open</p>
                <p className="text-xs font-black text-slate-700 font-mono">{market.open?.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mkt Cap</p>
                <p className="text-xs font-black text-slate-700 font-mono">{market.marketCap}</p>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">P/E Ratio</p>
                <p className="text-xs font-black text-slate-700 font-mono">{market.peRatio}</p>
              </div>

              {market.range52w && (
                <div className="col-span-3 bg-slate-50/50 border border-slate-100 rounded-xl p-2 mt-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">52-Week Range</p>
                    <div className="flex gap-2 text-[9px] font-mono font-bold">
                      <span className="text-red-400">{market.range52w.low.toLocaleString()}</span>
                      <span className="text-slate-300">—</span>
                      <span className="text-emerald-500">{market.range52w.high.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="relative h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute h-full bg-blue-500 rounded-full"
                      style={{ 
                        left: `${Math.max(0, Math.min(95, ((market.price - market.range52w.low) / (market.range52w.high - market.range52w.low)) * 100))}%`,
                        width: '5%'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 w-full mt-auto -mx-6 -mb-6 relative h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={market.history} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`gradient-${market.symbol}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={market.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={market.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <Tooltip 
                    content={<CustomTooltip change={market.change} />}
                    cursor={{ stroke: market.change >= 0 ? '#10b981' : '#ef4444', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />

                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={market.change >= 0 ? "#10b981" : "#ef4444"} 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: market.change >= 0 ? '#10b981' : '#ef4444' }}
                    fillOpacity={1} 
                    fill={`url(#gradient-${market.symbol})`} 
                  />
                  
                  {visibleVolumes[market.symbol] && (
                    <Bar 
                      dataKey="volume" 
                      barSize={40} 
                      fill="#3b82f6" 
                      fillOpacity={0.1}
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Viral Content & Niche Detection */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase">Viral Intelligence</h2>
            <p className="text-slate-500 text-sm mt-1">Niches with the highest social momentum and growth.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {VIRAL_TRENDS.map((trend) => (
            <motion.div
              layout
              key={trend.id}
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {trend.status.includes('🔥') && <Flame className="w-12 h-12" />}
                {trend.status.includes('📈') && <Zap className="w-12 h-12" />}
                {trend.status.includes('⚠️') && <Target className="w-12 h-12" />}
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                    trend.status.includes('🔥') ? "bg-orange-50 text-orange-600" :
                    trend.status.includes('📈') ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                  )}>
                    {trend.status}
                  </div>
                  <span className="text-xs font-black text-emerald-500">{trend.growth} growth</span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{trend.niche}</h4>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{trend.title}</h3>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {trend.description}
                </p>

                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-50 text-slate-600 font-bold text-xs hover:bg-blue-600 hover:text-white transition-all group/btn">
                  Analyze Opportunity
                  <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bento-card bg-blue-600 border-none shadow-blue-200 shadow-2xl text-white">
        <h3 className="text-sm font-bold opacity-70 uppercase tracking-widest mb-6 px-2">Sector Pulse</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {INDUSTRY_TRENDS.map((industry) => (
            <motion.div 
              key={industry.name}
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 first:pl-2 last:pr-2"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{industry.name}</span>
                <span className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                  industry.status === 'Rising' ? "bg-white/20 text-white" : 
                  industry.status === 'Falling' ? "bg-red-400/40 text-red-100" : "bg-white/10 text-white/60"
                )}>
                  {industry.status}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.abs(industry.growth) * 5}%` }}
                  className={cn(
                    "h-full rounded-full transition-all",
                    industry.status === 'Rising' ? "bg-emerald-400" : 
                    industry.status === 'Falling' ? "bg-red-400" : "bg-slate-400"
                  )}
                />
              </div>
              <p className="text-[10px] font-bold mt-2 opacity-60">Impact Score: {Math.abs(industry.growth).toFixed(1)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
