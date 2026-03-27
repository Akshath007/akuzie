'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';

export default function WorkspaceFormModal({ isOpen, onClose, workspaceToEdit, onSuccess }) {
    const isEditMode = !!workspaceToEdit;
    
    const [formData, setFormData] = useState({
        id: '',
        label: '',
        description: '',
        category: '',
        icon: '📂',
        bgGradient: 'from-gray-500 to-gray-700',
        color: 'gray',
        allowedEmails: [],
        pin: ''
    });
    
    const [emailInput, setEmailInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setFormData({
                    id: workspaceToEdit.id || '',
                    label: workspaceToEdit.label || '',
                    description: workspaceToEdit.description || '',
                    category: workspaceToEdit.category || '',
                    icon: workspaceToEdit.icon || '📂',
                    bgGradient: workspaceToEdit.bgGradient || 'from-gray-500 to-gray-700',
                    color: workspaceToEdit.color || 'gray',
                    allowedEmails: workspaceToEdit.allowedEmails || [],
                    pin: '' // Don't pre-fill PIN on edit
                });
            } else {
                setFormData({
                    id: '',
                    label: '',
                    description: '',
                    category: '',
                    icon: '📂',
                    bgGradient: 'from-gray-500 to-gray-700',
                    color: 'gray',
                    allowedEmails: [],
                    pin: ''
                });
            }
            setError('');
        }
    }, [isOpen, isEditMode, workspaceToEdit]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addEmail = (e) => {
        e.preventDefault();
        const trimmed = emailInput.trim();
        if (!trimmed || !trimmed.includes('@')) return;
        
        if (!formData.allowedEmails.includes(trimmed)) {
            setFormData(prev => ({
                ...prev,
                allowedEmails: [...prev.allowedEmails, trimmed]
            }));
        }
        setEmailInput('');
    };

    const removeEmail = (emailToRemove) => {
        setFormData(prev => ({
            ...prev,
            allowedEmails: prev.allowedEmails.filter(e => e !== emailToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const idToken = await auth.currentUser.getIdToken();
            const method = isEditMode ? 'PATCH' : 'POST';
            
            // In PATCH mode, we send docId. In POST mode, we just send id.
            const payload = isEditMode 
                ? { docId: workspaceToEdit.id, ...formData } 
                : formData;

            const res = await fetch('/api/workspaces', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save workspace');
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div 
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>
            
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Workspace' : 'Create New Workspace'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <form id="workspace-form" onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Workspace ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="id"
                                        value={formData.id}
                                        onChange={handleChange}
                                        disabled={isEditMode}
                                        placeholder="e.g., art-gallery"
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 font-mono"
                                    />
                                    {!isEditMode && <p className="text-xs text-gray-500 mt-1">Unique identifier. Cannot be changed later.</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Label <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="label"
                                        value={formData.label}
                                        onChange={handleChange}
                                        placeholder="Display Name (e.g., Akshath's Art)"
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="e.g., Art, Crochet, Clothes"
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Optional description..."
                                        rows={3}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                                    />
                                </div>
                                
                                {!isEditMode && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Initial PIN <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="pin"
                                            value={formData.pin}
                                            onChange={handleChange}
                                            placeholder="e.g. 1234"
                                            required={!isEditMode}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                            minLength={4}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Users will need this PIN to enter the workspace.</p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Icon (Emoji)
                                        </label>
                                        <input
                                            type="text"
                                            name="icon"
                                            value={formData.icon}
                                            onChange={handleChange}
                                            placeholder="🎨"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xl text-center focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Color Theme
                                        </label>
                                        <select
                                            name="color"
                                            value={formData.color}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                        >
                                            <option value="violet">Violet</option>
                                            <option value="blue">Blue</option>
                                            <option value="emerald">Emerald</option>
                                            <option value="rose">Rose</option>
                                            <option value="amber">Amber</option>
                                            <option value="gray">Gray</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Background Gradient (Tailwind)
                                    </label>
                                    <input
                                        type="text"
                                        name="bgGradient"
                                        value={formData.bgGradient}
                                        onChange={handleChange}
                                        placeholder="from-rose-500 to-orange-400"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                    
                                    {/* Live Preview */}
                                    <div className="mt-2 h-16 rounded-xl flex items-center px-4 shadow-inner overflow-hidden border border-gray-100" 
                                         style={{ backgroundImage: 'linear-gradient(to right, #f3f4f6, #e5e7eb)' }} // Fallback
                                    >
                                        <div className={cn("absolute inset-0 z-0 bg-gradient-to-r opacity-90", formData.bgGradient)}></div>
                                        <div className="relative z-10 flex items-center gap-3 text-white">
                                            <span className="text-2xl drop-shadow-sm">{formData.icon}</span>
                                            <span className="font-bold drop-shadow-sm">{formData.label || 'Preview'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Allowed Emails (Access Control)
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="email"
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addEmail(e);
                                                }
                                            }}
                                            placeholder="seller@example.com"
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={addEmail}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors border border-gray-200"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[80px] flex flex-wrap gap-2">
                                        {formData.allowedEmails.length === 0 ? (
                                            <span className="text-sm text-gray-400 italic py-1">Super Admins only</span>
                                        ) : (
                                            formData.allowedEmails.map(email => (
                                                <div key={email} className="bg-white border border-gray-200 shadow-sm text-gray-700 text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
                                                    {email}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeEmail(email)}
                                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Users with these emails will see this workspace when they log in.</p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        form="workspace-form"
                        type="submit"
                        disabled={loading}
                        className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isEditMode ? 'Save Changes' : 'Create Workspace'}
                    </button>
                </div>
            </div>
        </div>
    );
}
