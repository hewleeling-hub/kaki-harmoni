/**
 * Reading intake fields out of a submitted form.
 *
 * Shared by saving a new form (POST /api/intake) and correcting a filed one
 * (PATCH /api/intake/[id]), so the two can never accept different things. Every
 * value that has a fixed list is checked against it: the request cannot invent
 * an oil the shop doesn't stock or a health answer that isn't on the sheet.
 */

export const MAX_TEXT = 2000;

export const clean = (value: FormDataEntryValue | null, max = MAX_TEXT): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
};

/** Only ever a value from the known list, never what the request asked for. */
export const one = (value: FormDataEntryValue | null, allowed: readonly string[]): string | null => {
  const v = clean(value, 60);
  return v && allowed.includes(v) ? v : null;
};

export const many = (values: FormDataEntryValue[], allowed: readonly string[]): string[] =>
  allowed.filter((option) => values.includes(option));
