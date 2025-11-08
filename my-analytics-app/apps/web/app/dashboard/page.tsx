"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  ShoppingCart,
  Clock,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";

// Use relative API routes (same origin)
const API_BASE = "/api";

interface Stats {
  totalSpend: number;
  totalInvoices: number;
  totalVendors: number;
  totalCustomers: number;
  pendingAmount: number;
}

interface InvoiceTrend {
  date: string;
  amount: number;
  count: number;
}

interface TopVendor {
  id: number;
  name: string;
  category: string | null;
  totalSpend: number;
  invoiceCount: number;
}

interface CategorySpend {
  category: string;
  amount: number;
}

interface Invoice {
  id: number;
  invoiceNo: string;
  amount: number;
  date: string;
  status: string;
  vendor: { name: string };
  customer: { name: string };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [previousStats, setPreviousStats] = useState<Stats | null>(null);
  const [invoiceTrends, setInvoiceTrends] = useState<InvoiceTrend[]>([]);
  const [topVendors, setTopVendors] = useState<TopVendor[]>([]);
  const [categorySpend, setCategorySpend] = useState<CategorySpend[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendsRes, vendorsRes, categoryRes, invoicesRes] =
        await Promise.all([
          fetch(`${API_BASE}/stats`),
          fetch(`${API_BASE}/invoice-trends?period=month`),
          fetch(`${API_BASE}/vendors/top10`),
          fetch(`${API_BASE}/category-spend`),
          fetch(`${API_BASE}/invoices?limit=50`),
        ]);

      // Check if responses are ok
      if (!statsRes.ok) {
        throw new Error(`Stats API error: ${statsRes.status}`);
      }
      if (!trendsRes.ok) {
        throw new Error(`Trends API error: ${trendsRes.status}`);
      }
      if (!vendorsRes.ok) {
        throw new Error(`Vendors API error: ${vendorsRes.status}`);
      }
      if (!categoryRes.ok) {
        throw new Error(`Category API error: ${categoryRes.status}`);
      }
      if (!invoicesRes.ok) {
        throw new Error(`Invoices API error: ${invoicesRes.status}`);
      }

      const [statsData, trendsData, vendorsData, categoryData, invoicesData] =
        await Promise.all([
          statsRes.json(),
          trendsRes.json(),
          vendorsRes.json(),
          categoryRes.json(),
          invoicesRes.json(),
        ]);

