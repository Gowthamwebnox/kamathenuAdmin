import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface UpdateOrderStatusProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus?: string;
}

const statusOptions = [
  {
    value: "pending",
    label: "Pending",
    icon: Clock,
    description: "Order has been placed but not yet processed",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  {
    value: "shipped",
    label: "Shipped",
    icon: Truck,
    description: "Order has been shipped to the customer",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    value: "delivered",
    label: "Delivered",
    icon: CheckCircle2,
    description: "Order has been delivered to the customer",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    description: "Order has been cancelled",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
];

export function UpdateOrderStatus({
  orderId,
  open,
  onOpenChange,
  currentStatus,
}: UpdateOrderStatusProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderDetails", orderId] });
      toast.success("Order status updated successfully");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });

  const handleUpdateStatus = () => {
    if (selectedStatus) {
      updateStatusMutation.mutate(selectedStatus);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {currentStatus && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>Current Status: {currentStatus}</span>
            </div>
          )}

          <div className="space-y-2">
            {statusOptions.map((status) => {
              const Icon = status.icon;
              const isSelected = selectedStatus === status.value;
              const isCurrentStatus = currentStatus === status.value;

              return (
                <motion.div
                  key={status.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      status.bgColor
                    } ${status.borderColor} ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-primary"
                        : "hover:bg-opacity-70"
                    } ${
                      isCurrentStatus ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => setSelectedStatus(status.value)}
                    disabled={isCurrentStatus}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${status.color}`} />
                      <div>
                        <div className={`font-medium ${status.color}`}>
                          {status.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {status.description}
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={!selectedStatus || updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? (
              <>
                <motion.div
                  className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
