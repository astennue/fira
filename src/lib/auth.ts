import { NextRequest, NextResponse } from 'next/server'

export type ApiRole = 'super_admin' | 'staff' | 'applicant' | 'local_agency' | 'international_agency' | 'employer'

export interface AuthResult {
  userId: string
  userRole: ApiRole
}

/**
 * Extract userId and userRole from request headers.
 * All authenticated API routes must call this first.
 * Returns null if not authenticated.
 */
export function getAuth(request: NextRequest): AuthResult | null {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role') as ApiRole | null
  if (!userId || !userRole) return null
  return { userId, userRole }
}

/**
 * Require authentication. Returns 401 if not authenticated.
 */
export function requireAuth(request: NextRequest): AuthResult | NextResponse {
  const auth = getAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  return auth
}

/**
 * Check if the authenticated user has one of the allowed roles.
 * Returns the auth result if allowed, or a 403 response.
 */
export function requireRole(request: NextRequest, allowedRoles: ApiRole[]): AuthResult | NextResponse {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (!allowedRoles.includes(auth.userRole)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }
  return auth
}

/**
 * Check if user is FIRA staff (super_admin, staff, or international_agency).
 */
export function requireFira(request: NextRequest): AuthResult | NextResponse {
  return requireRole(request, ['super_admin', 'staff', 'international_agency'])
}

/**
 * Check if user can access FIRA-only or agency-shared resources.
 */
export function requireFiraOrAgency(request: NextRequest): AuthResult | NextResponse {
  return requireRole(request, ['super_admin', 'staff', 'international_agency', 'local_agency'])
}

/**
 * Check if user is an employer.
 */
export function requireEmployer(request: NextRequest): AuthResult | NextResponse {
  return requireRole(request, ['employer'])
}

/**
 * Check if user is an applicant.
 */
export function requireApplicant(request: NextRequest): AuthResult | NextResponse {
  return requireRole(request, ['applicant'])
}

/**
 * Check if user can access CMS admin features (super_admin or staff only).
 */
export function requireCmsAdmin(request: NextRequest): AuthResult | NextResponse {
  return requireRole(request, ['super_admin', 'staff'])
}

/**
 * Check if user can view internal job listings (FIRA + local_agency + employer).
 */
export function requireJobViewer(request: NextRequest): AuthResult | NextResponse {
  return requireRole(request, ['super_admin', 'staff', 'international_agency', 'local_agency', 'employer'])
}