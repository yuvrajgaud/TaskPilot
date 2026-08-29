/** Joins class names, dropping falsy values. Keeps conditional styling readable. */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
