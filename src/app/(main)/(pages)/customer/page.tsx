"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Search,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  X,
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
import { DataTable, ProductFilterTabs } from "@/components/common/Table";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { CustomerDetailsDialog } from "@/components/common/customers/CustomerDetailsDialog";

interface Customer {
  id: string;
  name: string;
  email: string;
  profile: string;
  emailVerifiedAt: string;
  isEmailVerified: boolean;
  roleId: string;
  createdAt: string;
  updatedAt: string;
}

function TableSkeleton() {
  return (
    <div className="space-y-4 mt-[1rem]">
      {/* Header Skeleton */}
      {/* <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div> */}

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

export default function CustomerPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const queryClient = useQueryClient();

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
    { id: "verified", label: "Verified" },
    { id: "unverified", label: "Unverified" },
  ];

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "getAllCustomers",
      debouncedSearchQuery,
      pageSize,
      pageIndex,
      activeFilter,
    ],
    queryFn: async () => {
      // Construct query parameters
      const params = new URLSearchParams({
        search: debouncedSearchQuery,
        limit: pageSize.toString(),
        offset: (pageIndex * pageSize).toString(),
      });

      // Add isEmailVerified filter based on activeFilter
      if (activeFilter === "verified") {
        params.append("isEmailVerified", "true");
      } else if (activeFilter === "unverified") {
        params.append("isEmailVerified", "false");
      }

      const response = await fetch(`/api/admin/customer?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      return result.data;
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

  const columns: ColumnDef<Customer>[] = [
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
        </Button>
      ),
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 relative overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">


              {customer.profile ? (
                <Image
                  src={customer.profile}
                  alt={customer.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div>
              <div className="font-medium">{customer.name}</div>
              <div className="text-xs text-muted-foreground">
                {customer.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "roleId",
      header: "Role",
      cell: ({ row }) => {
        return <Badge variant="secondary">{row.original.roleId}</Badge>;
      },
    },
    {
      accessorKey: "isEmailVerified",
      header: "Email Status",
      cell: ({ row }) => {
        return (
          <Badge
            variant={row.original.isEmailVerified ? "default" : "secondary"}
          >
            {row.original.isEmailVerified ? "Verified" : "Unverified"}
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
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setSelectedCustomerId(customer.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-[#ffff] p-4 border-b">
      <Toaster position="top-right" expand={true} richColors />
      <div className="flex justify-between items-center mb-4">
        <div className="font-bold text-lg">Customers</div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search customers..."
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
          data={data?.customers || []}
          totalCount={data?.count?.total || 0}
          pageSize={pageSize}
          pageIndex={pageIndex}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <CustomerDetailsDialog
        customerId={selectedCustomerId || ""}
        open={!!selectedCustomerId}
        onOpenChange={(open) => !open && setSelectedCustomerId(null)}
      />
    </div>
  );
}
