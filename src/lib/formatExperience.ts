/**
 * Format years of experience, capping at 20+ for values over 20
 */
export const formatExperience = (years: number | null | undefined, suffix: string = "ans"): string => {
  if (!years || years <= 0) return "";
  
  if (years > 20) {
    return `+20 ${suffix}`;
  }
  
  return `${years} ${suffix}`;
};

/**
 * Format years of experience with proper French pluralization
 */
export const formatExperienceFr = (years: number | null | undefined): string => {
  if (!years || years <= 0) return "-";
  
  if (years > 20) {
    return "+20 ans";
  }
  
  return `${years} an${years > 1 ? "s" : ""}`;
};

/**
 * Calculate total experience from an array, capping each individual at 20
 */
export const calculateTotalExperience = (items: { years_experience?: number | null }[]): number => {
  return items.reduce((acc, item) => {
    const exp = item.years_experience || 0;
    return acc + Math.min(exp, 20);
  }, 0);
};

/**
 * Format total experience for display (with + suffix)
 */
export const formatTotalExperience = (items: { years_experience?: number | null }[]): string => {
  const total = calculateTotalExperience(items);
  return `${total}+`;
};
