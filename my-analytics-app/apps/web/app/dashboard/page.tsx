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
  const [invoiceTrends, setInvoiceTrends] = useState<InvoiceTrend[]>([]);
  const [topVendors, setTopVendors] = useState<TopVendor[]>([]);
  const [categorySpend, setCategorySpend] = useState<CategorySpend[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error("Error searching invoices:", error);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <p className='text-muted-foreground'>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state if stats failed to load and no data available
  if (!stats && !loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold mb-6'>Dashboard</h1>
        <div className='bg-destructive/10 border border-destructive/20 rounded-lg p-6'>
          <h2 className='text-lg font-semibold text-destructive mb-2'>
            Failed to Load Dashboard Data
          </h2>
          <p className='text-muted-foreground mb-4'>
            Unable to connect to the database. Please check:
          </p>
          <ul className='list-disc list-inside space-y-2 text-sm text-muted-foreground'>
            <li>Database connection string is configured in <code className='bg-muted px-1 rounded'>.env.local</code></li>
            <li>Prisma migrations have been run: <code className='bg-muted px-1 rounded'>pnpm prisma migrate dev</code></li>
            <li>Database is accessible and running</li>
            <li>Check the browser console and server logs for detailed error messages</li>
          </ul>
          <button
            onClick={fetchData}
            className='mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90'>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6'>Dashboard</h1>

      {/* Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Total Spend</CardDescription>
            <CardTitle className='text-2xl'>
              $
              {stats?.totalSpend
                ? stats.totalSpend.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })
                : "0.00"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Total Invoices</CardDescription>
            <CardTitle className='text-2xl'>
              {stats?.totalInvoices || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Total Vendors</CardDescription>
            <CardTitle className='text-2xl'>
              {stats?.totalVendors || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Total Customers</CardDescription>
            <CardTitle className='text-2xl'>
              {stats?.totalCustomers || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Pending Amount</CardDescription>
            <CardTitle className='text-2xl'>
              $
              {stats?.pendingAmount
                ? stats.pendingAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })
                : "0.00"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        <Card>
          <CardHeader>
            <CardTitle>Invoice Trends</CardTitle>
            <CardDescription>Monthly invoice amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={invoiceTrends}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='amount'
                  stroke='#8884d8'
                  name='Amount'
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Vendors</CardTitle>
            <CardDescription>By total spend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={topVendors}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='name'
                  angle={-45}
                  textAnchor='end'
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey='totalSpend' fill='#8884d8' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
            <CardDescription>
              Distribution of spending by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={categorySpend}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ category, percent }) =>
                    `${category}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='amount'>
                  {categorySpend.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Search and browse invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-2 mb-4'>
            <Input
              placeholder='Search invoices...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left p-2'>Invoice No</th>
                  <th className='text-left p-2'>Vendor</th>
                  <th className='text-left p-2'>Customer</th>
                  <th className='text-left p-2'>Amount</th>
                  <th className='text-left p-2'>Date</th>
                  <th className='text-left p-2'>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className='border-b'>
                    <td className='p-2'>{invoice.invoiceNo}</td>
                    <td className='p-2'>{invoice.vendor.name}</td>
                    <td className='p-2'>{invoice.customer.name}</td>
                    <td className='p-2'>
                      $
                      {invoice.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className='p-2'>
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className='p-2'>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
