import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

interface UserProfile {
  displayName: string;
  handle: string;
  photoURL: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      setLoading(false); // Move this up to unblock the UI as soon as auth state is known
      
      if (authUser) {
        try {
          // Ensure user document exists
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName || 'Anonymous',
              handle: authUser.email?.split('@')[0] || 'user',
              photoURL: authUser.photoURL || '',
              createdAt: new Date().toISOString()
            });
          }

          // Listen for profile changes
          unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              setProfile(doc.data() as UserProfile);
            }
          }, (error) => {
            console.error("Profile snapshot error:", error);
          });
        } catch (err) {
          console.error("Firestore profile fetch error:", err);
        }
      } else {
        setProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
