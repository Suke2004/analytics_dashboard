import { Router } from "express";
import { prisma } from "../index.js";
const router = Router();
// GET /invoice-trends - Get invoice trends over time
router.get("/", async (req, res) => {
    try {
        const { period = "month" } = req.query; // month, week, day
        // Get invoices grouped by date
        const invoices = await prisma.invoice.findMany({
            select: {
                date: true,
                amount: true,
                status: true,
            },
            orderBy: {
                date: "asc",
            },
        });
        // Group by period (simplified - in production, use database functions)
        const trends = {};
        invoices.forEach((invoice) => {
            const date = new Date(invoice.date);
            let key;
            if (period === "day") {
                key = date.toISOString().split("T")[0];
            }
            else if (period === "week") {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split("T")[0];
            }
            else {
                // month
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            }
            if (!trends[key]) {
                trends[key] = { date: key, amount: 0, count: 0 };
            }
            trends[key].amount += invoice.amount;
            trends[key].count += 1;
        });
        const result = Object.values(trends).sort((a, b) => a.date.localeCompare(b.date));
        res.json(result);
    }
    catch (error) {
        console.error("Error fetching invoice trends:", error);
        res.status(500).json({ error: "Failed to fetch invoice trends" });
    }
});
export default router;
