"use client";

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    category: string;
    imageUrl?: string;
    isPublished: boolean;
    createdAt: string;
  }

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import { clsx } from "clsx"
import {
  MoreHorizontal,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  List,
  LayoutGrid,
  Filter,
  Search,
  X,
} from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  ProductFilterTabs,
  ProductGrid,
} from "@/components/common/Table";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Product as ProductApis } from "@/Api/product";
import { Category as CategoryApis } from "@/Api/category";
import { Skeleton } from "@/components/ui/skeleton";
// import { useSession } from "next-auth/react";
import axiosInstance from "@/app/utils/axiosInstance";






function TableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <div className="border-b">
          <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-7 gap-4 p-4">
              {[...Array(7)].map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-full" />
              ))}
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

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
//   const { data: session } = useSession();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debounceSearchQuery, setdebounceSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sellerFilter, setSellerFilter] = useState<"all" | "inHouse" | "others">("all");
  const [tempSelectedCategories, setTempSelectedCategories] = useState<
    string[]
  >([]);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([
    0, 1000,
  ]);
  const [tempActiveFilter, setTempActiveFilter] = useState<string>("all");

  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize temp filters with current filter values
    setTempSelectedCategories(selectedCategories);
    setTempPriceRange(priceRange);
    setTempActiveFilter(activeFilter);
    
  }, [isFilterOpen]);
  console.log("selectedCategories",selectedCategories);
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: [
      "getAllProducts",
      debounceSearchQuery,
      pageSize,
      pageIndex,
      selectedCategories,
      priceRange,
      activeFilter,
      sellerFilter,
    ],
    queryFn: async () => {
      // Map filter tabs to isApproved parameter
      let isApprovedParam;

      if (activeFilter === "approved") {
        isApprovedParam = true;
      } else if (activeFilter === "pending") {
        isApprovedParam = false;
      } else {
        // for "all" tab, don't send the isApproved parameter
        isApprovedParam = undefined;
      }

      try {
        const response = await ProductApis.getProducts({
          search: debounceSearchQuery,
          limit: pageSize,
          offset: pageIndex * pageSize,
          categoryId:
            selectedCategories.length > 0
              ? selectedCategories.join(",")
              : undefined,
          fromPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
          toPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
          isApproved: isApprovedParam,
          sellerType: sellerFilter === "all" ? undefined : sellerFilter,
        });
        console.log("response",response);
        if (response.status === 400) {
          return { products: [], count: { total: 0 } };
        }
        return response.data;
      } catch (error) {
        return { products: [], count: { total: 0 } };
      }
    },
  });
