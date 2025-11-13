/**
 * List of public routes that don't require authentication
 * and should not trigger redirects
 */
export const publicRoutes = [
  '/',
  '/browse',
  '/prompts',
  '/packs',
  '/search',
  '/sign-in',
  '/prompts/[slug]', // Dynamic route pattern
  '/packs/[slug]', // Dynamic route pattern for pack detail pages
] as const;

/**
 * Check if a pathname is a public route
 */
export function isPublicRoute(pathname: string): boolean {
  // Exact match
  if (publicRoutes.includes(pathname as any)) {
    return true;
  }

  // Check for dynamic routes
  if (pathname.startsWith('/prompts/')) {
    return true;
  }

  // Check for pack detail routes
  if (pathname.startsWith('/packs/')) {
    return true;
  }

  return false;
}

