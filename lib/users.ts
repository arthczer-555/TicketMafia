// Plain constants safe to import from both server and client code.
export const APP_USERS = ["gaspard", "arthur"] as const;
export type AppUser = (typeof APP_USERS)[number];

export function isAppUser(value: unknown): value is AppUser {
  return typeof value === "string" && (APP_USERS as readonly string[]).includes(value);
}
