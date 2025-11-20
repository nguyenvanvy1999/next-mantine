import type { User } from './instance';
import { permix } from './instance';

/**
 * Admin role template - Full access to all resources
 */
export const adminTemplate = permix.template(() => ({
  dashboard: {
    view: true,
  },
  analytics: {
    view: true,
    export: true,
  },
  projects: {
    create: true,
    view: true,
    update: true,
    delete: true,
  },
  products: {
    create: true,
    view: true,
    update: true,
    delete: true,
  },
  orders: {
    create: true,
    view: true,
    update: true,
    delete: true,
  },
  invoices: {
    create: true,
    view: true,
    update: true,
    delete: true,
  },
  settings: {
    view: true,
    update: true,
  },
  user: {
    create: true,
    view: true,
    update: true,
    delete: true,
  },
  session: {
    view: true,
    delete: true,
  },
}));

/**
 * Manager role template - Can manage projects, products, orders, invoices but not users
 */
export const managerTemplate = permix.template(() => ({
  dashboard: {
    view: true,
  },
  analytics: {
    view: true,
    export: true,
  },
  projects: {
    create: true,
    view: true,
    update: true,
    delete: true,
  },
  products: {
    create: true,
    view: true,
    update: true,
    delete: true,
  },
  orders: {
    create: true,
    view: true,
    update: true,
    delete: false, // Managers can't delete orders
  },
  invoices: {
    create: true,
    view: true,
    update: true,
    delete: false, // Managers can't delete invoices
  },
  settings: {
    view: true,
    update: false, // Managers can view but not update settings
  },
  user: {
    create: false,
    view: false,
    update: false,
    delete: false,
  },
  session: {
    view: false,
    delete: false,
  },
}));

/**
 * User role template - Read-only access to most resources
 */
export const userTemplate = permix.template(({ id: userId }: User) => ({
  dashboard: {
    view: true,
  },
  analytics: {
    view: false,
    export: false,
  },
  projects: {
    create: false,
    view: true,
    update: false,
    delete: false,
  },
  products: {
    create: false,
    view: true,
    update: false,
    delete: false,
  },
  orders: {
    create: false,
    view: true,
    update: false,
    delete: false,
  },
  invoices: {
    create: false,
    view: true,
    update: false,
    delete: false,
  },
  settings: {
    view: false,
    update: false,
  },
  user: {
    create: false,
    view: false,
    update: false,
    delete: false,
  },
  session: {
    view: false,
    delete: false,
  },
}));

/**
 * Get permission template based on role
 */
export function getTemplateByRole(role: string, user?: User) {
  switch (role.toLowerCase()) {
    case 'admin':
      return adminTemplate();
    case 'manager':
      return managerTemplate();
    default:
      return userTemplate(user || { id: '' });
  }
}
