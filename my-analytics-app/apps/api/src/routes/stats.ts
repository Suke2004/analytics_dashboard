import { Router } from "express";
import { prisma } from "../index.js";

const router = Router();

// GET /stats - Get overview statistics
router.get("/", async (req, res) => {
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

    res.json({
      totalSpend,
      totalInvoices,
      totalVendors,
      totalCustomers,
      pendingAmount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export default router;
