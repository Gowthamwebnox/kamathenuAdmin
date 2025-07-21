import { JSX, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  MapPin,
  ShoppingBag,
  Star,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Image from "next/image";

interface CustomerDetailsDialogProps {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CustomerDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export function CustomerDetailsDialog({
  customerId,
  open,
  onOpenChange,
}: CustomerDetailsDialogProps) {
  const { data: customerDetails, isLoading } = useQuery({
    queryKey: ["customerDetails", customerId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/customer/${customerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch customer details");
      }
      const result = await response.json();
      return result.data;
    },
    enabled: open,
  });

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(parseFloat(price));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[90vw] lg:max-w-[80vw] max-h-[85vh]">
        <DialogHeader className="bg-white border-b mb-4">
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto pr-2" style={{ maxHeight: "calc(85vh - 120px)" }}>
          {isLoading ? (
            <CustomerDetailsSkeleton />
          ) : !customerDetails ? (
            <div className="py-8 text-center text-gray-500">
              <p>Customer not found or has been deleted.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Customer Profile */}
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 relative rounded-full overflow-hidden">
                  <Image
                    src={customerDetails.profile || "/placeholder.svg"}
                    alt={customerDetails.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{customerDetails.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={customerDetails.isEmailVerified ? "default" : "secondary"}>
                      {customerDetails.isEmailVerified ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {customerDetails.isEmailVerified ? "Verified" : "Unverified"}
                    </Badge>
                    <Badge variant="outline">{customerDetails.roleId}</Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="font-medium text-lg">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{customerDetails.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="font-medium">{formatDate(customerDetails.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="font-medium text-lg">Addresses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customerDetails.addresses.map((address: any) => (
                    <div key={address.id} className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                      <div>
                        <p className="font-medium">{address.street}</p>
                        <p className="text-sm text-gray-500">
                          {address.city}, {address.state}
                        </p>
                        <p className="text-sm text-gray-500">
                          {address.country} - {address.zipCode}
                        </p>
                        {address.phone && (
                          <p className="text-sm text-gray-500">Phone: {address.phone}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="font-medium text-lg">Recent Orders</h3>
                <div className="space-y-4">
                  {customerDetails.orders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            order.paymentStatus === "paid" ? "default" : "secondary"
                          }
                        >
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm">
                          Total: {formatPrice(order.totalAmount.toString())}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="font-medium text-lg">Recent Reviews</h3>
                <div className="space-y-4">
                  {customerDetails.reviews.slice(0, 5).map((review: any) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">{review.reviewText}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Product: {review.product.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 