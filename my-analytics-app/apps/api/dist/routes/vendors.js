import { Router } from "express";
import { prisma } from "../index.js";
const router = Router();
// GET /vendors/top10 - Get top 10 vendors by total spend
router.get("/top10", async (req, res) => {
    try {
        const vendors = await prisma.vendor.findMany({
            include: {
                invoices: {
                    select: {
                        amount: true,
                    },
                },
            },
        });
        // Calculate total spend per vendor
        const vendorsWithSpend = vendors.map((vendor) => ({
            id: vendor.id,
            name: vendor.name,
            category: vendor.category,
            totalSpend: vendor.invoices.reduce((sum, inv) => sum + inv.amount, 0),
            invoiceCount: vendor.invoices.length,
        }));
        // Sort by total spend and take top 10
        const top10 = vendorsWithSpend
            .sort((a, b) => b.totalSpend - a.totalSpend)
            .slice(0, 10);
        res.json(top10);
    }
    catch (error) {
        console.error("Error fetching top vendors:", error);
        res.status(500).json({ error: "Failed to fetch top vendors" });
    }
});
export default router;
