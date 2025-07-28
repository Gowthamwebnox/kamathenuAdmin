import {
  Home,
  Package,
  BadgeIndianRupee,
  LayoutGrid,
  User,
  Users,
  Upload,
  BarChart3,
  HelpCircle,
  ReceiptIndianRupee,
  MapPin,
  Truck,
  Settings,
  CreditCard,
  Percent,
  } from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  description?: string;
}

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: Home,
    description: "View your dashboard overview",
  },
  {
    id: "products",
    label: "Products",
    href: "/prodcuts",
    icon: Package,
    description: "Manage your products",
  },
  {
    id: "sales",
    label: "Sales",
    href: "/sales",
    icon: BadgeIndianRupee,
    description: "View sales and orders",
  },
  {
    id: "categories",
    label: "Categories",
    href: "/categories",
    icon: LayoutGrid,
    description: "Manage product categories",
  },
  {
    id: "customer",
    label: "Customer",
    href: "/customer",
    icon: User,
    description: "Manage customer information",
  },
  {
    id: "seller",
    label: "Seller",
    href: "/seller",
    icon: Users,
    description: "Manage seller accounts",
  },
  // {
  //   id: "upload",
  //   label: "Upload files",
  //   href: "/upload",
  //   icon: Upload,
  //   description: "Upload and manage files",
  // },
  {
    id: "settings",
    label: "Profile",
    href: "/settings",
    icon: Settings,
    description: "Update your profile",
  },
  {
    id: "payment",
    label: "Payment",
    href: "/payments",
    icon: CreditCard,
    description: "Manage your payments",
  },

  // Commented out for future use
  // {
  //   id: "pickup",
  //   label: "Pickup",
  //   href: "/pickup",
  //   icon: MapPin,
  //   description: "pickup address",
  // },
  // {
  //   id: "shipment ",
  //   label: "Shipment",
  //   href: "/shipments",
  //   icon: Truck,
  //   description: "shipment address",
  // },
  // {
  //   id: "helper  ",
  //   label: "Helper",
  //   href: "/helpers",
  //   icon: HelpCircle,
  //   description: "helper address",
  // },
  // {
  //   id: "settlement",
  //   label: "Settlement",
  //   href: "/settlement",
  //   icon: BadgeIndianRupee,
  //   description: "settlement",
  // },
  // {
  //   id: "commission",
  //   label: "Commission",
  //   href: "/commission",
  //   icon: Percent,
  //   description: "commission",
  // },
  // {
  //   id: "invoice",
  //   label: "Invoice",
  //   href: "/invoice",
  //   icon: ReceiptIndianRupee,
  //   description: "invoice",
  // },
]; 