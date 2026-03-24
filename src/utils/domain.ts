export function getYearsOfExperience(startDate: Date): number {
  const diff = Date.now() - startDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function formatProjectTags(tags: string[]): string {
  return tags.join(" • ");
}
