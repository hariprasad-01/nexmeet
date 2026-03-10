import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Get user data from our backend
          try {
            const res = await apiRequest("GET", `/api/users/${firebaseUser.uid}`);
            const userData = await res.json();
            setUser(userData as User);
          } catch (err: any) {
            if (err.message.includes("404")) {
              // Create basic user profile in our backend if it doesn't exist
              const newUser: Partial<User> = {
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                firstName: '',
                isVerified: false,
                verificationStatus: 'none',
                premiumTier: 'free',
                interests: [],
              };

              const createRes = await apiRequest("POST", "/api/users", newUser);
              const createdUser = await createRes.json();
              setUser(createdUser as User);
            } else {
              throw err;
            }
          }
        } catch (error: any) {
          console.error('Error fetching user data:', error);
          if (error.code === 'failed-precondition' || error.code === 'unavailable') {
            setError('firebase-setup-required');
          } else {
            setError('Failed to load user data');
          }
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const res = await apiRequest("PUT", `/api/users/${user.id}`, { ...updates });
      const updatedUser = await res.json();
      setUser(updatedUser as User);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  return {
    user,
    firebaseUser,
    loading,
    error,
    signIn,
    signUp,
    logout,
    updateUserProfile,
  };
}
