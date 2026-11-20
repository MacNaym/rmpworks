/** Minimal class-name helper used by the vendored Velora component. */
export function cn(...values: Array<string | false | null | undefined>) { return values.filter(Boolean).join(" "); }
