import { Router } from "express";
import { prisma } from "../index.js";

const router = Router();

// GET /cash-outflow - Get cash outflow over time
router.get("/", async (req, res) => {
  try {
    const { period = "month" } = req.query;

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

    res.json(result);
  } catch (error) {
    console.error("Error fetching cash outflow:", error);
    res.status(500).json({ error: "Failed to fetch cash outflow" });
  }
});

export default router;
