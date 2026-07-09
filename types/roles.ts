/**
 * Role model for future multi-user support.
 *
 * Phase 1–3: Only `owner` is active. All authenticated users have full access via RLS.
 *
 * Where to extend later:
 * - Supabase: add `role` column to `profiles` table and tighten RLS per role.
 * - App: gate navigation/actions in `lib/auth/permissions.ts` using these roles.
 * - API/RPC: enforce role checks inside PostgreSQL functions for transfers and deletes.
 */
export const USER_ROLES = ['owner', 'manager', 'staff', 'viewer'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type Permission =
  | 'products:read'
  | 'products:write'
  | 'inventory:adjust'
  | 'inventory:transfer'
  | 'locations:manage'
  | 'categories:manage'
  | 'import:csv'
  | 'export:csv'
  | 'reports:view'
  | 'audit:view';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    'products:read',
    'products:write',
    'inventory:adjust',
    'inventory:transfer',
    'locations:manage',
    'categories:manage',
    'import:csv',
    'export:csv',
    'reports:view',
    'audit:view',
  ],
  manager: [
    'products:read',
    'products:write',
    'inventory:adjust',
    'inventory:transfer',
    'locations:manage',
    'categories:manage',
    'import:csv',
    'export:csv',
    'reports:view',
    'audit:view',
  ],
  staff: [
    'products:read',
    'inventory:adjust',
    'inventory:transfer',
    'reports:view',
    'audit:view',
  ],
  viewer: ['products:read', 'reports:view', 'audit:view'],
};
