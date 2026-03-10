'use client';

import { useState } from 'react';
import { addNotifyRequest } from '@/lib/data';

export default function NotifyForm({ paintingId }) {
    const [contact, setContact] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addNotifyRequest({ paintingId, contact });
            setSubmitted(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-green-600 p-4 bg-green-50 text-sm border border-green-100">
                Thanks! We'll notify you if something similar becomes available.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-500">
                Interested in this style? Leave your email or phone, and we'll contact you for commissions.
            </p>
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Email or Phone"
                    required
                    className="flex-1 p-3 border border-gray-200 text-sm focus:outline-none focus:border-gray-400 bg-gray-50"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-gray-900 text-white px-6 py-3 text-sm uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50"
                >
                    {loading ? 'Sending...' : 'Notify Me'}
                </button>
            </div>
        </form>
    );
}
