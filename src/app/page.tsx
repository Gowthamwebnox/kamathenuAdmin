"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Box, MoreVertical, Package, ShoppingBag, Store, Truck, Users } from "lucide-react"
import { DashboardHeader } from "@/components/common/dashboard-header"
import { StatCard } from "@/components/common/stat-card"
import { OrderStatusCard } from "@/components/common/order-status-card"
import { RevenueChart } from "@/components/common/revenue-chart"
import { TopCategoryList } from "@/components/common/top-category-list"
import { CustomerDonutChart } from "@/components/common/customer-donut-chart"
import { RevenueLineChart } from "@/components/common/revenue-line-chart"
import Link from "next/link"
import { SessionProvider } from "next-auth/react"
import { formatCurrency } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "./(stateManagement)/userStore"
import axiosInstance from "./utils/axiosInstance"

async function getDashboardStats() {
  const res = await axiosInstance.get("/admin/fetchDashboard")
  //  await fetch("http://localhost:3001/api/admin/dashboard/stats", {
  //   cache: 'no-store',
  // });
  
  if (res.status !== 200) {
    throw new Error('Failed to fetch dashboard stats');
  }
  
  return res.data;
}

export default function DashboardPage() {
  const router = useRouter()
  const [userDataParsed, setUserDataParsed] = useState<any>(null)

  useEffect(() => {
    // Only access localStorage on the client side
    const userData = localStorage.getItem("user-store")
    if (userData) {
      setUserDataParsed(JSON.parse(userData))
    }
  }, [])


  const [stats, setStats] = useState({
    users: { total: 12, new: 0, returning: 0 },
    orders: { total: 1, byStatus: {}, recent: 0 },
    sellers: { total: 1 },
    revenue: { total: 13000 },
    last6DaysUsers: 0,
    last6DaysOrders: 0,
    last6DaysSellers: 0,
    totalUsers: 0, // Added missing property
    totalProducts: 0, // Added missing property
    totalOrders: 0,
    totalSellers: 0,
    // categories: []
  });

  useEffect(() => {
    // Check authentication only after userDataParsed is loaded
    if (userDataParsed === null) {
      return; // Still loading
    }
    
    if (!userDataParsed) {
      router.push('/login')
      return
    }
    
    const fetchStats = async () => {
      const data = await getDashboardStats();
      setStats(data);
    };
    fetchStats();
  }, [userDataParsed, router]);
  
  // Calculate percentage changes (you might want to store these in the database)
  const userChange = stats.totalUsers > 0 
  ? `+${Math.round((stats.last6DaysUsers / stats.totalUsers) * 100)}%` 
  : "+0%";
  const orderChange = stats.totalOrders > 0 
  ? `+${Math.round((stats.last6DaysOrders / stats.totalOrders) * 100)}%` 
  : "+0%"; // This should come from comparing with previous period
  const sellerChange = stats.totalSellers > 0 
  ? `+${Math.round((stats.last6DaysSellers / stats.totalSellers) * 100)}%` 
  : "+0%"; // This should come from comparing with previous period

  // Calculate customer distribution percentage
  // const totalCustomers = stats.users.new + stats.users.returning;
  // const newCustomerPercentage = totalCustomers > 0 
  //   ? Math.round((stats.users.new / totalCustomers) * 100) 
  //   : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Total active users" 
            value={stats.last6DaysUsers.toString()}
            change={userChange}
            period="Last 6 days"
            icon={""}
            iconBg=""
            avatars={["/assets/icons/Avatar.png", "/assets/icons/Avatar.png", "/assets/icons/Avatar.png"]}
            bgColor="bg-[linear-gradient(91.14deg,#DAFAE5_6.08%,#BDF4D6_98.91%)]"
          />

          <StatCard
            title="Total Orders"
            value={stats.last6DaysOrders.toString()}
            change={orderChange}
            period="Last 6 days"
            icon={"/assets/icons/orderTrack.png"}
            iconBg="bg-purple-500"
            bgColor="bg-[linear-gradient(90deg,#F4E4FF_0%,#E7CBFF_92.26%)]"
          />

          <StatCard
            title="Total Sellers"
            value={stats.last6DaysSellers.toString()}
            change={sellerChange}
            period="Last 6 days"
            icon={"/assets/icons/shop.png"}
            iconBg="bg-orange-500"
            bgColor="bg-[linear-gradient(90.71deg,#FFEDE1_3.9%,#FFDAC7_97.48%)]"
          />
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          {/* Order Status Cards */}
          {/* <div className="md:col-span-4 space-y-4 bg-white p-4 rounded-xl shadow-sm h-full">
            <h3 className="text-lg font-medium mb-4">Orders Overview</h3>
            <OrderStatusCard
              title="Orders Placed"
              value={stats.orders.byStatus.pending?.toString() || "0"}
              icon={<ShoppingBag className="h-5 w-5 text-blue-500" />}
              bgColor="bg-blue-50"
              textColor="text-blue-500"
            />

            <OrderStatusCard
              title="Confirmed Orders"
              value={stats.orders.byStatus.shipped?.toString() || "0"}
              icon={<Package className="h-5 w-5 text-green-500" />}
              bgColor="bg-green-50"
              textColor="text-green-500"
            />

            <OrderStatusCard
              title="Processed Orders"
              value={stats.orders.byStatus.delivered?.toString() || "0"}
              icon={<Box className="h-5 w-5 text-red-500" />}
              bgColor="bg-red-50"
              textColor="text-red-500"
            />

            <OrderStatusCard
              title="Shipped Orders"
              value={stats.orders.byStatus.cancelled?.toString() || "0"}
              icon={<Truck className="h-5 w-5 text-yellow-500" />}
              bgColor="bg-yellow-50"
              textColor="text-yellow-500"
            />
          </div> */}

          {/* Revenue Chart */}
          <div className="md:col-span-12 h-full">
            <Card className="bg-[#FFFFF0] h-full">
              <CardContent className="p-0">
                <RevenueChart totalRevenue={stats?.totalProducts} />
              </CardContent>
            </Card>
          </div>

          {/* <div className="md:col-span-12 h-full">
            <TopCategoryList categories={stats.categories} />
          </div> */}
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
          <div className="md:col-span-4 h-full">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-lg">Total Customers</h3>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <CustomerDonutChart percentage={newCustomerPercentage} />
                <div className="flex justify-center gap-8 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-500">New ({stats.users.new})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
                    <span className="text-sm text-gray-500">Returning ({stats.users.returning})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-medium text-lg">{formatCurrency(stats.revenue.total)}</h3>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-xs text-gray-500">This Month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-xs text-gray-500">Last Month</span>
                    </div>
                  </div>
                </div>
                <RevenueLineChart />
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Recent Orders</span>
                    <span className="text-sm font-medium">{stats.orders.recent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Categories</span>
                    <span className="text-sm font-medium">{stats.categories.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div> */}
      </main>
    </div>
  )
}
