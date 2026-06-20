import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatPHP = (amount) => {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};