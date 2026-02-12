'use client';

import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const syncUserToFirestore = async (user) => {
        if (!user) return;
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || '',
                    photoURL: user.photoURL || '',
                    createdAt: serverTimestamp(),
                    lastLoginAt: serverTimestamp(),
                });
            } else {
                await setDoc(userRef, {
                    lastLoginAt: serverTimestamp(),
                    email: user.email, // Keep email updated
                    displayName: user.displayName || userSnap.data().displayName, // Update only if present
                    photoURL: user.photoURL || userSnap.data().photoURL
                }, { merge: true });
            }
        } catch (error) {
            console.error("Error syncing user to Firestore:", error);
        }
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            await syncUserToFirestore(result.user);
            return result;
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await syncUserToFirestore(result.user);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
