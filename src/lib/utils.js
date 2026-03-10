import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
}

export const PAINTING_STATUS = {
    AVAILABLE: 'available',
    SOLD: 'sold',
};

export const ORDER_STATUS = {
    PAYMENT_PENDING: 'payment_pending',
    PAID: 'paid',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};
