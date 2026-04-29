import React from 'react';
import { LayoutDashboard, TrendingUp, Cpu, Lightbulb, Bell, Menu, X, ChevronRight, User, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNetwork } from '../../contexts/NetworkContext';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navItems = [
  { id: 'home', label: 'Home Dashboard', icon: LayoutDashboard },
  { id: 'trends', label: 'Market Trends', icon: TrendingUp },
  { id: 'network', label: 'Network King', icon: Users },
  { id: 'social', label: 'Social Hub', icon: Users },
  { id: 'aichat', label: 'Trend AI Chat', icon: Cpu },
  { id: 'profile', label: 'Identity Settings', icon: User },
];

export default function Sidebar({ activeSection, setActiveSection, isOpen, setIsOpen }: SidebarProps) {
  const { notifications } = useNetwork();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-800">TrendScope</span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group text-sm font-bold",
                  activeSection === item.id 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  activeSection === item.id ? "text-blue-400" : "text-slate-300 group-hover:text-slate-900"
                )} />
                {item.label}
                {item.id === 'social' && unreadCount > 0 && (
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-200" />
                )}
                {item.id === 'trends' && (
                  <span className="ml-auto text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-md">LIVE</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-6">
            <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Network Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-slate-600">AI Core Active</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
