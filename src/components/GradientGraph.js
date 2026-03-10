'use client';

import { useMemo } from 'react';

export default function GradientGraph({ data, color = "violet", height = 60 }) {
    // Data should be an array of numbers, e.g., [10, 25, 15, 40, ...]

    const points = useMemo(() => {
        if (!data || data.length === 0) return "";

        // Normalize data to fit in viewBox 0 0 100 100
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;

        // Generate simplified path points
        // X is distributed evenly from 0 to 100
        // Y is inverted (SVG 0 is top) so 100 - normalizedValue
        return data.map((val, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((val - min) / range) * 80; // keep some padding at bottom
            return `${x},${y}`;
        }).join(" ");
    }, [data]);

    const pathD = useMemo(() => {
        if (!points) return "";

        // Create a smooth curve (catmull-rom or simple bezier approximation could be complex)
        // For "GenZ" vibe, a jagged or slightly smoothed polyline is fine, but let's try a simple area fill
        // We'll use a simple polygon for the fill and polyline for stroke
        return points;
    }, [points]);

    // Gradient definitions based on color prop
    const gradients = {
        violet: { from: "#8b5cf6", to: "#c4b5fd" },
        blue: { from: "#3b82f6", to: "#93c5fd" },
        amber: { from: "#f59e0b", to: "#fcd34d" },
        emerald: { from: "#10b981", to: "#6ee7b7" },
        pink: { from: "#ec4899", to: "#fbcfe8" },
    };

    const currentGradient = gradients[color] || gradients.violet;

    return (
        <div className="w-full relative overflow-hidden" style={{ height: `${height}px` }}>
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
            >
                <defs>
                    <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={currentGradient.from} stopOpacity="0.5" />
                        <stop offset="100%" stopColor={currentGradient.to} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Fill Area */}
                <polygon
                    points={`0,100 ${points} 100,100`}
                    fill={`url(#grad-${color})`}
                />

                {/* Stroke Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke={currentGradient.from}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                />

                {/* Interaction Points (CSS hover) */}
                {data.map((val, i) => (
                    <circle
                        key={i}
                        cx={(i / (data.length - 1)) * 100}
                        cy={100 - ((val - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * 80}
                        r="2"
                        fill="white"
                        stroke={currentGradient.from}
                        strokeWidth="1"
                        className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer duration-300"
                    />
                ))}
            </svg>
        </div>
    );
}
