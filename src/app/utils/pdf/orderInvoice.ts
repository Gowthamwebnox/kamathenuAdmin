import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
}

interface User {
  name: string;
  email: string;
}

interface Payment {
  paymentGateway: string;
  paymentStatus: string;
  transactionId: string;
  paymentDate: string;
}

interface Seller {
  storeName: string;
  upiId: string;
}

interface ProductVariant {
  title: string;
  product: {
    name: string;
  };
}

interface OrderDetails {
  orderId: string;
  createdAt: string;
  quantity: number;
  priceAtPurchase: string;
  order: {
    totalAmount: string;
    paymentStatus: string;
    payments: Payment[];
    user: User;
    shippingAddress: ShippingAddress;
  };
  productVariant: ProductVariant;
  seller: Seller;
}

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

export const generateOrderInvoice = async (orderDetails: OrderDetails) => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add logo
  const logoImg = new Image();
  logoImg.src = "/assets/logo.png";
  await new Promise((resolve) => {
    logoImg.onload = resolve;
  });
  doc.addImage(logoImg, "PNG", 14, 10, 40, 20);

  // Add invoice header
  doc.setFontSize(20);
  doc.text("INVOICE", 105, 20, { align: "center" });
  
  // Add invoice details
  doc.setFontSize(10);
  doc.text(`Invoice Number: ${orderDetails.orderId}`, 14, 40);
  doc.text(`Date: ${formatDate(orderDetails.createdAt)}`, 14, 45);
  
  // Add customer details
  doc.setFontSize(12);
  doc.text("Bill To:", 14, 60);
  doc.setFontSize(10);
  doc.text(orderDetails.order.user.name, 14, 65);
  doc.text(orderDetails.order.user.email, 14, 70);
  doc.text([
    orderDetails.order.shippingAddress.street,
    `${orderDetails.order.shippingAddress.city}, ${orderDetails.order.shippingAddress.state}`,
    `${orderDetails.order.shippingAddress.country} - ${orderDetails.order.shippingAddress.zipCode}`,
    `Phone: ${orderDetails.order.shippingAddress.phone}`
  ], 14, 75);

  // Add seller details
  doc.setFontSize(12);
  doc.text("From:", 105, 60);
  doc.setFontSize(10);
  doc.text(orderDetails.seller.storeName, 105, 65);
  doc.text(`UPI ID: ${orderDetails.seller.upiId}`, 105, 70);

  // Add items table
  autoTable(doc, {
    startY: 100,
    head: [['Item', 'Variant', 'Quantity', 'Price']],
    body: [[
      orderDetails.productVariant.product.name,
      orderDetails.productVariant.title,
      orderDetails.quantity,
      formatPrice(orderDetails.priceAtPurchase),
    ]],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 5 },
  });

  // Add payment details
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(12);
  doc.text("Payment Details:", 14, finalY + 20);
  doc.setFontSize(10);
  doc.text([
    `Status: ${orderDetails.order.paymentStatus}`,
    `Method: ${orderDetails.order.payments[0]?.paymentGateway || 'N/A'}`,
    `Transaction ID: ${orderDetails.order.payments[0]?.transactionId || 'N/A'}`,
    `Payment Date: ${orderDetails.order.payments[0]?.paymentDate ? formatDate(orderDetails.order.payments[0].paymentDate) : 'N/A'}`
  ], 14, finalY + 25);

  // Add total
  doc.setFontSize(12);
  doc.text(`Total Amount: ${formatPrice(orderDetails.order.totalAmount)}`, 14, finalY + 50);

  // Add footer
  doc.setFontSize(8);
  doc.text("Thank you for your business!", 105, 280, { align: "center" });

  // Save the PDF
  doc.save(`invoice-${orderDetails.orderId}.pdf`);
}; 