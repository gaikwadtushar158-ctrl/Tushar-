import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User, CheckCircle2, AlertCircle, Loader2, Camera, ShieldCheck, Users, Mail, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNetwork } from '../../contexts/NetworkContext';
import { RECOMMENDED_USERS } from '../../constants';

export default function Profile() {
  const { user, profile } = useAuth();
  const { connections, disconnectFromUser } = useNetwork();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.displayName || '');
      setHandle(profile.handle || '');
    }
  }, [profile]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size (e.g., max 2MB)
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          photoURL: base64String,
        });
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } catch (error) {
        console.error('Error uploading image:', error);
        setStatus('error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setStatus('idle');

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: name,
        handle: handle.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      });
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Identity Settings</h1>
        <p className="text-slate-500 font-medium leading-relaxed">Customize how you appear across the AIE Intelligence network.</p>
      </div>

      <div className="bento-card p-8 space-y-8 overflow-visible">
        <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-slate-50">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-tr from-blue-400 to-emerald-400 p-1 shadow-2xl shadow-blue-200/50 transition-transform group-hover:scale-[1.02]">
              <div className="w-full h-full rounded-[1.8rem] bg-white overflow-hidden p-1 relative">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover rounded-[1.5rem]" />
                ) : user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover rounded-[1.5rem]" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-[1.5rem]">
                    <User className="w-12 h-12 text-slate-200" />
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-[1.5rem]">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                )}
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 p-3 bg-slate-900 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform border-4 border-white active:scale-95 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 flex-1 text-center sm:text-left">
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Authenticated Account</p>
              <h2 className="text-xl font-bold text-slate-900">{user.email}</h2>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">Verified Identity</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">
                <p className="text-[10px] font-black uppercase tracking-widest">Node: Asia-Pacific-01</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Alexander Pierce"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-800 font-bold focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Network Handle</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-400 font-bold">@</span>
                <input 
                  type="text" 
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="cyber_pioneer"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-10 pr-6 text-slate-800 font-bold focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                {status === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 text-emerald-600"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-bold">Protocol entry updated</span>
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 text-red-600"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-bold">Update rejected by firewall</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              disabled={isSaving}
              className={cn(
                "px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm tracking-tight shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50",
                "hover:bg-blue-600 hover:shadow-blue-200"
              )}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing...</span>
                </div>
              ) : 'Commit Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4 items-start">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-amber-100 shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h4 className="text-sm font-black text-amber-800 uppercase tracking-widest mb-1">Network Synchronicity</h4>
          <p className="text-sm text-amber-700 leading-relaxed font-medium">Changes to your handle are immediate. All your previous predictions, data visualizations, and startup bookmarks will remain linked to your unique node identifier.</p>
        </div>
      </div>

      {/* Connections Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Connections</h2>
          <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
            {connections.length} Members
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {connections.length > 0 ? (
              connections.map((connId) => {
                const user = RECOMMENDED_USERS.find(u => u.id === connId);
                if (!user) return null;
                
                return (
                  <motion.div
                    layout
                    key={connId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bento-card p-4 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-200">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{user.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => disconnectFromUser(connId)}
                        className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active connections found</p>
                <p className="text-xs text-slate-400 mt-1">Visit the Social Hub to find like-minded explorers.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
