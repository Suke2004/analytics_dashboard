import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import statsRouter from "./routes/stats.js";
import invoiceTrendsRouter from "./routes/invoiceTrends.js";
import vendorsRouter from "./routes/vendors.js";
import categorySpendRouter from "./routes/categorySpend.js";
import cashOutflowRouter from "./routes/cashOutflow.js";
import invoicesRouter from "./routes/invoices.js";
import chatRouter from "./routes/chat.js";
dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(cors());
app.use(express.json());
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
// Routes
app.use("/stats", statsRouter);
app.use("/invoice-trends", invoiceTrendsRouter);
app.use("/vendors", vendorsRouter);
app.use("/category-spend", categorySpendRouter);
app.use("/cash-outflow", cashOutflowRouter);
app.use("/invoices", invoicesRouter);
app.use("/chat-with-data", chatRouter);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});
app.listen(PORT, () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
});
// Graceful shutdown
process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});
export { prisma };
