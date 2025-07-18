export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  featured?: boolean;
  parentCategory?: Category | null;
  subCategories?: Category[];
}
