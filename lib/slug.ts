/**
 * Converts a certification name into a clean, URL-safe SEO slug.
 * Example: "AWS Solutions Architect Associate (SAA-C03)" -> "aws-solutions-architect-associate"
 */
export function getSlug(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // strip parentheses (e.g. SAA-C03)
    .replace(/[^a-z0-9]+/g, '-')  // replace spaces and non-alphanumerics with hyphens
    .replace(/(^-|-$)/g, '');    // trim leading/trailing hyphens
}
