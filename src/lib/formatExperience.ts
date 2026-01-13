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
