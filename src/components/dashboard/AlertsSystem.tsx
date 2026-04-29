import React, { useState } from 'react';
import { Bell, ShieldAlert, Cpu, Lightbulb, Smartphone, Globe, Radio } from 'lucide-react';
import { cn } from '../../lib/utils';
import { UserAlerts } from '../../types';

export default function AlertsSystem() {
  const [alerts, setAlerts] = useState<UserAlerts>({
    marketCrashes: true,
    aiUpdates: false,
    startupTrends: true,
    notificationsEnabled: true,
  });

  const toggleAlert = (key: keyof UserAlerts) => {
    setAlerts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="px-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase">Alerts Control</h2>
        <p className="text-slate-500 text-sm mt-1">Configure intelligent signals and real-time triggers.</p>
      </div>

      <div className="bento-card overflow-hidden !p-0">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">System Notifications</h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Master Switch</p>
            </div>
          </div>
          <button 
            onClick={() => toggleAlert('notificationsEnabled')}
            className={cn(
              "w-14 h-7 rounded-full transition-all relative",
              alerts.notificationsEnabled ? "bg-emerald-500" : "bg-slate-200"
            )}
          >
            <div className={cn(
              "absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm",
              alerts.notificationsEnabled ? "left-8" : "left-1"
            )} />
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          <AlertToggle 
            icon={ShieldAlert}
            title="Market Crash Signals"
            description="High-frequency monitoring of benchmark indices for >2% intraday volatility."
            active={alerts.marketCrashes}
            onClick={() => toggleAlert('marketCrashes')}
            colorClass="text-red-600 bg-red-50"
          />
          <AlertToggle 
            icon={Cpu}
            title="AI Capability Shifts"
            description="Neural architecture breakthroughs and significant open-source model releases."
            active={alerts.aiUpdates}
            onClick={() => toggleAlert('aiUpdates')}
            colorClass="text-blue-600 bg-blue-50"
          />
          <AlertToggle 
            icon={Lightbulb}
            title="Opp Gap Alerts"
            description="Predictive detection of startup opportunities derived from news correlation."
            active={alerts.startupTrends}
            onClick={() => toggleAlert('startupTrends')}
            colorClass="text-amber-600 bg-amber-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-12">
        <div className="bento-card flex items-start gap-5 hover:border-slate-300">
          <Smartphone className="w-8 h-8 text-slate-300 shrink-0" />
          <div>
            <h4 className="font-bold text-slate-800">Mobile Direct</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium capitalize">Priority push channel active on iOS/Android.</p>
          </div>
        </div>
        <div className="bento-card flex items-start gap-5 hover:border-slate-300">
          <Globe className="w-8 h-8 text-slate-300 shrink-0" />
          <div>
            <h4 className="font-bold text-slate-800">Browser Sync</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">Real-time desktop overlay enabled in background.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToggleProps {
  icon: React.ElementType;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
  colorClass: string;
}

function AlertToggle({ icon: Icon, title, description, active, onClick, colorClass }: ToggleProps) {
  return (
    <div className="p-8 flex items-start justify-between group hover:bg-slate-50/30 transition-colors">
      <div className="flex gap-5">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm transition-all group-hover:scale-110", colorClass)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-lg leading-none mb-2">{title}</h4>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md font-medium">{description}</p>
        </div>
      </div>
      <button 
        onClick={onClick}
        className={cn(
          "w-12 h-6 rounded-full transition-all relative shrink-0 ml-6 mt-1.5",
          active ? "bg-slate-800" : "bg-slate-200"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
          active ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );
}
