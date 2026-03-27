'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WorkspaceContext = createContext();

const SESSION_KEY = 'akuzie_workspace_session';

export function WorkspaceProvider({ children }) {
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [sessionToken, setSessionToken] = useState(null);
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        let unsubscribe = null;

        const initialize = async () => {
            try {
                const { auth } = await import('@/lib/firebase');

                // Wait for the first auth state to settle, THEN fetch everything
                await new Promise((resolve) => {
                    unsubscribe = auth.onAuthStateChanged(async (user) => {
                        if (user) {
                            try {
                                const idToken = await user.getIdToken();
                                const res = await fetch('/api/workspaces', {
                                    headers: { 'Authorization': `Bearer ${idToken}` }
                                });
                                if (res.ok) {
                                    const data = await res.json();
                                    if (mounted) setWorkspaces(data.workspaces || []);
                                }
                            } catch (e) {
                                console.error('Error fetching workspaces:', e);
                            }
                        } else {
                            if (mounted) setWorkspaces([]);
                        }
                        resolve(); // Unblock — auth state is now known
                    });
                });

                // Restore Session after we know the auth state
                const stored = localStorage.getItem(SESSION_KEY);
                if (!stored) return;

                const { token, expiresAt } = JSON.parse(stored);

                if (Date.now() > expiresAt) {
                    localStorage.removeItem(SESSION_KEY);
                    return;
                }

                const res = await fetch(`/api/workspaces/verify?token=${token}`);
                const data = await res.json();

                if (mounted && data.valid) {
                    setActiveWorkspace(data.workspace);
                    setSessionToken(token);
                } else if (mounted) {
                    localStorage.removeItem(SESSION_KEY);
                }
            } catch (err) {
                console.error('Session restore error:', err);
                localStorage.removeItem(SESSION_KEY);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initialize();

        return () => {
            mounted = false;
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Verify PIN and enter workspace
    const enterWorkspace = useCallback(async (workspace, pin) => {
        setError(null);

        try {
            const res = await fetch('/api/workspaces/verify', {
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

    // Get current workspace config (from dynamic list)
    const workspaceConfig = activeWorkspace ? workspaces.find(ws => ws.id === activeWorkspace) : null;

    // Refresh workspaces manually (useful after super admin modifying them)
    const refreshWorkspaces = useCallback(async () => {
        try {
            const { auth } = await import('@/lib/firebase');
            if (auth.currentUser) {
                const idToken = await auth.currentUser.getIdToken(true); // Force refresh token to get latest claims if needed, but mostly just standard get
                const res = await fetch('/api/workspaces', {
                    headers: { 'Authorization': `Bearer ${idToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setWorkspaces(data.workspaces || []);
                }
            }
        } catch (e) {
            console.error('Error refreshing workspaces:', e);
        }
    }, []);

    return (
        <WorkspaceContext.Provider value={{
            activeWorkspace,
            workspaceConfig,
            sessionToken,
            workspaces,
            loading,
            error,
            enterWorkspace,
            exitWorkspace,
            switchWorkspace,
            refreshWorkspaces
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
