/**
 * Create empty permissions object for Permix setup
 */
export function createEmptyPermissions() {
  return {
    dashboard: { view: false },
    analytics: { view: false, export: false },
    projects: { create: false, view: false, update: false, delete: false },
    products: { create: false, view: false, update: false, delete: false },
    orders: { create: false, view: false, update: false, delete: false },
    invoices: { create: false, view: false, update: false, delete: false },
    settings: { view: false, update: false },
    user: { create: false, view: false, update: false, delete: false },
    session: { view: false, delete: false },
  };
}
