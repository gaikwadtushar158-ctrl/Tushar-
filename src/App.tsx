/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import NewsFeed from './components/dashboard/NewsFeed';
import MarketTrends from './components/dashboard/MarketTrends';
import SocialFeed from './components/dashboard/SocialFeed';
import NetworkKing from './components/dashboard/NetworkKing';
import AIChat from './components/dashboard/AIChat';
import Profile from './components/dashboard/Profile';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider } from './contexts/AuthContext';
import { NetworkProvider } from './contexts/NetworkContext';
import { db } from './lib/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <NewsFeed />;
      case 'trends':
        return <MarketTrends />;
      case 'network':
        return <NetworkKing />;
      case 'social':
        return <SocialFeed />;
      case 'aichat':
        return <AIChat />;
      case 'profile':
        return <Profile />;
      default:
        return <NewsFeed />;
    }
  };

  return (
    <AuthProvider>
      <NetworkProvider>
        <div className="flex min-h-screen bg-[#F9FAFB] font-sans selection:bg-blue-100 selection:text-blue-900">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar 
            onMenuClick={() => setIsSidebarOpen(true)} 
            onProfileClick={() => setActiveSection('profile')}
          />
          
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-7xl mx-auto pb-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
      </NetworkProvider>
    </AuthProvider>
  );
}

