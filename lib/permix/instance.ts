import type { PermixDefinition } from 'permix';
import { createPermix } from 'permix';

// Define data types for resources (if needed for conditional permissions)
interface Dashboard {
  id: string;
  userId?: string;
}

interface Analytics {
  id: string;
  userId?: string;
}

interface Project {
  id: string;
  userId?: string;
  authorId?: string;
}

interface Product {
  id: string;
  userId?: string;
}

interface Order {
  id: string;
  userId?: string;
  authorId?: string;
}

interface Invoice {
  id: string;
  userId?: string;
  authorId?: string;
}

interface Setting {
  id: string;
  key: string;
}

interface User {
  id: string;
  role?: string;
}

interface Session {
  id: string;
  userId: string;
}

// Create Permix definition based on current permission structure
type PermissionsDefinition = PermixDefinition<{
  dashboard: {
    dataType: Dashboard;
    action: 'view';
  };
  analytics: {
    dataType: Analytics;
    action: 'view' | 'export';
  };
  projects: {
    dataType: Project;
    action: 'create' | 'view' | 'update' | 'delete';
  };
  products: {
    dataType: Product;
    action: 'create' | 'view' | 'update' | 'delete';
  };
  orders: {
    dataType: Order;
    action: 'create' | 'view' | 'update' | 'delete';
  };
  invoices: {
    dataType: Invoice;
    action: 'create' | 'view' | 'update' | 'delete';
  };
  settings: {
    dataType: Setting;
    action: 'view' | 'update';
  };
  user: {
    dataType: User;
    action: 'create' | 'view' | 'update' | 'delete';
  };
  session: {
    dataType: Session;
    action: 'view' | 'delete';
  };
}>;

// Create Permix instance
export const permix = createPermix<PermissionsDefinition>();

// Export types for use in other files
export type { PermissionsDefinition };
export type {
  Dashboard,
  Analytics,
  Project,
  Product,
  Order,
  Invoice,
  Setting,
  User,
  Session,
};
