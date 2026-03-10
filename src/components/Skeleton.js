'use client';

import { cn } from "@/lib/utils";

export default function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-100", className)}
            {...props}
        />
    );
}