console.log("data",data);
  const approveMutation = useMutation({
    mutationFn: async ({
      id,
      isApproved,
    }: {
      id: string;
      isApproved: boolean;
    }) => {
      return ProductApis.approveProduct({ id, isApproved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllProducts"] });
      toast.success("Product approval status updated");
    },
    onError: () => {
      toast.error("Failed to update product approval status");
    },
  });
  useEffect(() => {
    const timeoutid = setTimeout(() => {
      setdebounceSearchQuery(searchQuery);
    }, 400);

    return () => {
      clearTimeout(timeoutid);
    };
  }, [searchQuery]);



  
  const filterTabs = [
    { id: "all", label: "All" },
    { id: "approved", label: "Approved" },
    { id: "pending", label: "Pending Approval" },
  ];

  const handleFilterChange = (tabId: string) => {
    setActiveFilter(tabId);
    setTempActiveFilter(tabId);
    // Reset to first page when changing filter
    setPageIndex(0);
  };

  const handleViewProduct = (product: Product) => {
    toast.info("View Product", {
      description: `Viewing ${product.name}`,
    });
    router.push(`/products/${product.id}/edit`)
  };

  const handleEditProduct = (product: Product) => {
    toast.info("Edit Product", {
      description: `Editing ${product.name}`,
    });
    //  router.push(`/admin/products/${product.id}/edit`)
    router.push(`products/${product.id}/edit`);
  };

  const handleDeleteProduct = (product: Product) => {
    toast.error("Delete Product", {
      description: `${product.name} has been marked for deletion`,
    });
  };

  const handleApprovalChange = (product: Product, isApproved: boolean) => {
    // approveMutation.mutate({ id: product.id, isApproved });
  };

  const handlePageChange = (page: number) => {
    setPageIndex(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(0);
  };

  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoryApis.getCategories(),
    onError: (error) => {
      console.error("Error fetching categories:", error);
    },
  });

  const columns: ColumnDef<Product>[] = [
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
    // {
    //   accessorKey: "productSKU",
    //   header: "SKU",
    //   cell: ({ row }) => {
    //     return <div>{row.original.productSKU}</div>;
    //   },
    // },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-medium"
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const product = row.original;
        // const primaryImage =
        //   product.images.find((img) => img.isPrimary) || product.images[0];
        return (
          <div className="flex items-center gap-3">
            {/* {primaryImage && (
              <div className="h-10 w-10 relative overflow-hidden rounded-md">
                <Image
                  src={
                    primaryImage.imageUrl ||
                    "/placeholder.svg?height=40&width=40"
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            )} */}
            <div>
              <div className="font-medium">{product.name}</div>
              <div className="text-xs text-muted-foreground">
                {product.category?.name || "No category"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "seller.storeName",
      header: "Seller",
      cell: ({ row }) => {
        return <div>{row.original.seller?.storeName || "N/A"}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    // {
    //   accessorKey: "variants",
    //   header: "Stock",
    //   cell: ({ row }) => {
    //     const totalStock = row.original?.variants?.reduce(
    //       (sum, variant) => sum + variant.stockQuantity,
    //       0
    //     );
    //     return <div>{totalStock}</div>;
    //   },
    // },
    {
      accessorKey: "variants",
      header: "Price",
      cell: ({ row }) => {
        const prices = row?.original?.variants?.map((v:any) => parseFloat(v?.price));
        const minPrice = Math?.min(12);
        const maxPrice = Math?.max(323);

        return (
          <div>
            {prices?.length > 1 ? `$${minPrice} - $${maxPrice}` : `$${minPrice}`}
          </div>
        );
      },
    },
    {
      accessorKey: "isApproved",
      header: "Status",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex justify-center">
            {product?.isApproved ? (
              <Badge className="bg-green-600 hover:bg-green-600 text-white">
                Approved
              </Badge>
            ) : (
              <Badge variant="secondary">Pending</Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Switch
              checked={product.isApproved}
              onCheckedChange={(checked) =>
                handleApprovalChange(product, checked)
              }
              disabled={approveMutation.isPending}
              className={clsx(
                "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500",
                "transition-colors"
              )}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditProduct(product)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
     
        
          </div>
        );
      },
    },
  ];

//   if (isError) return <div>Error loading products</div>;

  return (
    <>
      <Toaster position="top-right" expand={true} richColors />
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-2xl font-bold">Products</h1>

        {/* Seller Filter Buttons - Moved to top */}
        <div className="flex gap-3">
          <Button
            variant={sellerFilter === "inHouse" ? "default" : "outline"}
            onClick={() => {
              setSellerFilter(sellerFilter === "inHouse" ? "all" : "inHouse");
              setPageIndex(0);
            }}
            className="flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            In-House Products
          </Button>
          <Button
            variant={sellerFilter === "others" ? "default" : "outline"}
            onClick={() => {
              setSellerFilter(sellerFilter === "others" ? "all" : "others");
              setPageIndex(0);
            }}
            className="flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Other Sellers
          </Button>
        </div>

        <ProductFilterTabs
          tabs={filterTabs}
          activeTab={activeFilter}
          onChange={handleFilterChange}
        />

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              placeholder="Search products by name, description or SKU..."
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* View Toggle and Filter Button */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`h-10 w-10 p-0 ${
                selectedCategories.length > 0 ||
                priceRange[0] > 0 ||
                priceRange[1] < 1000
                  ? "ring-2 ring-primary"
                  : ""
              }`}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="bg-background p-4 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Categories Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Categories</Label>
                  {tempSelectedCategories.length > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setTempSelectedCategories([])}
                      className="h-6 px-2 text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                {categories?.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={tempSelectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => {
                        setTempSelectedCategories((prev) =>
                          checked
                            ? [...prev, category.id]
                            : prev.filter((id) => id !== category.id)
                        );
                      }}
                    />
                    <Label htmlFor={`category-${category.id}`}>
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Price Range Section */}
              <div>
                <Label>Price Range</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={tempPriceRange[0]}
                    onChange={(e) =>
                      setTempPriceRange([
                        Number(e.target.value),
                        tempPriceRange[1],
                      ])
                    }
                    min="0"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={tempPriceRange[1]}
                    onChange={(e) =>
                      setTempPriceRange([
                        tempPriceRange[0],
                        Number(e.target.value),
                      ])
                    }
                    min={tempPriceRange[0]}
                  />
                </div>
              </div>

              {/* Status Section */}
              <div>
                <Label>Status</Label>
                <Select
                  value={tempActiveFilter}
                  onValueChange={setTempActiveFilter}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setTempSelectedCategories([]);
                  setTempPriceRange([0, 1000]);
                  setTempActiveFilter("all");
                }}
              >
                Reset All
              </Button>
              <Button
                onClick={() => {
                  // Apply the temporary filters
                  setSelectedCategories(tempSelectedCategories);
                  setPriceRange(tempPriceRange);
                  setActiveFilter(tempActiveFilter);
                  setIsFilterOpen(false);
                  // Reset to first page when applying filters
                  setPageIndex(0);
                }}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Content with Loading State */}
{/* isLoading */}
        {isLoading || isFetching ? (
          viewMode === "list" ? (
            <TableSkeleton />
          ) : (
            <GridSkeleton />
          )
        ) : viewMode === "list" ? (
          <DataTable
            columns={columns}
            data={data}
            totalCount={data}
            pageSize={pageSize}
            pageIndex={pageIndex}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        ) : (
          <ProductGrid
            products={data ?? []}
            onView={handleViewProduct}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onPublishChange={(product, isApproved) =>
              handleApprovalChange(product, isApproved)
            }
          />
        )}
      </div>
    </>
  );
}
