'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Accordion({ title, children, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-stone-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4 text-left group"
            >
                <span className="text-sm font-medium font-serif text-gray-900 group-hover:text-stone-600 transition-colors uppercase tracking-widest">{title}</span>
                <span className="text-stone-400 group-hover:text-stone-600 transition-colors">
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </span>
            </button>
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-[500px] opacity-100 pb-6" : "max-h-0 opacity-0"
                )}
            >
                <div className="text-sm font-light text-stone-600 leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
}
