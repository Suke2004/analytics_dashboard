import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cash-outflow - Get cash outflow over time
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

    // Get payments grouped by date
    const payments = await prisma.payment.findMany({
      select: {
        paidDate: true,
        amount: true,
      },
      orderBy: {
        paidDate: "asc",
      },
    });

    // Group by period
    const outflow: Record<string, { date: string; amount: number }> = {};

    payments.forEach((payment) => {
      const date = new Date(payment.paidDate);
      let key: string;

      if (period === "day") {
        key = date.toISOString().split("T")[0];
      } else if (period === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else {
        // month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      if (!outflow[key]) {
        outflow[key] = { date: key, amount: 0 };
      }
      outflow[key].amount += payment.amount;
    });

    const result = Object.values(outflow).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching cash outflow:", error);
    return NextResponse.json(
      { error: "Failed to fetch cash outflow" },
      { status: 500 }
    );
  }
}
