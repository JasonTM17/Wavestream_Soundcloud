export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const createUniqueSlug = (value: string) => {
  const base = slugify(value);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || 'item'}-${suffix}`;
};
