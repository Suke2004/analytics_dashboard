import { Router } from "express";
import { prisma } from "../index.js";
const router = Router();
// GET /invoices - Get invoices with search and sort
router.get("/", async (req, res) => {
    try {
        const { search = "", sortBy = "date", sortOrder = "desc", page = "1", limit = "50", } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        // Build where clause for search
        const where = {};
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
        const orderBy = {};
        if (sortBy === "date") {
            orderBy.date = sortOrder;
        }
        else if (sortBy === "amount") {
            orderBy.amount = sortOrder;
        }
        else if (sortBy === "invoiceNo") {
            orderBy.invoiceNo = sortOrder;
        }
        else {
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
                take: limitNum,
            }),
            prisma.invoice.count({ where }),
        ]);
        res.json({
            data: invoices,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ error: "Failed to fetch invoices" });
    }
});
// GET /invoices/:id - Get single invoice with details
router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                vendor: true,
                customer: true,
                lineItems: true,
                payments: true,
            },
        });
        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }
        res.json(invoice);
    }
    catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(500).json({ error: "Failed to fetch invoice" });
    }
});
export default router;
