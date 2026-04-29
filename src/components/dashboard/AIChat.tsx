import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  Bot, 
  User, 
  Sparkles, 
  TrendingUp, 
  Lightbulb, 
  ArrowRight,
  Maximize2,
  X,
  Languages,
  Mic,
  Camera,
  Zap,
  Star
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ChatMessage } from '../../types';
import { analyzeImage, getTrendInsights } from '../../services/aiService';

const AI_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Flash', description: 'Fast, concise insights', icon: Zap },
  { id: 'gemini-1.5-pro', name: 'Pro', description: 'Deep, complex analysis', icon: Star },
];

export default function AIChat() {
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Trend AI (Super Intelligence) Online! 🚀 Main aapke screensots analyze karke hidden business opportunities nikalta hoon. Screenshot upload karo ya market ke baare mein poocho—let\'s find the next big thing together!',
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (isTyping || isAnalyzing) return;
    
    const trimmedInput = input.trim();
    if (!trimmedInput && !selectedImage) return;

    const currentImage = selectedImage;
    const currentInput = trimmedInput;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: Date.now(),
      type: currentImage ? 'image' : 'text',
      imageUrl: currentImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      if (currentImage) {
        setIsAnalyzing(true);
        const analysis = await analyzeImage(currentImage, selectedModel);
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Analysis complete! Check the breakdown below. Ye trend kaafi energetic lag raha hai!',
          timestamp: Date.now(),
          type: 'analysis',
          analysis: analysis
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const response = await getTrendInsights(currentInput, selectedModel);
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! Technical glitch. Phirse try karo please!",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden relative">
      {/* Chat Header */}
      <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Bot className="w-7 h-7" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 tracking-tight">Trend AI</h3>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Online</span>
               <span className="w-1 h-1 bg-slate-300 rounded-full" />
               <div className="flex items-center gap-1 group cursor-help">
                  <Languages className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400">Hindi + English</span>
               </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Model Selector */}
          <div className="flex bg-slate-100 p-1.5 rounded-[20px] gap-1 mr-2 flex">
            {AI_MODELS.map((model) => {
              const Icon = model.icon;
              const isActive = selectedModel === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all",
                    isActive 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Icon className={cn("w-3 h-3", isActive ? "text-blue-500" : "text-slate-400")} />
                  {model.name}
                </button>
              );
            })}
          </div>

          <button className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
            <Sparkles className="w-5 h-5 text-blue-500" />
          </button>
          <button className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
            <Paperclip className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex group",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] md:max-w-[70%] space-y-2",
              message.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "p-4 md:p-5 rounded-[28px] shadow-sm relative",
                message.role === 'user' 
                  ? "bg-blue-600 text-white rounded-tr-lg" 
                  : "bg-slate-50 text-slate-800 rounded-tl-lg"
              )}>
                {message.imageUrl && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-white/10">
                    <img src={message.imageUrl} alt="Uploaded" className="w-full max-h-64 object-cover" />
                  </div>
                )}
                {message.type === 'analysis' && message.analysis ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                       <Maximize2 className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Opportunity Analysis</span>
                    </div>
                    
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 text-blue-200">Summary</h4>
                      <p className="text-sm font-medium leading-relaxed">{message.analysis.summary}</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 text-blue-200">Deep Insights</h4>
                      <p className="text-xs opacity-90 leading-relaxed">{message.analysis.details}</p>
                    </div>

                    <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-yellow-300" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-100">The Opportunity</h4>
                      </div>
                      <p className="text-sm font-black">{message.analysis.opportunity}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-200">Recommended Steps</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {message.analysis.nextSteps.map((step, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                            <span className="text-xs font-semibold">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}
                
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-widest mt-2 block opacity-50",
                  message.role === 'user' ? "text-right" : "text-left"
                )}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-lg flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                  />
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {isAnalyzing ? `Analyzing with ${AI_MODELS.find(m => m.id === selectedModel)?.name}...` : `Trend AI (${AI_MODELS.find(m => m.id === selectedModel)?.name}) is thinking...`}
              </span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-white border-t border-slate-50 relative">
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full left-8 mb-4 p-2 bg-white rounded-3xl border border-slate-200 shadow-2xl flex items-center gap-4 z-20"
            >
              <img src={selectedImage} alt="Selected" className="w-16 h-16 rounded-xl object-cover" />
              <div className="pr-4">
                <p className="text-xs font-black text-slate-900">Screenshot Ready</p>
                <p className="text-[10px] text-slate-500">AI will analyze for opportunities</p>
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-1.5 rounded-full hover:bg-red-50 text-red-500 absolute -top-2 -right-2 bg-white border border-red-100 shadow-sm"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto flex items-end gap-3 md:gap-4">
          <div className="flex-1 bg-slate-50 rounded-[32px] border border-slate-100 p-2 pl-6 flex items-end shadow-inner focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() || selectedImage) {
                    handleSend();
                  }
                }
              }}
              placeholder="Ask anything or Drop a screenshot... (e.g. Aaj ka trending business idea kya hai?)"
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base py-3 max-h-32 min-h-[44px] resize-none overflow-hidden"
              rows={1}
              maxLength={2000}
            />
            <div className="flex items-center gap-2 pr-2 pb-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-2xl hover:bg-white hover:text-blue-600 text-slate-400 transition-all"
              >
                <Camera className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-2xl hover:bg-white hover:text-blue-600 text-slate-400 transition-all hidden sm:block">
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isTyping}
            className={cn(
              "p-4 rounded-[28px] text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50",
              (input.trim() || selectedImage) ? "bg-blue-600 shadow-blue-200" : "bg-slate-300"
            )}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />
      </div>
    </div>
  );
}
