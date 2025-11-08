import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/category-spend - Get spend by category
 */
export async function GET(request: NextRequest) {
  try {
    // Get spend by vendor category
    const vendors = await prisma.vendor.findMany({
      include: {
        invoices: {
          select: {
            amount: true,
          },
        },
      },
    });

    const categorySpend: Record<string, number> = {};

    vendors.forEach((vendor) => {
      const category = vendor.category || "Uncategorized";
      const total = vendor.invoices.reduce((sum, inv) => sum + inv.amount, 0);
      categorySpend[category] = (categorySpend[category] || 0) + total;
    });

    const result = Object.entries(categorySpend).map(([category, amount]) => ({
      category,
      amount,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching category spend:", error);
    return NextResponse.json(
      { error: "Failed to fetch category spend" },
      { status: 500 }
    );
  }
}
