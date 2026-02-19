'use client';

import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { sendEmail, templates } from '@/lib/email';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch extra user data from Firestore (specifically status)
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    if (data.status === 'blocked') {
                        await signOut(auth);
                        setUser(null);
                        setUserData(null);
                        alert("Your account has been blocked. Please contact support.");
                        setLoading(false);
                        return;
                    }
                    setUserData(data);
                }
                setUser(user);
            } else {
                setUser(null);
                setUserData(null);
            }
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

                // Trigger Welcome Email
                sendEmail({
                    to: user.email,
                    subject: "Welcome to Akuzie!",
                    html: templates.welcome(user.displayName)
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

    const isAdmin = user?.email === 'akshathhp123@gmail.com' || user?.email === 'akuzie27@gmail.com';

    return (
        <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
