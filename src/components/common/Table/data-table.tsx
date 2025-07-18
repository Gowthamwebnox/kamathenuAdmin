"use client"

import { useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LayoutGrid, List } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  totalCount: number
  pageSize: number
  pageIndex: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  searchKey?: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filterOptions?: {
    key: string
    options: { label: string; value: string }[]
    defaultValue?: string
    value?: string
    onChange?: (value: string) => void
  }
  viewToggle?: boolean
  onViewChange?: (view: "list" | "grid") => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  pageSize,
  pageIndex,
  onPageChange,
  onPageSizeChange,
  searchKey,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filterOptions,
  viewToggle = false,
  onViewChange,
}: DataTableProps<TData, TValue>) {
  const [currentView, setCurrentView] = useState<"list" | "grid">("list")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });

  const handleViewChange = (view: "list" | "grid") => {
    setCurrentView(view)
    if (onViewChange) {
      onViewChange(view)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {filterOptions && (
          <div className="w-full sm:w-[200px]">
            <Select
              value={filterOptions.value}
              onValueChange={(value) => {
                if (filterOptions.onChange) {
                  filterOptions.onChange(value)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={filterOptions.options[0].label} />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex-1 sm:max-w-md mx-4">
          {searchKey && onSearchChange && (
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full"
            />
          )}
        </div>

        {viewToggle && (
          <div className="flex items-center space-x-2">
            <Button
              variant={currentView === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => handleViewChange("list")}
              className="h-9 w-9"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={currentView === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => handleViewChange("grid")}
              className="h-9 w-9"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Rows per page:</p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              onPageSizeChange(Number(value))
              onPageChange(0)
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              {["2","5", "10", "20", "50"].map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1 text-sm text-muted-foreground">
            {totalCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {pageIndex * pageSize + 1}-
                {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(0)}
            disabled={pageIndex === 0}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= Math.ceil(totalCount / pageSize) - 1}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(Math.ceil(totalCount / pageSize) - 1)}
            disabled={pageIndex >= Math.ceil(totalCount / pageSize) - 1}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
