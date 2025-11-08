import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/invoices - Get invoices with search and sort
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where: any = {};
    if (search) {
      where.OR = [
        { invoiceNo: { contains: search, mode: "insensitive" } },
        {
          vendor: { name: { contains: search, mode: "insensitive" } },
        },
        {
          customer: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        { status: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === "date") {
      orderBy.date = sortOrder;
    } else if (sortBy === "amount") {
      orderBy.amount = sortOrder;
    } else if (sortBy === "invoiceNo") {
      orderBy.invoiceNo = sortOrder;
    } else {
      orderBy.date = "desc";
    }

    // Fetch invoices
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              region: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
