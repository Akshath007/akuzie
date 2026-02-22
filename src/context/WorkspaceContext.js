'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WorkspaceContext = createContext();

// Workspace definitions — scalable for future additions
export const WORKSPACES = {
    art: {
        id: 'art',
        label: 'Art',
        description: 'Paintings, Sketches & Fine Art',
        icon: '🎨',
        color: 'violet',
        bgGradient: 'from-violet-500 to-purple-600',
        category: 'painting', // maps to Firestore category field
    },
    crochet: {
        id: 'crochet',
        label: 'Crochet',
        description: 'Handmade Crochet Creations',
        icon: '🧶',
        color: 'amber',
        bgGradient: 'from-amber-500 to-orange-600',
        category: 'crochet',
    },
};

const SESSION_KEY = 'akuzie_workspace_session';

export function WorkspaceProvider({ children }) {
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [sessionToken, setSessionToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Restore session from localStorage on mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const stored = localStorage.getItem(SESSION_KEY);
                if (!stored) {
                    setLoading(false);
                    return;
                }

                const { token, workspace, expiresAt } = JSON.parse(stored);

                // Check if session is expired client-side first
                if (Date.now() > expiresAt) {
                    localStorage.removeItem(SESSION_KEY);
                    setLoading(false);
                    return;
                }

                // Validate with server
                const res = await fetch(`/api/workspace/verify?token=${token}`);
                const data = await res.json();

                if (data.valid) {
                    setActiveWorkspace(data.workspace);
                    setSessionToken(token);
                } else {
                    localStorage.removeItem(SESSION_KEY);
                }
            } catch (err) {
                console.error('Session restore error:', err);
                localStorage.removeItem(SESSION_KEY);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    // Verify PIN and enter workspace
    const enterWorkspace = useCallback(async (workspace, pin) => {
        setError(null);

        try {
            const res = await fetch('/api/workspace/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspace, pin }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Verification failed.');
                return { success: false, error: data.error, locked: data.locked, remainingAttempts: data.remainingAttempts };
            }

            // Save session
            const session = {
                token: data.token,
                workspace: data.workspace,
                expiresAt: data.expiresAt,
            };

            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            setSessionToken(data.token);
            setActiveWorkspace(data.workspace);

            return { success: true };
        } catch (err) {
            const errorMsg = 'Network error. Please try again.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    }, []);

    // Exit workspace (go back to selector)
    const exitWorkspace = useCallback(() => {
        setActiveWorkspace(null);
        setSessionToken(null);
        localStorage.removeItem(SESSION_KEY);
    }, []);

    // Switch to a different workspace (requires re-authentication)
    const switchWorkspace = useCallback(() => {
        exitWorkspace();
    }, [exitWorkspace]);

    // Get current workspace config
    const workspaceConfig = activeWorkspace ? WORKSPACES[activeWorkspace] : null;

    return (
        <WorkspaceContext.Provider value={{
            activeWorkspace,
            workspaceConfig,
            sessionToken,
            loading,
            error,
            enterWorkspace,
            exitWorkspace,
            switchWorkspace,
            WORKSPACES,
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
}
