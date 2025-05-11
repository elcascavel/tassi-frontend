import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusVariant(
  statusName: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (statusName.toLowerCase()) {
    case 'online':
      return 'default';
    case 'offline':
      return 'secondary';
    case 'blocked':
      return 'destructive';
    default:
      return 'outline';
  }
}
