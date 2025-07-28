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

export interface Sales{
  id: string,
  name: string,
  phone: number,
  emailaddress: string,
  verification: string,
  approval: boolean,
  duetoSeller: number,
  emailVerification: string,
  createdAt: string,
}


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  List,
  LayoutGrid,
  X,
  Loader2,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  ProductFilterTabs,
  ProductGrid,
} from "@/components/common/Table";
// import type { Product } from "@/../types/product";
import { toast } from "sonner";
import { Toaster } from "sonner";
// import { Sales } from "../../../../../types/sales";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { SellerDetailsDialog } from "@/components/common/sellers/SellerDetailsDialog";
import axiosInstance from "@/app/utils/axiosInstance";

interface Seller {
  id: string;
  storeName: string;
  storeDescription?: string;
  isApproved: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profile: string;
  };
}

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

export default function SellerPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  // Implement debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const filterTabs = [
    { id: "all", label: "All" },
    { id: "approved", label: "Approved" },
    { id: "pending", label: "Pending" },
  ];

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "getAllSellers",
      debouncedSearchQuery,
      pageSize,
      pageIndex,
      activeFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: debouncedSearchQuery,
        limit: pageSize.toString(),
        offset: (pageIndex * pageSize).toString(),
      });

      if (activeFilter !== "all") {
        params.append(
          "isApproved",
          activeFilter === "approved" ? "true" : "false"
        );
      }

      const response = await axiosInstance.get(`/admin/fetchSellerProfile`,{
        params
      });
      if (response.status==400) {
        throw new Error("Network response was not ok");
      }
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({
      sellerId,
      isApproved,
    }: {
      sellerId: string;
      isApproved: boolean;
    }) => {
      // const response = await fetch(`/api/admin/seller/approve`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ sellerId, isApproved }),
      // });
      const response =await axiosInstance.put('/admin/approveSeller',{sellerId,isApproved})
      if (response.status!==200) {
        throw new Error("Failed to update seller approval status");
      }
      
      return response.data.approvedSeller;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["getAllSellers"] });
      toast.success(
        `Seller ${
          variables.isApproved ? "Approved" : "Pending"
        } successfully`
      );
    },
    onError: () => {
      toast.error("Failed to update seller approval status");
    },
  });

  const handleFilterChange = (tabId: string) => {
    setActiveFilter(tabId);
    setPageIndex(0);
  };

  const handlePageChange = (page: number) => {
    setPageIndex(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(0);
  };

  const columns: ColumnDef<Seller>[] = [
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
      accessorKey: "storeName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Store Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const seller = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 relative overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
              {seller?.user?.profile ? (
              <Image
                  src={seller?.user?.profile}
                alt={seller?.storeName}
                fill
                className="object-cover"
              />
              ) : (
                <User className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div>
              <div className="font-medium">{seller?.storeName}</div>
              <div className="text-xs text-muted-foreground">
                {seller?.user?.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "user.name",
      header: "Owner Name",
    },
    {
      accessorKey: "storeDescription",
      header: "Description",
      cell: ({ row }) => {
        return (
          <div className="max-w-[200px] truncate">
            {row.original?.storeDescription || "No description"}
          </div>
        );
      },
    },
    {
      accessorKey: "isApproved",
      header: "Status",
      cell: ({ row }) => {
        const seller:any = row.original;
        return (
            <Badge variant={seller?.status==="Approved" ? "default" : "secondary"}>
            {seller?.status==="Approved" ? "Approved" : "Pending"}
          </Badge>
        );
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
        const date = new Date(row.original?.createdAt);
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const seller:any = row.original;
        console.log(seller);
        const isLoading =
          approveMutation.isPending &&
          approveMutation.variables?.sellerId === seller?.id;

        return (
          <div className="flex justify-end">
            <div className="mr-2 w-[42px] h-[24px] flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Switch
                    checked={seller?.status==="Approved"}
                  onCheckedChange={(checked) =>
                    approveMutation.mutate({
                      sellerId: seller?.id,
                      isApproved: checked,
                    })
                  }
                />
              )}
            </div>
            <Button
              variant="ghost" 
              className="h-8 w-8 p-0"
              disabled={isLoading}
              onClick={() => setSelectedSellerId(seller?.id)}
            >
              <span className="sr-only">View seller</span>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <Toaster position="top-right" expand={true} richColors />
      <div className="bg-[#ffff] p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-lg">Sellers</div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search sellers..."
                className="pl-10 pr-10 py-1.5 border rounded text-sm focus:outline-none"
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
          </div>
        </div>

        <ProductFilterTabs tabs={filterTabs} onChange={handleFilterChange} />

        {isLoading || isFetching ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={data || []}
            totalCount={data || 0}
            pageSize={pageSize}
            pageIndex={pageIndex}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
      <SellerDetailsDialog
        sellerId={selectedSellerId || ""}
        open={!!selectedSellerId}
        onOpenChange={(open) => !open && setSelectedSellerId(null)}
      />
    </div>
  );
}
