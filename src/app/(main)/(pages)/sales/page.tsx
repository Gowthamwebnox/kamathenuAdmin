"use client";
import React from "react";
import { FaFilePdf, FaTrash } from "react-icons/fa6";
import {
  ChevronDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  Check,
  X,
  AlertTriangle,
  CreditCard,
  Package,
  User,
  DollarSign,
  RefreshCw,
  Edit,
  Truck,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// import ShipmentDialog, { Shipment } from "@/components/ui/ShipmentDialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import axiosInstance from "@/app/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Order {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  productDescription: string;
  customer: string;
  email: string;
  date: string;
  time: string;
  items: number;
  price: string;
  status: string;
  variantInfo?: string;
}

interface OrderAPIResponse {
  version: string;
  validationErrors: any[];
  code: number;
  status: string;
  message: string;
  data: {
    count: {
      total: number;
      pending: number;
      shipped: number;
      delivered: number;
      cancelled: number;
      cancellRequested: number;
    };
    orderItems: OrderAPIItem[];
  };
}

interface OrderAPIItem {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  priceAtPurchase: string;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  status: string;
  User: any | null;
  designUrl: string;
  product: {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    isApproved: boolean;
    createdAt: string;
    updatedAt: string;
    aboutProduct: {
      about: string;
    };
    sellerId: string;
    price: string | null;
  };
  order: {
    id: string;
    userId: string;
    totalAmount: string;
    orderStatus: string;
    paymentRefId: string | null;
    paymentStatus: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface Tab {
  name: string;
  count: number;
  icon: React.ReactNode;
}

// Helper function to get product image (placeholder for now)
const getProductImage = (item: OrderAPIItem) => {
  // Since your API doesn't include images yet, return placeholder
  return "/placeholder.png";
};

// Helper function to get product details
const getProductDetails = (item: OrderAPIItem) => {
  const product = item.product;

  if (!product) return { title: "Unnamed Product", description: "" };

  const title = product.name || "Unnamed Product";
  const description = product.description || "";

  return { title, description };
};

// Status option component for the dialog
const StatusOption = ({
  status,
  color,
  icon,
  onClick,
  disabled,
}: {
  status: string;
  color: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) => (
  <button
    onClick={onClick}
    className={`${color} flex items-center justify-between p-3 rounded-lg w-full font-medium transition-all hover:opacity-90 hover:shadow-sm ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    disabled={disabled}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{status}</span>
    </div>
    <ChevronRight className="h-4 w-4" />
  </button>
);

const Productspage = () => {
  const badgeStyles: Record<string, string> = {
    All: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    cancellRequested: "bg-orange-100 text-orange-800",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: (
      <div className="bg-yellow-500 rounded-full p-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-white"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    ),
    shipped: (
      <div className="bg-indigo-500 rounded-full p-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-white"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-6a1 1 0 00-.293-.707l-4-4A1 1 0 0016 3H3z" />
        </svg>
      </div>
    ),
    delivered: (
      <div className="bg-green-500 rounded-full p-1">
        <Check className="h-4 w-4 text-white" />
      </div>
    ),
    cancelled: (
      <div className="bg-red-500 rounded-full p-1">
        <X className="h-4 w-4 text-white" />
      </div>
    ),
    cancellRequested: (
      <div className="bg-orange-500 rounded-full p-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3"
          />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
    ),
  };

  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [orderCounts, setOrderCounts] = useState({
    All: 0,
    pending: 0,
    // shipped: 0,
    delivered: 0,
    cancelled: 0,
    // cancellRequested: 0,
  });
  const [isVisible, setIsVisible] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundDialogOrder, setRefundDialogOrder] =
    useState<OrderAPIItem | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelDialogOrder, setCancelDialogOrder] =
    useState<OrderAPIItem | null>(null);
  const [shipmentDialogOpen, setShipmentDialogOpen] = useState(false);
//   const [shipmentDialogData, setShipmentDialogData] = useState<Shipment | null>(null);
  const [orderItems, setOrderItems] = useState<OrderAPIItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Tabs definition (restore after moving to server-side pagination)
  const tabs: Tab[] = [
    {
      name: "All",
      count: orderCounts.All,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "pending",
      count: orderCounts.pending,
      icon: statusIcons.pending,
    },
    // {
    //   name: "shipped",
    //   count: orderCounts.shipped,
    //   icon: statusIcons.shipped,
    // },
    {
      name: "delivered",
      count: orderCounts.delivered,
      icon: statusIcons.delivered,
    },
    // {
    //   name: "cancellRequested",
    //   count: orderCounts.cancellRequested,
    //   icon: statusIcons.cancellRequested,
    // },
    // {
    //   name: "cancelled",
    //   count: orderCounts.cancelled,
    //   icon: statusIcons.cancelled,
    // },
  ];
  var pending=0;
  var delivered=0;
  var cancelled=0;
  // Fetch orders from API with query params
  const getOrders = async () => {
    try {
      setLoading(true);
      const response:any = await axiosInstance.get(`/seller/fetchSellerOrders/${"c6fe18bd-0e74-47f9-b8e1-83f1f93b9760"}`);
      console.log("🔥🔥🔥🔥🔥🔥response🔥🔥🔥🔥🔥🔥", response)
      
      if (response.status === 200) {
        // Your API returns a single order item, so we'll wrap it in an array
        const orderItem = response.data 
        const orderItemsData = response.data;
        orderItemsData.map((item: any) => {
          
          if(item.status === "pending"){
            pending++;
          }
          if(item.status === "delivered"){
            delivered++;
          }
          if(item.status === "cancelled"){
            cancelled++;
          }
        })
        
        console.log("🔥🔥🔥🔥🔥🔥orderItemsData🔥🔥🔥🔥🔥🔥", orderItemsData.length)
        
        setOrderCounts({
          All:response.data.length, 
          pending: pending,
          // shipped: orderItem.status === "shipped" ? 1 : 0,
          delivered: delivered,
          cancelled: cancelled,
          // cancellRequested: orderItem.status === "cancellRequested" ? 1 : 0,
        });
        setOrderItems(orderItemsData);
        
        const formattedOrders = orderItemsData.map(
          (item: any) => {
            const createdAt = new Date(item.createdAt);
            const date = createdAt.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
            const time = createdAt.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            });
            
            // const productImage = getProductImage(item);
            const { title, description } = getProductDetails(item);
            
            return {
              id: item.id,
              orderId: item.orderId,
              productId: item.productId,
              productName: title,
              productImage: item.product.images[0].imageUrl[0],
              productDescription: item.product.description,
              customer: "Customer", // Since User is null in your response
              email: "customer@example.com", // Since User is null in your response
              date,
              time,
              items: 1, // Default to 1 since quantity is not in your response
              price: `₹${item.priceAtPurchase}`,
              status: item.status,
              designUrl: item.designDocument,
            };
          }
        );
        setOrders(formattedOrders);
      } else {
        setOrders([]);
        setOrderItems([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setOrderItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage, rowsPerPage, searchTerm]);

  // Client-side pagination to limit displayed data
  const totalPages = Math.max(1, Math.ceil(orders.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const allSelected =
    selectedOrders.length === paginatedOrders.length &&
    paginatedOrders.length > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((order) => order.id));
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedOrders((prevSelected) =>
        prevSelected.includes(id)
          ? prevSelected.filter((orderId) => orderId !== id)
        : [...prevSelected, id]
    );
  };

  const formatTabName = (name: string) => {
    return name === "All" ? name : name.charAt(0).toUpperCase() + name.slice(1);
  };

  const StatusUpdateDialog = () => {
    const selectedOrder = orders.find((o) => o.id === selectedOrderId);
    const isCancelled = selectedOrder?.status === "cancelled";
    // Find the full API order item for cancel dialog
    const selectedOrderAPIItem = selectedOrderId
      ? orderItems.find((item: OrderAPIItem) => item.id === selectedOrderId)
      : null;
    return (
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Update Order Status
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <StatusOption
              status="Pending"
              color="bg-yellow-50 text-yellow-800 border border-yellow-100"
              icon={statusIcons.pending}
              onClick={() =>
                selectedOrderId && updateOrderStatus(selectedOrderId, "pending")
              }
              disabled={isCancelled || selectedOrder?.status === "pending"}
            />
            <StatusOption
              status="Shipped"
              color="bg-indigo-50 text-indigo-800 border border-indigo-100"
              icon={statusIcons.shipped}
              onClick={() =>
                selectedOrderId && updateOrderStatus(selectedOrderId, "shipped")
              }
              disabled={isCancelled || selectedOrder?.status === "shipped"}
            />
            <StatusOption
              status="Delivered"
              color="bg-green-50 text-green-800 border border-green-100"
              icon={statusIcons.delivered}
              onClick={() =>
                selectedOrderId && updateOrderStatus(selectedOrderId, "delivered")
              }
              disabled={isCancelled || selectedOrder?.status === "delivered"}
            />
            <StatusOption
              status="Cancelled"
              color="bg-red-50 text-red-800 border border-red-100"
              icon={statusIcons.cancelled}
              onClick={() => {
                if (selectedOrderAPIItem) {
                  setCancelDialogOrder(selectedOrderAPIItem);
                  setCancelDialogOpen(true);
                  setStatusDialogOpen(false);
                }
              }}
              disabled={isCancelled || selectedOrder?.status === "cancelled"}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setStatusLoading(true);
      const response:any = await axios.patch(`/api/seller/orders/${orderId}`, {
        status: newStatus,
      });

      if (response.data.code === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );

        setOrderCounts((prev) => {
          const orderToUpdate = orders.find((order) => order.id === orderId);
          if (!orderToUpdate) return prev;

          const oldStatus = orderToUpdate.status;

          return {
            ...prev,
            [oldStatus]: Math.max(0, prev[oldStatus as keyof typeof prev] - 1),
            [newStatus]: prev[newStatus as keyof typeof prev] + 1,
          };
        });
      } else {
        console.error("Failed to update order status:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setStatusLoading(false);
      setStatusDialogOpen(false);
    }
  };

  // Calculate refund amounts
  const calculateRefundAmounts = (orderItem: any) => {
    const itemPrice = Number.parseFloat(orderItem.priceAtPurchase);
    const gstAmount = Number.parseFloat(orderItem.gstAmountAtPurchase || "0");
    const shippingCharge = Number.parseFloat(orderItem.shippingCharge || "0");
    const discountAmount = Number.parseFloat(
      orderItem.discountAmountAtPurchase || "0"
    );

    const subtotal = itemPrice - discountAmount;
    const totalPaid = subtotal + gstAmount + shippingCharge;
    const alreadyRefunded = Number.parseFloat(orderItem.refundedAmount || "0");
    // Refundable amount is subtotal minus already refunded (excludes GST & shipping)
    const refundableAmount = subtotal - alreadyRefunded;

    return {
      itemPrice,
      gstAmount,
      shippingCharge,
      discountAmount,
      subtotal,
      totalPaid,
      alreadyRefunded,
      refundableAmount,
    };
  };

  // Skeleton loader for tab count
  const TabCountSkeleton = () => (
    <span
      className="ml-2 px-4 py-1 h-6 inline-block rounded-full bg-gray-200 animate-pulse"
      style={{ minWidth: 32 }}
    />
  );

  // Skeleton loader for table rows
  const TableRowSkeleton = ({ columns }: { columns: number }) => (
    <tr>
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="py-4 px-4">
          <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );

  // Modern Cancel Dialog with detailed refund information
  const CancelDialog = () => {
    const [cancellationReason, setCancellationReason] = useState("");
    const [refundAmount, setRefundAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const orderItem:any = cancelDialogOrder;
    if (!orderItem) return null;

    const refundAmounts = calculateRefundAmounts(orderItem);
    // const primaryImage =
    //   orderItem.productVariant.ProductVariantImage.find((img) => img.isPrimary)
    //     ?.imageUrl ||
    //   orderItem.productVariant.ProductVariantImage[0]?.imageUrl ||
    //   "/placeholder.svg";

    // Handle cancellation with refund
    const handleCancelWithRefund = async () => {
      if (!cancelDialogOrder) return;

      setIsProcessing(true);
      try {
        const refundAmountValue =
          Number.parseFloat(refundAmount) ||
          calculateRefundAmounts(cancelDialogOrder).refundableAmount;

        const response:any = await axios.post(
          `/api/user/orders/${cancelDialogOrder.id}/cancel`,
          {
            cancelType: "withRefund",
            refundAmount: refundAmountValue,
            reason: cancellationReason,
          }
        );

        if (response.data.code === 200) {
          // Refetch orders to update the list
          getOrders();

          setCancelDialogOpen(false);
          setCancellationReason("");
          setRefundAmount("");

          // Show success message
          alert("Order cancelled successfully with refund initiated.");
        }
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Failed to cancel order. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    };

    // Handle cancellation without refund
    const handleCancelWithoutRefund = async () => {
      if (!cancelDialogOrder) return;

      setIsProcessing(true);
      try {
        const response:any = await axios.post(
          `/api/user/orders/${cancelDialogOrder.id}/cancel`,
          {
            cancelType: "withoutRefund",
            reason: cancellationReason,
          }
        );

        if (response.data.code === 200) {
          // Refetch orders to update the list
          getOrders();

          setCancelDialogOpen(false);
          setCancellationReason("");

          // Show success message
          alert("Order cancelled successfully without refund.");
        }
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Failed to cancel order. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    };

  //   return (
  //     <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
  //       <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
  //         <DialogHeader className="space-y-3">
  //           <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
  //             <AlertTriangle className="h-6 w-6 text-orange-500" />
  //             Cancel Order & Process Refund
  //           </DialogTitle>
  //           <p className="text-gray-600">
  //             Review the order details and choose the appropriate cancellation
  //             option
  //           </p>
  //         </DialogHeader>

  //         <div className="space-y-6">
  //           {/* Order Overview Card */}
  //           <Card>
  //             {/* <CardHeader>
  //               <CardTitle className="flex items-center gap-2 text-lg">
  //                 <Package className="h-5 w-5" />
  //                 Order Details
  //               </CardTitle>
  //             </CardHeader> */}
  //             <CardContent>
  //               <div className="flex flex-col lg:flex-row gap-6">
  //                 {/* Product Image */}
  //                 <div className="flex-shrink-0">
  //                   <img
  //                     src={primaryImage || "/placeholder.svg"}
  //                     alt={orderItem.productVariant.title}
  //                     className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
  //                   />
  //                 </div>

  //                 {/* Product & Order Info */}
  //                 <div className="flex-1 space-y-4">
  //                   <div>
  //                     <h3 className="text-xl font-semibold text-gray-900">
  //                       {orderItem.productVariant.title}
  //                     </h3>
  //                     <p className="text-gray-600 mt-1">
  //                       {orderItem.productVariant.description ? orderItem.productVariant.description : ""}
  //                     </p>
  //                     {orderItem.productVariant.variantType && (
  //                       <Badge variant="secondary" className="mt-2">
  //                         {orderItem.productVariant.variantType}:{" "}
  //                         {orderItem.productVariant.variantValue}
  //                       </Badge>
  //                     )}
  //                   </div>

  //                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  //                     <div>
  //                       <p className="text-sm text-gray-500">Order ID</p>
  //                       <p className="font-medium text-sm break-all">
  //                         {orderItem.id}
  //                       </p>
  //                     </div>
  //                     <div>
  //                       <p className="text-sm text-gray-500">SKU</p>
  //                       <p className="font-medium">
  //                         {orderItem.productVariant.productVariantSKU}
  //                       </p>
  //                     </div>
  //                     <div>
  //                       <p className="text-sm text-gray-500">Quantity</p>
  //                       <p className="font-medium">{orderItem.quantity}</p>
  //                     </div>
  //                     <div>
  //                       <p className="text-sm text-gray-500">Status</p>
  //                       <Badge
  //                         className={
  //                           badgeStyles[orderItem.status]
  //                         }
  //                       >
  //                         {orderItem.status.charAt(0).toUpperCase() +
  //                           orderItem.status.slice(1)}
  //                       </Badge>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             </CardContent>
  //           </Card>

  //           {/* Customer Information */}
  //           <Card>
  //             <CardHeader>
  //               <CardTitle className="flex items-center gap-2 text-lg">
  //                 <User className="h-5 w-5" />
  //                 Customer Information
  //               </CardTitle>
  //             </CardHeader>
  //             <CardContent>
  //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //                 <div>
  //                   <p className="text-sm text-gray-500">Customer Name</p>
  //                   <p className="font-medium">{orderItem.order.user?.name || orderItem.order.shippingAddress.fullName || ""}</p>
  //                 </div>
  //                 <div>
  //                   <p className="text-sm text-gray-500">Email</p>
  //                   <p className="font-medium">{orderItem.order.user?.email || orderItem.order.shippingAddress.email || ""}</p>
  //                 </div>
  //                 <div>
  //                   <p className="text-sm text-gray-500">Phone</p>
  //                   <p className="font-medium">
  //                     {orderItem.order.shippingAddress.phone}
  //                   </p>
  //                 </div>
  //                 <div>
  //                   <p className="text-sm text-gray-500">Order Date</p>
  //                   <p className="font-medium">
  //                     {new Date(orderItem.createdAt).toLocaleDateString(
  //                       "en-GB",
  //                       {
  //                         day: "2-digit",
  //                         month: "short",
  //                         year: "numeric",
  //                         hour: "2-digit",
  //                         minute: "2-digit",
  //                       }
  //                     )}
  //                   </p>
  //                 </div>
  //               </div>

  //               <Separator className="my-4" />

  //               <div>
  //                 <p className="text-sm text-gray-500 mb-2">Shipping Address</p>
  //                 {/* <p className="text-sm">
  //                   {orderItem.order.shippingAddress.street},{" "}
  //                   {orderItem.order.shippingAddress.city},{" "}
  //                   {orderItem.order.shippingAddress.state} -{" "}
  //                   {orderItem.order.shippingAddress.zipCode},{" "}
  //                   {orderItem.order.shippingAddress.country}
  //                 </p> */}
  //               </div>
  //             </CardContent>
  //           </Card>

  //           {/* Payment & Refund Information */}
  //           <Card>
  //             <CardHeader>
  //               <CardTitle className="flex items-center gap-2 text-lg">
  //                 <CreditCard className="h-5 w-5" />
  //                 Payment & Refund Details
  //               </CardTitle>
  //             </CardHeader>
  //             <CardContent>
  //               <div className="space-y-4">
  //                 {/* Payment Breakdown */}
  //                 <div className="bg-gray-50 p-4 rounded-lg">
  //                   <h4 className="font-semibold mb-3">Payment Breakdown</h4>
  //                   <div className="space-y-2 text-sm">
  //                     <div className="flex justify-between">
  //                       <span>Item Price:</span>
  //                       <span><span className="inline-block align-middle mr-0.5">₹</span>{refundAmounts.itemPrice.toFixed(2)}</span>
  //                     </div>
  //                     {refundAmounts.discountAmount > 0 && (
  //                       <div className="flex justify-between text-green-600">
  //                         <span>Discount Applied:</span>
  //                         <span>
  //                           -<span className="inline-block align-middle mr-0.5">₹</span>{refundAmounts.discountAmount.toFixed(2)}
  //                         </span>
  //                       </div>
  //                     )}
  //                     <div className="flex justify-between">
  //                       <span>GST ({orderItem.gstAtPurches}%):</span>
  //                       <span><span className="inline-block align-middle mr-0.5">₹</span>{refundAmounts.gstAmount.toFixed(2)}</span>
  //                     </div>
  //                     <div className="flex justify-between">
  //                       <span>Shipping Charges:</span>
  //                       <span><span className="inline-block align-middle mr-0.5">₹</span>{refundAmounts.shippingCharge.toFixed(2)}</span>
  //                     </div>
  //                     <Separator />
  //                     <div className="flex justify-between font-semibold">
  //                       <span>Total Paid:</span>
  //                       <span><span className="inline-block align-middle mr-0.5">₹</span>{refundAmounts.totalPaid.toFixed(2)}</span>
  //                     </div>
  //                   </div>
  //                 </div>

  //                 {/* Refund Information */}
  //                 <div className="bg-blue-50 p-4 rounded-lg">
  //                   <h4 className="font-semibold mb-3 text-blue-900">
  //                     Refund Information
  //                   </h4>
  //                   <div className="space-y-2 text-sm">
  //                     {refundAmounts.alreadyRefunded > 0 && (
  //                       <div className="flex justify-between text-orange-600">
  //                         <span>Already Refunded:</span>
  //                         <span>
  //                           <span className="inline-block align-middle mr-0.5">₹</span>{refundAmounts.alreadyRefunded.toFixed(2)}
  //                         </span>
  //                       </div>
  //                     )}
  //                     <div className="flex justify-between font-semibold text-blue-900">
  //                       <span>Refundable Amount (excluding GST & Shipping):</span>
  //                       <span>
  //                         <span className="inline-block align-middle mr-0.5">₹</span>{refundAmounts.refundableAmount.toFixed(2)}
  //                       </span>
  //                     </div>
  //                     {orderItem.isRefunded && (
  //                       <div className="flex items-center gap-2 text-green-600 mt-2">
  //                         <Check className="h-4 w-4" />
  //                         <span className="text-sm">
  //                           Refund Status: {orderItem.refundStatus}
  //                         </span>
  //                       </div>
  //                     )}
  //                   </div>
  //                 </div>

  //                 {/* Payment Method Info */}
  //                 {orderItem.OrderItemPayment.length > 0 && (
  //                   <div className="bg-gray-50 p-4 rounded-lg">
  //                     <h4 className="font-semibold mb-3">Payment Method</h4>
  //                     <div className="text-sm space-y-1">
  //                       <p>
  //                         <span className="text-gray-600">Gateway:</span>{" "}
  //                         {orderItem.OrderItemPayment[0].payment.paymentGateway}
  //                       </p>
  //                       <p>
  //                         <span className="text-gray-600">Transaction ID:</span>{" "}
  //                         {orderItem.OrderItemPayment[0].payment.transactionId}
  //                       </p>
  //                       <p>
  //                         <span className="text-gray-600">Payment Status:</span>
  //                         <Badge variant="secondary" className="ml-2">
  //                           {
  //                             orderItem.OrderItemPayment[0].payment
  //                               .paymentStatus
  //                           }
  //                         </Badge>
  //                       </p>
  //                     </div>
  //                   </div>
  //                 )}
  //               </div>
  //             </CardContent>
  //           </Card>

  //           {/* Cancellation Form */}
  //           <Card>
  //             <CardHeader>
  //               <CardTitle className="text-lg">Cancellation Details</CardTitle>
  //             </CardHeader>
  //             <CardContent className="space-y-4">
  //               <div>
  //                 <Label htmlFor="reason">Cancellation Reason *</Label>
  //                 <Textarea
  //                   id="reason"
  //                   placeholder="Please provide a reason for cancellation..."
  //                   value={cancellationReason}
  //                   onChange={(e) => setCancellationReason(e.target.value)}
  //                   className="mt-1"
  //                   rows={3}
  //                 />
  //               </div>

  //               <div>
  //                 <Label htmlFor="refundAmount">
  //                   Custom Refund Amount (Optional)
  //                 </Label>
  //                 <div className="mt-1 relative">
  //                   <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
  //                   <input
  //                     id="refundAmount"
  //                     type="number"
  //                     placeholder={`Default: ₹${refundAmounts.refundableAmount.toFixed(2)}`}
  //                     value={refundAmount}
  //                     onChange={(e) => setRefundAmount(e.target.value)}
  //                     max={refundAmounts.refundableAmount}
  //                     min="0"
  //                     step="0.01"
  //                     className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
  //                   />
  //                 </div>
  //                 <p className="text-xs text-gray-500 mt-1">
  //                   Leave empty to refund the full refundable amount (<span className="inline-block align-middle mr-0.5">₹</span>{refundAmounts.refundableAmount.toFixed(2)})
  //                 </p>
  //               </div>
  //             </CardContent>
  //           </Card>

  //           {/* Action Buttons */}
  //           <div className="flex flex-col sm:flex-row gap-3 pt-4">
  //             <Button
  //               onClick={handleCancelWithRefund}
  //               disabled={isProcessing}
  //               className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
  //             >
  //               {isProcessing ? (
  //                 <>
  //                   <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
  //                   Processing...
  //                 </>
  //               ) : (
  //                 <>
  //                   <CreditCard className="h-4 w-4 mr-2" />
  //                   Cancel with Refund (<span className="inline-block align-middle mr-0.5">₹</span>
  //                   {(
  //                     Number.parseFloat(refundAmount) ||
  //                     refundAmounts.refundableAmount
  //                   ).toFixed(2)}
  //                   )
  //                 </>
  //               )}
  //             </Button>

  //             <Button
  //               onClick={handleCancelWithoutRefund}
  //               disabled={isProcessing}
  //               variant="destructive"
  //               className="flex-1"
  //             >
  //               {isProcessing ? (
  //                 <>
  //                   <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
  //                   Processing...
  //                 </>
  //               ) : (
  //                 <>
  //                   <X className="h-4 w-4 mr-2" />
  //                   Cancel without Refund
  //                 </>
  //               )}
  //             </Button>

  //             <Button
  //               onClick={() => {
  //                 setCancelDialogOpen(false);
  //                 setCancellationReason("");
  //                 setRefundAmount("");
  //               }}
  //               variant="outline"
  //               disabled={isProcessing}
  //             >
  //               Close
  //             </Button>
  //           </div>

  //           {/* Warning Notice */}
  //           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
  //             <div className="flex items-start gap-3">
  //               <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
  //               <div className="text-sm">
  //                 <p className="font-semibold text-yellow-800">
  //                   Important Notice:
  //                 </p>
  //                 <ul className="mt-2 space-y-1 text-yellow-700">
  //                   <li>
  //                     • Cancellation with refund will initiate the refund
  //                     process immediately
  //                   </li>
  //                   <li>
  //                     • Refunds typically take 3-7 business days to reflect in
  //                     customer's account
  //                   </li>
  //                   <li>• Cancellation without refund is irreversible</li>
  //                   <li>
  //                     • Customer will be notified via email about the
  //                     cancellation
  //                   </li>
  //                 </ul>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </DialogContent>
  //     </Dialog>
      
  //   );
  };

  // Add this function to handle file upload
  const router=useRouter()
  const handleUploadDesign = async (e: React.ChangeEvent<HTMLInputElement>, orderId: string) => {
    const file = e.target.files?.[0];
    console.log("🔥🔥🔥🔥🔥🔥file🔥🔥🔥🔥🔥🔥", file)
    console.log("🔥🔥🔥🔥🔥🔥orderId🔥🔥🔥🔥🔥🔥", orderId)
    if (!file) return;
    setUploading(true);
    setUploadedUrl(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/uploadDesign', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      console.log("🔥🔥🔥🔥🔥🔥data🔥🔥🔥🔥🔥🔥", data)
      const payload={
        orderId: orderId,
        designUrl: data.url,
        orderStauts:'delivered'
      }
      const resposnse=await axiosInstance.put(`/seller/updateOrder/${orderId}`, payload)
      console.log("🔥🔥🔥🔥🔥🔥resposnse🔥🔥🔥🔥🔥🔥", resposnse)
      if(resposnse.status==200){
        window.location.reload()
        // router.push('/seller/orders')
      }
      if (data.url) {
        setUploadedUrl(data.url);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDesign = async (orderId: string) => {
    

    try {
      // TODO: Replace with your actual API endpoint

      const payload={
        orderId: orderId,
        designUrl: '',
        orderStauts:'pending'
      }
      const resposnse=await axiosInstance.put(`/seller/updateOrder/${orderId}`, payload);
      console.log("🔥🔥🔥🔥🔥🔥resposnse🔥🔥🔥🔥🔥🔥", resposnse)
      if(resposnse.status==200){
        toast.success("Design deleted successfully");
        window.location.reload()
        // router.push('/seller/orders')
      }

      // setOrderItems((prev) =>
      //   prev.map((item) =>
      //     item.id === orderId ? { ...item, designUrl: '' } : item
      //   )
      // );
    } catch (error) {
      alert("Failed to delete the design.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="mx-auto">
        {/* Breadcrumb */}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Order Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and track all your orders in one place
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-100">
            <p className="text-blue-800 font-medium">
              Total Orders: {orderCounts.All}
            </p>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-wrap gap-2 md:gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name);
                  setCurrentPage(1);
                }}
                className={`relative px-4 py-3 font-medium text-base transition-all flex items-center gap-2
                            ${
                              activeTab === tab.name
                              ? "text-blue-600 bg-blue-50 rounded-lg" 
                                : "text-gray-600 hover:text-gray-800"
                            } 
                            min-w-[150px] text-center justify-center`}
              >
                {tab.icon}
                {formatTabName(tab.name)}
                {loading ? (
                  <TabCountSkeleton />
                ) : (
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      badgeStyles[tab.name]
                    }`}
                  >
                  {tab.count}
                </span>
                )}
              </button>
            ))}
          </div>
          {/* Search Bar */}
          <div className="mt-4 flex items-center gap-2 w-full">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="py-4 px-4 text-left w-[50px]">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={allSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Refund
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Sent Design to Customer
                  </th>
                  <th className="py-4 px-6 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  // Show skeleton rows (match rowsPerPage)
                  Array.from({ length: rowsPerPage }).map((_, idx) => (
                    <TableRowSkeleton columns={9} key={idx} />
                  ))
                ) : paginatedOrders.length > 0 ? (
                  console.log("🔥🔥🔥🔥🔥🔥paginatedOrders🔥🔥🔥🔥🔥🔥", paginatedOrders),
                  paginatedOrders.map((order:any, index:any) => (
                    
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => handleCheckboxChange(order.id)}
                          />
                        </td>

                        <td className="py-4 px-4 font-medium flex items-center gap-2">
                          <span className="bg-gray-100 rounded-md px-2 py-1 text-sm">
                            #{startIndex + index + 1}
                          </span>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(order.id)
                            }
                            title={`Copy Order ID: ${order.id}`}
                            className="text-gray-500 hover:text-blue-600 transition"
                          >
                            <ClipboardCopy className="w-4 h-4" />
                          </button>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-medium">{order.customer}</div>
                          <div className="text-xs text-gray-500">
                            {order.email}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium">{order.date}</div>
                          <div className="text-xs text-gray-500">
                            {order.time}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-medium">{order.items}</td>
                        <td className="py-4 px-4 font-medium text-green-700">
                          {order.price}
                        </td>
                        <td className="py-4 px-4 font-medium text-blue-700">
                          {/* {orderItems && (() => {
                            const item:any = orderItems.find((i:any) => i.id === order.id);
                            if (item && item.isRefunded && item.refundedAmount) {
                              return (
                                <div className="flex flex-col gap-1">
                                  <span className="inline-block align-middle">₹{parseFloat(item.refundedAmount).toFixed(2)}</span>
                                  <span className="inline-block align-middle text-xs text-blue-600">{item.refundStatus}</span>
                                </div>
                              );
                            }
                            return <span className="text-gray-400">-</span>;
                          })()} */}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                              badgeStyles[order.status]
                            }`}
                          >
                            {order.status === "cancellRequested"
                              ? "Cancellation Requested"
                              : order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                              badgeStyles[order.status]
                            }`}
                          >
                            {order.status === "cancellRequested"
                              ? "Cancellation Requested"
                              : order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                setIsVisible((prev) =>
                                  prev === order.id ? null : order.id
                                )
                              }
                              className="p-1.5  rounded-md hover:bg-gray-100 transition-colors"
                            >
                              <ChevronDown
                                className={`h-5 w-5 text-gray-600 transition-transform ${
                                  isVisible === order.id ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                                
                            {/* <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                              <MoreVertical className="h-5 w-5 text-gray-600" />
                            </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setStatusDialogOpen(true);
                                }}>
                                  <Edit className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem onClick={() => {
                                  // TODO: Replace with real shipment fetch logic
                                  setShipmentDialogData({
                                    id: order.id,
                                    pickupLocationId: 0,
                                    shipmentId: 123456,
                                    orderId: Number(order.orderId),
                                    courierServiceId: 0,
                                    shippingCharge: 0,
                                    shipmentStatus: order.status,
                                    ManifestUrl: null,
                                    InvoiceUrl: null,
                                    LabelUrl: null,
                                    AWB: "",
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                    shipmentItems: [],
                                    pickupLocation: {
                                      id: 0,
                                      pickup_location: "",
                                      address: "",
                                      address_2: "",
                                      city: "",
                                      state: "",
                                      country: "",
                                      pin_code: "",
                                      email: "",
                                      phone: "",
                                      name: "",
                                    },
                                  });
                                  setShipmentDialogOpen(true);
                                }}>
                                  <Truck className="w-4 h-4 mr-2" /> Shipment
                                </DropdownMenuItem> */}
                              {/* </DropdownMenuContent>
                            </DropdownMenu> */} 

                          </div>
                        </td>
                      </tr>

                      {isVisible === order.id && (
                        <tr >
                          <td colSpan={10} className="p-4 bg-gray-50">
                            <div className="p-4  bg-white rounded-lg border border-gray-200 ">
                              <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                                {/* Product Details */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                    Product Details
                                  </h3>
                                  <div className="flex gap-4">
                                    <img
                                      src={order.productImage || "/placeholder.svg"}
                                      alt={order.productName}
                                      className="w-32 h-32 object-contain rounded-lg border border-gray-200"
                                    />
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-lg mb-2">
                                        {order.productName}
                                      </h4>
                                      <p className="text-gray-600 mb-3">
                                        {order.productDescription}
                                      </p>
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">Product ID:</span>
                                          <span className="font-medium text-sm">{order.productId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">Price:</span>
                                          <span className="font-medium text-green-600">{order.price}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">Quantity:</span>
                                          <span className="font-medium">{order.items}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Details */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                    Order Details
                                  </h3>
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">Order ID:</span>
                                      <span className="font-medium text-sm">{order.orderId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">Order Item ID:</span>
                                      <span className="font-medium text-sm">{order.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">Order Date:</span>
                                      <span className="font-medium">{order.date} at {order.time}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">Status:</span>
                                      <Badge className={badgeStyles[order.status]}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">Customer:</span>
                                      <span className="font-medium">{order.customer}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">Email:</span>
                                      <span className="font-medium text-sm">{order.email}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Additional Product Information */}
                              <div className="mt-6 pt-4 border-t flex justify-between items-center">
                                <div className="">
                                   {(() => {
                                const orderItem = orderItems.find(item => item.id === order.id);
                                if (orderItem?.product?.aboutProduct?.about) {
                                  return (
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-2">About Product</h4>
                                      <p className="text-gray-600 text-sm">
                                        {orderItem.product.aboutProduct.about}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                                </div>
                                {
                                  order.designUrl
                                    ? (
                                      <div className="mt-2 text-green-600 text-xs break-all flex items-center gap-2">
                                        <a
                                          href={order.designUrl}
                                          download={`design_${order.id}.pdf`}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center'
                                          }}
                                          title="Download Design"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <FaFilePdf size={40} />
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteDesign(order.id)}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center'
                                          }}
                                          title="Delete Design"
                                        >
                                          <FaTrash size={18} color="red" />
                                        </button>
                                      </div>
                                    )
                                    : (
                                      <div>
                                        <Button className='cursor-pointer' onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                          {uploading ? 'Uploading...' : 'Upload Design'}
                                        </Button>
                                        <input
                                          type="file"
                                          ref={fileInputRef}
                                          style={{ display: 'none' }}
                                          accept="image/*,application/pdf"
                                          onChange={(e) => handleUploadDesign(e, order.id)}
                                        />
                                        {/* {uploadedUrl && (
                                          <div className="mt-2 text-green-600 text-xs break-all">
                                            Uploaded: <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">{uploadedUrl}</a>
                                          </div>
                                        )} */}
                                      </div>
                                    )
                                }
                                
                              </div>
                              
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 text-gray-400 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          No orders found
                        </h3>
                        <p className="text-gray-500">
                          There are currently no orders matching your criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
            {/* Rows Per Page Dropdown */}
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">Rows per page:</p>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded-md p-1.5 text-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            {/* Pagination Info */}
            <p className="text-sm text-gray-700">
              {orderCounts[activeTab as keyof typeof orderCounts] > 0
                ? `Showing ${startIndex + 1} to ${Math.min(
                    startIndex + rowsPerPage,
                    orderCounts[activeTab as keyof typeof orderCounts]
                  )} of ${orderCounts[activeTab as keyof typeof orderCounts]}`
                : "No records to display"}
            </p>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed text-gray-400"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-md text-sm ${
                      currentPage === page 
                        ? "bg-blue-600 text-white" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                  )
                )}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed text-gray-400"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Dialog */}
      <StatusUpdateDialog />
      {/* Cancel/Refund Dialog */}
      {/* <CancelDialog /> */}
      {/* <ShipmentDialog open={shipmentDialogOpen} onOpenChange={setShipmentDialogOpen} shipment={shipmentDialogData} /> */}
    </div>
  );
};

export default Productspage;

