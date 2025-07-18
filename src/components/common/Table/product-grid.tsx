"use client"
import Image from "next/image"
import type { Product } from "@/../types/product"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Eye, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

interface ProductGridProps {
  products: Product[]
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onPublishChange: (product: Product, isPublished: boolean) => void
}

export function ProductGrid({ products, onView, onEdit, onDelete, onPublishChange }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="relative aspect-square">
            <Image
              src={product.imageUrl || "/placeholder.svg?height=200&width=200"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(product)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(product)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(product)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm">Stock: {product.stockQuantity}</span>
              <Badge
                className={
                  product.isPublished
                    ? "bg-[#6366f1] hover:bg-[#5355d1] text-white"
                    : "bg-secondary text-secondary-foreground"
                }
              >
                {product.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <span className="font-medium">${product.price.toFixed(2)}</span>
            <Switch checked={product.isPublished} onCheckedChange={(checked) => onPublishChange(product, checked)} />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
