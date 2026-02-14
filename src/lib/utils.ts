import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS classes using clsx and tailwind-merge.
 * This handles conditional classes and ensures no style conflicts.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
