"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MoreVertical } from "lucide-react";

interface Category {
  name: string;
  count: number;
}

interface TopCategoryListProps {
  categories: Category[];
}

export function TopCategoryList({ categories }: TopCategoryListProps) {
  const products = [
    {
      id: 1,
      name: "Mc Precison",
      category: "Shoes",
      price: "₹85.02",
      status: "Active",
      image: "/assets/images/product.png",
    },
    {
      id: 2,
      name: "Mc Precison",
      category: "Shoes",
      price: "₹85.02",
      status: "Active",
      image: "/assets/images/product.png",
    },
    {
      id: 3,
      name: "Mc Precison",
      category: "Shoes",
      price: "₹85.02",
      status: "Active",
      image: "/assets/images/product.png",
    },
  ];

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Top Categories</h3>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <span className="text-sm">{category.name}</span>
              </div>
              <span className="text-sm font-medium">{category.count} products</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
