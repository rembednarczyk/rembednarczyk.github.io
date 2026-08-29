/**
 * Pure domain helpers, callable without React.
 *
 * `formatProjectTags` used to live here, joining tags with a separator. It
 * had no caller: every surface that shows tags renders them as individual
 * elements rather than one string, and the print CV does not show them at
 * all. It was deleted rather than kept waiting for a use that the design
 * does not want.
 */

export function getYearsOfExperience(startDate: Date): number {
  const diff = Date.now() - startDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
