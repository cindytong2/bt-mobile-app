/**
 * List of email addresses that have admin access to the QR scanner
 * These emails will be redirected to the QR scanner on login and can access scanner features
 */
export const ADMIN_EMAILS = [
  'admin@businesstoday.org',
  'sr8277@princeton.edu',
  'as3115@princeton.edu',
  'ar9215@princeton.edu',
  'el2255@princeton.edu',
  'ey7643@princeton.edu',
  'iy3873@princeton.edu',
  'jb1516@princeton.edu',
  'lk8875@princeton.edu',
  'lt1200@princeton.edu',
  'ma2740@princeton.edu',
  'sk0546@princeton.edu',
  'sz6755@princeton.edu',
  'wl5145@princeton.edu',
  'ay4616@princeton.edu',
  'al7535@princeton.edu',
] as const;

/**
 * Check if an email has admin access (case-insensitive)
 * @param email - Email address to check
 * @returns true if the email is in the admin list
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalizedEmail);
}

