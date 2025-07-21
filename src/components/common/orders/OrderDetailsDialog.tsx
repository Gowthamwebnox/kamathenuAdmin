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
  Clock,
  MapPin,
  Package,
  Truck,
  User,
  CreditCard,
  CheckCircle2,
  XCircle,
  FileDown,
} from "lucide-react";
import { UpdateOrderStatus } from "@/components/common/orders/UpdateOrderStatus";
import { generateOrderInvoice } from "@/app/utils/pdf/orderInvoice";
// import { useOrderDetailsStore } from "@/store/orderDetails";

function OrderDetailsSkeleton() {
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

export function OrderDetailsDialog() {
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  // const { orderId, isOpen, closeDialog } = useOrderDetailsStore();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const closeDialog = () => {
    setIsOpen(false);
  };

  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ["orderDetails", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }
      const result = await response.json();
      return result.data;
    },
    enabled: isOpen && !!orderId,
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

  const downloadInvoice = async () => {
    if (!orderDetails) return;
    await generateOrderInvoice(orderDetails);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; bgColor: string; icon: JSX.Element }
    > = {
      pending: {
        color: "text-yellow-700",
        bgColor: "bg-yellow-50",
        icon: <Clock className="h-4 w-4" />,
      },
      processing: {
        color: "text-blue-700",
        bgColor: "bg-blue-50",
        icon: <Package className="h-4 w-4" />,
      },
      shipped: {
        color: "text-purple-700",
        bgColor: "bg-purple-50",
        icon: <Truck className="h-4 w-4" />,
      },
      delivered: {
        color: "text-green-700",
        bgColor: "bg-green-50",
        icon: <CheckCircle2 className="h-4 w-4" />,
      },
      cancelled: {
        color: "text-red-700",
        bgColor: "bg-red-50",
        icon: <XCircle className="h-4 w-4" />,
      },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

    return (
      <Badge
        className={`${config.color} ${config.bgColor} flex items-center gap-1 px-2 py-1`}
      >
        {config.icon}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="w-full max-w-[90vw] lg:max-w-[80vw] max-h-[85vh]">
          <DialogHeader className="bg-white border-b mb-4">
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto pr-2" style={{ maxHeight: "calc(85vh - 120px)" }}>
            {isLoading ? (
              <OrderDetailsSkeleton />
            ) : !orderDetails ? (
              <div className="py-8 text-center text-gray-500">
                <p>Order not found or has been deleted.</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Order Status and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(orderDetails.status)}
                    <Badge
                      variant={
                        orderDetails.order.paymentStatus === "paid"
                          ? "default"
                          : "destructive"
                      }
                      className="flex items-center gap-1"
                    >
                      <CreditCard className="h-3 w-3" />
                      {orderDetails.order.paymentStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={downloadInvoice}
                      className="flex items-center gap-2"
                    >
                      <FileDown className="h-4 w-4" />
                      Download Invoice
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsUpdateStatusOpen(true)}
                    >
                      Update Status
                    </Button>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="rounded-lg border p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium">
                        {orderDetails.order.user.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {orderDetails.order.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium">Shipping Address</h3>
                      <p className="text-sm text-gray-500">
                        {orderDetails.order.shippingAddress.street},
                        {orderDetails.order.shippingAddress.city},{" "}
                        {orderDetails.order.shippingAddress.state},{" "}
                        {orderDetails.order.shippingAddress.country} -{" "}
                        {orderDetails.order.shippingAddress.zipCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <h3 className="font-medium">Order Items</h3>
                  <div className="divide-y border rounded-lg">
                    <div className="p-4 flex items-center gap-4">
                      <div className="h-16 w-16 relative rounded-md overflow-hidden">
                        <img
                          src={
                            orderDetails.productVariant.product.images.find(
                              (img: any) => img.isPrimary
                            )?.imageUrl
                          }
                          alt={orderDetails.productVariant.product.name}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {orderDetails.productVariant.product.name}<span className="text-sm text-gray-500 ml-3">
                            × {orderDetails.quantity}
                          </span>
                        </h4>
                        <p className="text-sm text-gray-500">
                          {orderDetails.productVariant.title}
                        </p>
                        {/* <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-medium">
                            {formatPrice(orderDetails.priceAtPurchase)}
                          </span>
                          
                        </div> */}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatPrice(
                            (
                              parseFloat(orderDetails.priceAtPurchase) 
                              
                            ).toString()
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                {/* <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatPrice(orderDetails.order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2">
                    <span>Total</span>
                    <span>{formatPrice(orderDetails.order.totalAmount)}</span>
                  </div>
                </div> */}

                {/* Order Timeline */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Order Timeline</h3>
                  <div className="space-y-4">
                    {orderDetails.OrderTracking?.map((event: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3"
                      >
                        <div className="w-12 text-sm text-gray-500">
                          {formatDate(event.updatedAt)}
                        </div>
                        <div
                          className={`w-0.5 ${
                            index === 0 ? "bg-primary" : "bg-gray-200"
                          }`}
                        />
                        <div>
                          <p className="font-medium">{event.status}</p>
                          <p className="text-sm text-gray-500">
                            {event.remarks || `Order ${event.status}`}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {(!orderDetails.OrderTracking || orderDetails.OrderTracking.length === 0) && (
                      <div className="text-sm text-gray-500 text-center py-4">
                        No tracking information available
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <UpdateOrderStatus
        orderId={orderId || ""}
        open={isUpdateStatusOpen}
        onOpenChange={setIsUpdateStatusOpen}
        currentStatus={orderDetails?.status}
      />
    </>
  );
}
