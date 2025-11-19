// Updated types to match your C# backend models
// Note: For new development, prefer using the OpenAPI-generated types from @/lib/api

export interface IProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  quantityInStock: number;
  sku: string;
  imageUrl: string;
  isActive: boolean;
  status: number;
  category: IProductCategory;
  categoryId: string;
  categoryName: string;
  created: string;
  modified: string;
  createdById: string;
  createdBy: string; // Use OpenAPI types for new development
  modifiedById: string;
  modifiedBy: string; // Use OpenAPI types for new development
}

export interface IProductCategory {
  id: string;
  title: string;
  description: string;
  created: string;
  modified: string;
  createdById: string;
  createdBy: string; // Use OpenAPI types for new development
  modifiedById: string;
  modifiedBy: string; // Use OpenAPI types for new development
  productCount: number;
}
