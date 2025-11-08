import { Router } from "express";
import { prisma } from "../index.js";
const router = Router();
// GET /category-spend - Get spend by category
router.get("/", async (req, res) => {
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
        const categorySpend = {};
        vendors.forEach((vendor) => {
            const category = vendor.category || "Uncategorized";
            const total = vendor.invoices.reduce((sum, inv) => sum + inv.amount, 0);
            categorySpend[category] = (categorySpend[category] || 0) + total;
        });
        const result = Object.entries(categorySpend).map(([category, amount]) => ({
            category,
            amount,
        }));
        res.json(result);
    }
    catch (error) {
        console.error("Error fetching category spend:", error);
        res.status(500).json({ error: "Failed to fetch category spend" });
    }
});
export default router;
