import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

/**
 * Define custom resources and permissions for RBAC
 * Make sure to use `as const` so TypeScript can infer the type correctly
 */
export const statement = {
  ...defaultStatements, // Include default admin plugin permissions (user, session)
  dashboard: ['view'],
  analytics: ['view', 'export'],
  projects: ['create', 'view', 'update', 'delete'],
  products: ['create', 'view', 'update', 'delete'],
  orders: ['create', 'view', 'update', 'delete'],
  invoices: ['create', 'view', 'update', 'delete'],
  settings: ['view', 'update'],
} as const;

/**
 * Create the access controller with our permission statement
 */
export const ac = createAccessControl(statement);

/**
 * Define the admin role with full permissions
 */
export const adminRole = ac.newRole({
  ...adminAc.statements, // Include all default admin permissions
  dashboard: ['view'],
  analytics: ['view', 'export'],
  projects: ['create', 'view', 'update', 'delete'],
  products: ['create', 'view', 'update', 'delete'],
  orders: ['create', 'view', 'update', 'delete'],
  invoices: ['create', 'view', 'update', 'delete'],
  settings: ['view', 'update'],
});

/**
 * Define the user role with basic permissions
 */
export const userRole = ac.newRole({
  dashboard: ['view'],
  projects: ['view'],
  products: ['view'],
  orders: ['view'],
  invoices: ['view'],
});

/**
 * Define the manager role with intermediate permissions
 */
export const managerRole = ac.newRole({
  dashboard: ['view'],
  analytics: ['view', 'export'],
  projects: ['create', 'view', 'update', 'delete'],
  products: ['create', 'view', 'update', 'delete'],
  orders: ['create', 'view', 'update'],
  invoices: ['create', 'view', 'update'],
  settings: ['view'],
});

/**
 * Export roles object for Better Auth configuration
 */
export const roles = {
  admin: adminRole,
  user: userRole,
  manager: managerRole,
};
