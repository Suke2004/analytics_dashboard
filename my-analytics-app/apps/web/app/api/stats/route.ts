import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/stats - Get overview statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Total Spend
    const totalSpendResult = await prisma.invoice.aggregate({
      _sum: {
        amount: true,
      },
    });
    const totalSpend = totalSpendResult._sum.amount || 0;

    // Total Invoices
    const totalInvoices = await prisma.invoice.count();

    // Total Vendors
    const totalVendors = await prisma.vendor.count();

    // Total Customers
    const totalCustomers = await prisma.customer.count();

    // Pending Payments (invoices with status != 'paid')
    const pendingPayments = await prisma.invoice.aggregate({
      where: {
        status: {
          not: "paid",
        },
      },
      _sum: {
        amount: true,
      },
    });
    const pendingAmount = pendingPayments._sum.amount || 0;

    return NextResponse.json({
      totalSpend,
      totalInvoices,
      totalVendors,
      totalCustomers,
      pendingAmount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to fetch statistics",
        message: errorMessage,
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
