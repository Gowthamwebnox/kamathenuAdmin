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
  Store,
  Package,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  XCircle,
  Banknote,
  CreditCard,
  PackageX,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useOrderDetailsStore } from "@/store/orderDetails";
import { OrderDetailsDialog } from "@/components/common/orders/OrderDetailsDialog";
import { useRouter } from "next/navigation";

interface SellerDetailsDialogProps {
  sellerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SellerDetailsSkeleton() {
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

function EmptyState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-4"
      >
        <Icon className="h-16 w-16 text-gray-300" />
      </motion.div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm">{description}</p>
    </motion.div>
  );
}

export function SellerDetailsDialog({
  sellerId,
  open,
  onOpenChange,
}: SellerDetailsDialogProps) {
  const router = useRouter();
  const { data: sellerDetails, isLoading } = useQuery({
    queryKey: ["sellerDetails", sellerId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/seller/${sellerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch seller details");
      }
      const result = await response.json();
      return result.data;
    },
    enabled: open,
  });

  // const { openDialog: openOrderDetails } = useOrderDetailsStore();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const closeDialog = () => {
    setIsOpen(false);
  };

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

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}/edit`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[98vw] lg:max-w-[95vw] h-[85vh] flex flex-col">
        <DialogHeader className="bg-white border-b mb-4">
          <DialogTitle>Seller Details</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto pr-2" style={{ maxHeight: "calc(85vh - 120px)" }}>
          {isLoading ? (
            <SellerDetailsSkeleton />
          ) : !sellerDetails ? (
            <div className="py-8 text-center text-gray-500">
              <p>Seller not found or has been deleted.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Seller Profile */}
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 relative rounded-full overflow-hidden">
                  <Image
                    src={sellerDetails.user.profile || "/placeholder.svg"}
                    alt={sellerDetails.storeName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{sellerDetails.storeName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={sellerDetails.isApproved ? "default" : "secondary"}>
                      {sellerDetails.isApproved ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {sellerDetails.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="store-info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="store-info">Store Info</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>

                <TabsContent value="store-info" className="mt-4">
                  <div className="space-y-6">
                    {/* Store Information */}
                    <div className="rounded-lg border p-4 space-y-4">
                      <h3 className="font-medium text-lg">Store Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Store className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Store Name</p>
                            <p className="font-medium">{sellerDetails.storeName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{sellerDetails.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Joined</p>
                            <p className="font-medium">{formatDate(sellerDetails.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">UPI ID</p>
                            <p className="font-medium">{sellerDetails.upiId || "Not set"}</p>
                          </div>
                        </div>
                      </div>
                      {sellerDetails.storeDescription && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="mt-1">{sellerDetails.storeDescription}</p>
                        </div>
                      )}
                    </div>

                    {/* Bank Account Details */}
                    <div className="rounded-lg border p-4 space-y-4">
                      <h3 className="font-medium text-lg">Bank Account Details</h3>
                      {sellerDetails.bankAccount ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Account Holder</p>
                            <p className="font-medium">{sellerDetails.bankAccount.accountHolderName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Account Number</p>
                            <p className="font-medium">{sellerDetails.bankAccount.accountNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Bank Name</p>
                            <p className="font-medium">{sellerDetails.bankAccount.bankName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">IFSC Code</p>
                            <p className="font-medium">{sellerDetails.bankAccount.ifscCode}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Branch Name</p>
                            <p className="font-medium">{sellerDetails.bankAccount.branchName || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Account Type</p>
                            <p className="font-medium">{sellerDetails.bankAccount.accountType || "N/A"}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>No bank account details available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="products" className="mt-4">
                  <div className="rounded-lg border p-4 space-y-4">
                    {sellerDetails.products.length === 0 ? (
                      <EmptyState
                        icon={PackageX}
                        title="No Products Yet"
                        description="This seller hasn't added any products to their store yet."
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sellerDetails.products.slice(0, 6).map((product: any) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => handleProductClick(product.id)}
                          >
                            <div className="h-32 relative rounded-md overflow-hidden mb-3">
                              <Image
                                src={product.images.find((img: any) => img.isPrimary)?.imageUrl || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Category: {product.category.name}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={product.isApproved ? "default" : "secondary"}>
                                {product.isApproved ? "Approved" : "Pending"}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {product.variants.length} variants
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="orders" className="mt-4">
                  <div className="rounded-lg border p-4 space-y-4">
                    {sellerDetails.OrderItem.length === 0 ? (
                      <EmptyState
                        icon={ShoppingCart}
                        title="No Orders Yet"
                        description="This seller hasn't received any orders yet."
                      />
                    ) : (
                      <div className="space-y-4">
                        {sellerDetails.OrderItem.slice(0, 5).map((orderItem: any) => (
                          <motion.div
                            key={orderItem.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => openOrderDetails(orderItem.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">Order #{orderItem.order.id}</p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(orderItem.createdAt)}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  orderItem.order.paymentStatus === "paid" ? "default" : "secondary"
                                }
                              >
                                {orderItem.order.paymentStatus}
                              </Badge>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm">
                                Product: {orderItem.productVariant.product.name}
                              </p>
                              <p className="text-sm">
                                Quantity: {orderItem.quantity}
                              </p>
                              <p className="text-sm">
                                Total: {formatPrice(orderItem.priceAtPurchase.toString())}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </div>
      </DialogContent>
      <OrderDetailsDialog />
    </Dialog>
  );
} 