      setStats(statsData);
      setInvoiceTrends(trendsData || []);
      setTopVendors(vendorsData || []);
      setCategorySpend(categoryData || []);
      setInvoices(invoicesData.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Set empty/default values on error
      setStats(null);
      setInvoiceTrends([]);
      setTopVendors([]);
      setCategorySpend([]);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/invoices?search=${encodeURIComponent(search)}&limit=50`
      );
      const data = await res.json();
      setInvoices(data.data || []);
      setSuggestions([]);
    } catch (error) {
      console.error("Error searching invoices:", error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value.length > 1) {
      const filtered = invoices
        .filter(
          (inv) =>
            inv.invoiceNo.toLowerCase().includes(value.toLowerCase()) ||
            inv.vendor.name.toLowerCase().includes(value.toLowerCase()) ||
            inv.customer.name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5)
        .map((inv) => inv.invoiceNo);
      setSuggestions(Array.from(new Set(filtered)));
    } else {
      setSuggestions([]);
    }
  };

  const exportToCSV = () => {
    if (invoices.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Invoice No",
      "Vendor",
      "Customer",
      "Amount",
      "Date",
      "Status",
    ];
    const rows = invoices.map((inv) => [
      inv.invoiceNo,
      inv.vendor.name,
      inv.customer.name,
      inv.amount,
      new Date(inv.date).toLocaleDateString(),
      inv.status,
    ]);

    const csv =
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getStatusDistribution = () => {
    const paid = invoices.filter((inv) => inv.status === "paid").length;
    const pending = invoices.filter((inv) => inv.status === "pending").length;
    const overdue = invoices.filter((inv) => inv.status === "overdue").length;

    return [
      { name: "Paid", value: paid, color: "#10b981" },
      { name: "Pending", value: pending, color: "#f59e0b" },
      { name: "Overdue", value: overdue, color: "#ef4444" },
    ];
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const COLORS = [
    "hsl(217, 91%, 60%)",
    "hsl(262, 80%, 50%)",
    "hsl(166, 76%, 40%)",
    "hsl(46, 93%, 54%)",
    "hsl(10, 78%, 54%)",
  ];

  if (loading) {
    return (
      <div className='px-8 py-8 flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='inline-block mb-4'>
            <div className='w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin' />
          </div>
          <p className='text-muted-foreground'>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state if stats failed to load and no data available
  if (!stats && !loading) {
    return (
      <div className='px-8 py-8'>
        <h1 className='text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-magenta-400 bg-clip-text text-transparent'>
          Dashboard
        </h1>
        <div className='bg-red-950/30 border border-red-500/30 rounded-lg p-8 max-w-2xl'>
          <h2 className='text-lg font-semibold text-red-300 mb-2'>
            ⚠️ Failed to Load Dashboard Data
          </h2>
          <p className='text-muted-foreground mb-4'>
            Unable to connect to the database. Please verify:
          </p>
          <ul className='space-y-2 text-sm text-muted-foreground mb-6'>
            <li className='flex items-start gap-2'>
              <span className='text-cyan-400 mt-1'>•</span>
              <span>Database connection string configured in <code className='bg-background px-2 py-1 rounded text-cyan-300'>.env.local</code></span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-cyan-400 mt-1'>•</span>
              <span>Prisma migrations: <code className='bg-background px-2 py-1 rounded text-cyan-300'>pnpm prisma migrate dev</code></span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-cyan-400 mt-1'>•</span>
              <span>Database server is running and accessible</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-cyan-400 mt-1'>��</span>
              <span>Check console and server logs for details</span>
            </li>
          </ul>
          <button
            onClick={fetchData}
            className='px-6 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white rounded-lg shadow-lg shadow-cyan-500/30 transition-all'>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='px-8 py-8 space-y-8'>
      <div className='flex flex-col gap-6 mb-8'>
        <div>
          <h1 className='text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-magenta-400 bg-clip-text text-transparent'>
            Dashboard
          </h1>
          <p className='text-muted-foreground mt-2'>
            Overview of your financial metrics and performance
          </p>
        </div>

        {/* Quick Filters */}
        <div className='flex flex-wrap gap-3'>
          <Button
            onClick={() => {
              const today = new Date();
              const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
              setDateRange({
                start: thirtyDaysAgo.toISOString().split("T")[0],
                end: today.toISOString().split("T")[0],
              });
            }}
            className='flex items-center gap-2 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/30'>
            <Calendar className='w-4 h-4' />
            Last 30 Days
          </Button>
          <Button
            onClick={() => {
              const today = new Date();
              const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
              setDateRange({
                start: quarterAgo.toISOString().split("T")[0],
                end: today.toISOString().split("T")[0],
              });
            }}
            className='flex items-center gap-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30'>
            <Calendar className='w-4 h-4' />
            Last 90 Days
          </Button>
          <Button
            onClick={() => setDateRange({ start: "", end: "" })}
            className='flex items-center gap-2 bg-magenta-600/30 hover:bg-magenta-600/50 text-magenta-200 border border-magenta-500/30'>
            <Calendar className='w-4 h-4' />
            All Time
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
        <Card className='border border-cyan-500/30 bg-gradient-to-br from-cyan-950/50 to-cyan-900/30 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all'>
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <CardDescription className='text-xs font-medium uppercase tracking-wide text-cyan-300'>
                  Total Spend
                </CardDescription>
                <CardTitle className='text-3xl mt-2 text-cyan-100'>
                  $
                  {stats?.totalSpend
                    ? stats.totalSpend.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })
                    : "0.00"}
                </CardTitle>
                {stats && previousStats && (
                  <div className={`text-xs mt-2 flex items-center gap-1 ${calculateTrend(stats.totalSpend, previousStats.totalSpend) >= 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {calculateTrend(stats.totalSpend, previousStats.totalSpend) >= 0 ? (
                      <ArrowUpRight className='w-3 h-3' />
                    ) : (
                      <ArrowDownRight className='w-3 h-3' />
                    )}
                    {Math.abs(calculateTrend(stats.totalSpend, previousStats.totalSpend)).toFixed(1)}% vs last period
                  </div>
                )}
              </div>
              <div className='bg-gradient-to-br from-cyan-500 to-cyan-600 p-3 rounded-xl shadow-lg shadow-cyan-500/50'>
                <TrendingUp className='w-5 h-5 text-white' />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className='border border-purple-500/30 bg-gradient-to-br from-purple-950/50 to-purple-900/30 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all'>
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <CardDescription className='text-xs font-medium uppercase tracking-wide text-purple-300'>
                  Total Invoices
                </CardDescription>
                <CardTitle className='text-3xl mt-2 text-purple-100'>
                  {stats?.totalInvoices || 0}
                </CardTitle>
                {stats && previousStats && (
                  <div className={`text-xs mt-2 flex items-center gap-1 ${calculateTrend(stats.totalInvoices, previousStats.totalInvoices) >= 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {calculateTrend(stats.totalInvoices, previousStats.totalInvoices) >= 0 ? (
                      <ArrowUpRight className='w-3 h-3' />
                    ) : (
                      <ArrowDownRight className='w-3 h-3' />
                    )}
                    {Math.abs(calculateTrend(stats.totalInvoices, previousStats.totalInvoices)).toFixed(1)}% vs last period
                  </div>
                )}
              </div>
              <div className='bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg shadow-purple-500/50'>
                <ShoppingCart className='w-5 h-5 text-white' />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className='border border-magenta-500/30 bg-gradient-to-br from-magenta-950/50 to-magenta-900/30 hover:border-magenta-400/60 hover:shadow-lg hover:shadow-magenta-500/20 transition-all'>
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <CardDescription className='text-xs font-medium uppercase tracking-wide text-magenta-300'>
                  Total Vendors
                </CardDescription>
                <CardTitle className='text-3xl mt-2 text-magenta-100'>
                  {stats?.totalVendors || 0}
                </CardTitle>
                {stats && previousStats && (
                  <div className={`text-xs mt-2 flex items-center gap-1 ${calculateTrend(stats.totalVendors, previousStats.totalVendors) >= 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {calculateTrend(stats.totalVendors, previousStats.totalVendors) >= 0 ? (
                      <ArrowUpRight className='w-3 h-3' />
                    ) : (
                      <ArrowDownRight className='w-3 h-3' />
                    )}
                    {Math.abs(calculateTrend(stats.totalVendors, previousStats.totalVendors)).toFixed(1)}% vs last period
                  </div>
                )}
              </div>
              <div className='bg-gradient-to-br from-magenta-500 to-magenta-600 p-3 rounded-xl shadow-lg shadow-magenta-500/50'>
                <Package className='w-5 h-5 text-white' />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className='border border-blue-500/30 bg-gradient-to-br from-blue-950/50 to-blue-900/30 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 transition-all'>
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <CardDescription className='text-xs font-medium uppercase tracking-wide text-blue-300'>
                  Total Customers
                </CardDescription>
                <CardTitle className='text-3xl mt-2 text-blue-100'>
                  {stats?.totalCustomers || 0}
                </CardTitle>
                {stats && previousStats && (
                  <div className={`text-xs mt-2 flex items-center gap-1 ${calculateTrend(stats.totalCustomers, previousStats.totalCustomers) >= 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {calculateTrend(stats.totalCustomers, previousStats.totalCustomers) >= 0 ? (
                      <ArrowUpRight className='w-3 h-3' />
                    ) : (
                      <ArrowDownRight className='w-3 h-3' />
                    )}
                    {Math.abs(calculateTrend(stats.totalCustomers, previousStats.totalCustomers)).toFixed(1)}% vs last period
                  </div>
                )}
              </div>
              <div className='bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/50'>
                <Users className='w-5 h-5 text-white' />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className='border border-red-500/30 bg-gradient-to-br from-red-950/50 to-red-900/30 hover:border-red-400/60 hover:shadow-lg hover:shadow-red-500/20 transition-all'>
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <CardDescription className='text-xs font-medium uppercase tracking-wide text-red-300'>
                  Pending Amount
                </CardDescription>
                <CardTitle className='text-3xl mt-2 text-red-100'>
                  $
                  {stats?.pendingAmount
                    ? stats.pendingAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })
                    : "0.00"}
                </CardTitle>
                {stats && previousStats && (
                  <div className={`text-xs mt-2 flex items-center gap-1 ${calculateTrend(stats.pendingAmount, previousStats.pendingAmount) >= 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {calculateTrend(stats.pendingAmount, previousStats.pendingAmount) >= 0 ? (
                      <ArrowUpRight className='w-3 h-3' />
                    ) : (
                      <ArrowDownRight className='w-3 h-3' />
                    )}
                    {Math.abs(calculateTrend(stats.pendingAmount, previousStats.pendingAmount)).toFixed(1)}% vs last period
                  </div>
                )}
              </div>
              <div className='bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg shadow-red-500/50'>
                <Clock className='w-5 h-5 text-white' />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Status Distribution + Recent Activity */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='border border-emerald-500/30 bg-gradient-to-br from-card to-card/50'>
          <CardHeader>
            <CardTitle className='text-emerald-100'>Invoice Status Overview</CardTitle>
            <CardDescription>Distribution of pending, paid, and overdue invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-3 gap-4'>
              {getStatusDistribution().map((status) => (
                <div key={status.name} className='text-center'>
                  <div className='text-3xl font-bold text-foreground mb-1'>
                    {status.value}
                  </div>
                  <div className='text-xs uppercase tracking-wide text-muted-foreground mb-2'>
                    {status.name}
                  </div>
                  <div
                    className='h-2 rounded-full'
                    style={{
                      backgroundColor: status.color,
                      width: "100%",
                      opacity: 0.3,
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='border border-orange-500/30 bg-gradient-to-br from-card to-card/50'>
          <CardHeader>
            <CardTitle className='text-orange-100'>Recent Activity</CardTitle>
            <CardDescription>Latest 5 invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.slice(0, 5).length > 0 ? (
              <div className='space-y-3'>
                {invoices.slice(0, 5).map((inv) => (
                  <div
                    key={inv.id}
                    className='flex items-center justify-between p-3 rounded-lg bg-orange-950/30 border border-orange-500/20 hover:border-orange-400/40 transition-all'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-foreground truncate'>
                        {inv.invoiceNo}
                      </p>
                      <p className='text-xs text-muted-foreground truncate'>
                        {inv.vendor.name}
                      </p>
                    </div>
                    <div className='text-right ml-2'>
                      <p className='text-sm font-semibold text-orange-200'>
                        ${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {new Date(inv.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                <p>No invoices yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='border border-cyan-500/30 bg-gradient-to-br from-card to-card/50'>
          <CardHeader>
            <CardTitle className='text-lg text-cyan-100'>Invoice Trends</CardTitle>
            <CardDescription>Monthly invoice amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={320}>
              <LineChart data={invoiceTrends}>
                <CartesianGrid strokeDasharray='3 3' stroke='hsl(210 40% 25%)' />
                <XAxis dataKey='date' stroke='hsl(210 40% 70%)' />
                <YAxis stroke='hsl(210 40% 70%)' />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(210 40% 15%)',
                    border: '1px solid hsl(210 40% 25%)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  }}
                />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='amount'
                  stroke='hsl(260 95% 65%)'
                  strokeWidth={3}
                  dot={{ fill: 'hsl(260 95% 65%)', r: 5 }}
                  activeDot={{ r: 7 }}
                  name='Amount'
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='border border-purple-500/30 bg-gradient-to-br from-card to-card/50'>
          <CardHeader>
            <CardTitle className='text-lg text-purple-100'>Top 10 Vendors</CardTitle>
            <CardDescription>By total spend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={320}>
              <BarChart data={topVendors}>
                <CartesianGrid strokeDasharray='3 3' stroke='hsl(210 40% 25%)' />
                <XAxis
                  dataKey='name'
                  angle={-45}
                  textAnchor='end'
                  height={100}
                  stroke='hsl(210 40% 70%)'
                />
                <YAxis stroke='hsl(210 40% 70%)' />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(210 40% 15%)',
                    border: '1px solid hsl(210 40% 25%)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  }}
                />
                <Bar dataKey='totalSpend' fill='hsl(290 100% 55%)' radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='lg:col-span-2 border border-magenta-500/30 bg-gradient-to-br from-card to-card/50'>
          <CardHeader>
            <CardTitle className='text-lg text-magenta-100'>Spend by Category</CardTitle>
            <CardDescription>
              Distribution of spending by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={320}>
              <PieChart>
                <Pie
                  data={categorySpend}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ category, percent }) =>
                    `${category}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill='#8884d8'
                  dataKey='amount'>
                  {categorySpend.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(210 40% 15%)',
                    border: '1px solid hsl(210 40% 25%)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className='border border-cyan-500/30 bg-gradient-to-br from-card to-card/50'>
        <CardHeader className='border-b border-cyan-500/20'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-lg text-cyan-100'>Invoices</CardTitle>
              <CardDescription>Search and browse invoices</CardDescription>
            </div>
            <span className='text-sm font-medium text-cyan-300/80'>
              {invoices.length} records
            </span>
          </div>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='flex gap-3 mb-6'>
            <div className='flex-1 relative'>
              <Input
                id='search-input'
                placeholder='Search by invoice number, vendor, or customer... (Ctrl+K)'
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className='pr-10 bg-background border-cyan-500/30 text-foreground placeholder:text-muted-foreground'
              />
              {suggestions.length > 0 && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-card border border-cyan-500/30 rounded-lg shadow-lg z-10'>
                  {suggestions.map((sugg, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearch(sugg);
                        setSuggestions([]);
                      }}
                      className='w-full text-left px-4 py-2 hover:bg-cyan-950/50 text-cyan-200 border-b border-cyan-500/10 last:border-b-0 transition-colors'>
                      {sugg}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={handleSearch}
              className='bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white px-6 shadow-lg shadow-cyan-500/30'>
              Search
            </Button>
            <Button
              onClick={exportToCSV}
              className='bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-6 shadow-lg shadow-emerald-500/30 flex items-center gap-2'>
              <Download className='w-4 h-4' />
              Export CSV
            </Button>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-cyan-500/20'>
                  <th className='text-left p-4 font-semibold text-sm text-cyan-200 uppercase tracking-wide'>
                    Invoice No
                  </th>
                  <th className='text-left p-4 font-semibold text-sm text-cyan-200 uppercase tracking-wide'>
                    Vendor
                  </th>
                  <th className='text-left p-4 font-semibold text-sm text-cyan-200 uppercase tracking-wide'>
                    Customer
                  </th>
                  <th className='text-left p-4 font-semibold text-sm text-cyan-200 uppercase tracking-wide'>
                    Amount
                  </th>
                  <th className='text-left p-4 font-semibold text-sm text-cyan-200 uppercase tracking-wide'>
                    Date
                  </th>
                  <th className='text-left p-4 font-semibold text-sm text-cyan-200 uppercase tracking-wide'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className='border-b border-cyan-500/10 hover:bg-cyan-950/30 transition-colors'>
                      <td className='p-4 font-medium text-cyan-50'>
                        {invoice.invoiceNo}
                      </td>
                      <td className='p-4 text-cyan-200'>{invoice.vendor.name}</td>
                      <td className='p-4 text-cyan-200'>
                        {invoice.customer.name}
                      </td>
                      <td className='p-4 font-semibold text-cyan-100'>
                        $
                        {invoice.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className='p-4 text-cyan-300'>
                        {new Date(invoice.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className='p-4 flex items-center gap-2'>
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-block ${
                            invoice.status === "paid"
                              ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/50"
                              : invoice.status === "pending"
                                ? "bg-amber-500/20 text-amber-200 border border-amber-500/50"
                                : "bg-red-500/20 text-red-200 border border-red-500/50"
                          }`}>
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                        </span>
                        {invoice.status === "pending" && (
                          <Button
                            size='sm'
                            className='h-6 px-2 text-xs bg-emerald-600/50 hover:bg-emerald-600 text-emerald-200 border border-emerald-500/50'
                            onClick={() =>
                              alert(
                                `Mark ${invoice.invoiceNo} as paid (API integration needed)`
                              )
                            }>
                            <CheckCircle className='w-3 h-3' />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className='p-12'>
                      <div className='text-center'>
                        <AlertCircle className='w-12 h-12 text-cyan-500/30 mx-auto mb-3' />
                        <p className='text-muted-foreground font-medium'>
                          No invoices found
                        </p>
                        <p className='text-sm text-muted-foreground mt-1'>
                          Try adjusting your search filters or check back later
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
