'use client';

import { Share2 } from 'lucide-react';

export default function ShareButton({ title, text, url }) {
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title || 'Check this out!',
                    text: text || 'Look at this artwork on Akuzie!',
                    url: url || window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(url || window.location.href);
                alert('Link copied to clipboard!');
            } catch (err) {
                console.log('Failed to copy', err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center justify-center p-4 border border-stone-200 rounded-none text-stone-900 hover:bg-stone-50 transition-colors w-full md:w-auto md:min-w-[60px]"
            title="Share this artwork"
        >
            <Share2 size={20} />
        </button>
    );
}
