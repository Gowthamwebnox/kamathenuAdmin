"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch";
// import { Badge } from "@/components/ui/badge";
import { DataTable } from "../../../../components/common/Table";
import { toast } from "sonner";
import { Category as CategoryType } from "../../../../types/category";   
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Category as CategoryApis } from "../../../../Api/category"
import { Skeleton } from "@/components/ui/skeleton";
import { S3Storage } from "@/lib/s3";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axiosInstance from "@/app/utils/axiosInstance";

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Table Skeleton */}
      <div className="rounded-md border">
        <div className="border-b">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-end space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[100px]" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

// Add a helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Add a helper function to handle file upload
const uploadImageToS3 = async (file: File): Promise<string> => {
  const s3 = new S3Storage("categories");
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name}`;
  
  return await s3.uploadFile({
    file: fileBuffer,
    fileName,
    contentType: file.type,
  });
};

export default function CategoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories using TanStack Query
  const {
    data: categories = [],
    isLoading,
    isError,
    isFetching,
  } = useQuery<CategoryType[]>({
    queryKey: ["categories"],
    queryFn: CategoryApis.getCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for updating category status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      try {
        // TODO: Replace with actual API call
        // return await CategoryApis.updateCategoryStatus(id, featured)
        return Promise.resolve({ id, featured });
      } catch (error) {
        console.error("Error updating category status:", error);
        throw error;
      }
    },
    onMutate: async ({ id, featured }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      // Snapshot the previous value
      const previousCategories = queryClient.getQueryData<CategoryType[]>([
        "categories",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<CategoryType[]>(
        ["categories"],
        (old) =>
          old?.map((category) =>
            category.id === id ? { ...category, featured } : category
          ) || []
      );

      return { previousCategories };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(["categories"], context.previousCategories);
      }
      toast.error("Error", {
        description: "Failed to update category status",
      });
    },
    onSuccess: (data, variables) => {
      toast.success(
        variables.featured ? "Category Published" : "Category Unpublished",
        {
          description: `Category is now ${
            variables.featured ? "published" : "unpublished"
          }`,
        }
      );
    },
    onSettled: () => {
      // Refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // Mutation for deleting a category
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        // TODO: Replace with actual API call
        // return await CategoryApis.deleteCategory(id)
        return Promise.resolve(id);
      } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previousCategories = queryClient.getQueryData<CategoryType[]>([
        "categories",
      ]);

      queryClient.setQueryData<CategoryType[]>(
        ["categories"],
        (old) => old?.filter((category) => category.id !== id) || []
      );

      return { previousCategories };
    },
    onError: (err, variables, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(["categories"], context.previousCategories);
      }
      toast.error("Error", {
        description: "Failed to delete category",
      });
    },
    onSuccess: (data, variables) => {
      toast.success("Category Deleted", {
        description: "The category has been successfully deleted",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // Mutation for adding a new category
  const addCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string; description: string; imageUrl: string }) => {
      try {
        return await CategoryApis.createCategory(categoryData);
      } catch (error) {
        console.error("Error adding category:", error);
        throw error;
      }
    },
    onMutate: async (categoryData) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previousCategories = queryClient.getQueryData<CategoryType[]>(["categories"]);

      const newCategoryItem = {
        id: `new-${Date.now()}`,
        name: categoryData.name,
        description: categoryData.description,
        imageUrl: categoryData.imageUrl,
        featured: false,
        parentCategoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData<CategoryType[]>(["categories"], (old) =>
        old ? [...old, newCategoryItem] : [newCategoryItem]
      );

      return { previousCategories };
    },
    onError: (err, variables, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(["categories"], context.previousCategories);
      }
      toast.error("Error", {
        description: "Failed to add new category",
      });
    },
    onSuccess: (data) => {
      toast.success("Category Added", {
        description: "New category has been successfully added",
      });
      setNewCategory({ name: "", description: "", imageUrl: "" });
      setIsAddDialogOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // Mutation for updating a category
  const updateCategoryMutation = useMutation({
    mutationFn: async (categoryData: { 
      id: string;
      name: string;
      description?: string;
      imageUrl?: string;
    }) => {
      try {
        return await CategoryApis.updateCategory(categoryData);
      } catch (error) {
        console.error("Error updating category:", error);
        throw error;
      }
    },
    onMutate: async (updatedCategory) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previousCategories = queryClient.getQueryData<CategoryType[]>(["categories"]);

      queryClient.setQueryData<CategoryType[]>(["categories"], (old) =>
        old?.map((category) =>
          category.id === updatedCategory.id ? { ...category, ...updatedCategory } : category
        ) || []
      );

      return { previousCategories };
    },
    onError: (err, variables, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(["categories"], context.previousCategories);
      }
      toast.error("Error", {
        description: "Failed to update category",
      });
    },
    onSuccess: () => {
      toast.success("Category Updated", {
        description: "The category has been successfully updated",
      });
      setIsEditDialogOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const handlePageChange = (page: number) => {
    setPageIndex(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(0);
  };

  const handlePublishChange = (categoryId: string, isPublished: boolean) => {
    updateStatusMutation.mutate({ id: categoryId, featured: isPublished });
  };

  const handleViewCategory = (category: CategoryType) => {
    toast.info("View Category", {
      description: `Viewing ${category.name}`,
    });
    // router.push(`/admin/categories/${category.id}`)
  };

  const handleEditCategory = (category: CategoryType) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedCategory) return;

    try {
      await updateCategoryMutation.mutateAsync({
        id: selectedCategory.id,
        name: selectedCategory.name,
        description: selectedCategory.description,
        imageUrl: selectedCategory.imageUrl,
      });
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDeleteCategory = async (category: CategoryType) => {
    if (window.confirm(`Are you sure you want to delete ${category.name}?`)) {
      // deleteMutation.mutate(category.id);
      const response =await axiosInstance.delete(`/admin/deleteCategory/${category.id}`)
      toast.success("Category Deleted");
      window.location.reload()
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()||!newCategory.imageUrl) {
      toast.error("Fill all the required fields like image and name");
      return;
    }

    addCategoryMutation.mutate({
      name: newCategory.name,
      description: newCategory.description,
      imageUrl: newCategory.imageUrl,
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
    setPageIndex(0); // Reset to first page when searching
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm)
  );

  // Get paginated data
  const getPaginatedData = () => {
    const filteredData = categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm)
    );

    const start = pageIndex * pageSize;
    const end = start + pageSize;

    return {
      data: filteredData.slice(start, end),
      totalCount: filteredData.length,
    };
  };

  const paginatedData = getPaginatedData();

  // Add handleImageUpload function
  const handleImageUpload = async (file: File, isEdit: boolean = false) => {
    try {
      setIsUploading(true);
      const imageUrl = await uploadImageToS3(file);
      
      if (isEdit && selectedCategory) {
        setSelectedCategory({
          ...selectedCategory,
          imageUrl,
        });
      } else {
        setNewCategory({
          ...newCategory,
          imageUrl,
        });
      }
      
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const columns: ColumnDef<CategoryType>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: () => <h5>Category</h5>,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.original.imageUrl} alt={row.original.name} />
            <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
          </Avatar>
          <div className="font-medium">{row.original.name}</div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: () => <h5>Description</h5>,
      cell: ({ row }) => <div>{row.original.description || "-"}</div>,
    },

    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex justify-end items-center">
            {/* <Switch
              checked={category.featured}
              onCheckedChange={(checked) =>
                handlePublishChange(category.id, checked)
              }
              className="mr-2"
              disabled={
                updateStatusMutation.isPending &&
                updateStatusMutation.variables?.id === category.id
              }
            /> */}
            <div className="flex justify-end items-center gap-2">
              {/* View button commented out */}
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditCategory(category)}
                className="h-8 w-8"
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button> */}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditCategory(category)}
                className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteCategory(category)}
                disabled={deleteMutation.isPending && deleteMutation.variables === category.id}
                className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        );
      },
    },
  ];

  if (isError) {
    return (
      <div className="p-8 text-red-500 flex flex-col items-center justify-center">
        <p className="text-lg font-semibold">Error loading categories</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["categories"] })
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="font-bold text-xl">
          All Categories ({filteredCategories.length})
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search Categories"
              className="pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleSearch}
              value={searchTerm}
            />
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
                <Plus size={16} />
                Add New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Enter the details for the new category below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Image Upload Section */}
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={newCategory?.imageUrl} alt="Category" />
                    <AvatarFallback>
                      <ImageIcon className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? "Uploading..." : "Upload Image"}
                    </Button>
                    {newCategory.imageUrl && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setNewCategory({ ...newCategory, imageUrl: "" })}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                {/* Existing form fields */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Category Name"
                    className="col-span-3"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Category description"
                    className="col-span-3"
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewCategory({ name: "", description: "", imageUrl: "" });
                    setIsAddDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-500"
                  onClick={handleAddCategory}
                  disabled={addCategoryMutation.isPending}
                >
                  {addCategoryMutation.isPending ? "Adding..." : "Add Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading || isFetching ? (
        <TableSkeleton />
      ) : paginatedData.data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? (
            <p>No categories matching "{searchTerm}" found.</p>
          ) : (
            <p>No categories available. Add your first category!</p>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={paginatedData.data}
          totalCount={paginatedData.totalCount}
          pageSize={pageSize}
          pageIndex={pageIndex}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the details for this category below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Image Upload Section */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={selectedCategory?.imageUrl} alt="Category" />
                <AvatarFallback>
                  {selectedCategory?.name ? getInitials(selectedCategory.name) : <ImageIcon className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={editFileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file, true);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editFileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Image"}
                </Button>
                {selectedCategory?.imageUrl && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setSelectedCategory(prev => prev ? { ...prev, imageUrl: "" } : null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* Existing form fields */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                placeholder="Category Name"
                className="col-span-3"
                value={selectedCategory?.name || ""}
                onChange={(e) =>
                  setSelectedCategory((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Category description"
                className="col-span-3"
                value={selectedCategory?.description || ""}
                onChange={(e) =>
                  setSelectedCategory((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-500"
              onClick={handleSaveEdit}
              disabled={updateCategoryMutation.isPending}
            >
              {updateCategoryMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
