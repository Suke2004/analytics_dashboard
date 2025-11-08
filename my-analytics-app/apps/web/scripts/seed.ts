/**
 * Prisma Seed Script for Analytics DB
 * -----------------------------------
 * Loads sample invoice data from JSON and seeds:
 * Vendors, Customers, Invoices, LineItems, Payments
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pLimit from "p-limit";

// Get current directory (for ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load JSON data
const dataPath = join(__dirname, "../../data/Analytics_Test_Data.json");
let data: any;
try {
  data = JSON.parse(readFileSync(dataPath, "utf-8"));
  if (!Array.isArray(data)) {
    throw new Error("Invalid data format: expected top-level array");
  }
} catch (err) {
  console.error("❌ Failed to load Analytics_Test_Data.json:", err);
  process.exit(1);
}

const prisma = new PrismaClient();
const limit = pLimit(10); // concurrency limiter

async function processInvoice(
  item: any,
  vendorMap: Map<string, number>,
  customerMap: Map<string, number>
) {
  try {
    const llmData = item?.extractedData?.llmData;
    if (!llmData) return;

    // ------------------ Vendor ------------------
    const vendorName =
      llmData.vendor?.value?.vendorName?.value?.trim() || "Unknown Vendor";
    const vendorKey = vendorName.toLowerCase();
    let vendorId = vendorMap.get(vendorKey);
    if (!vendorId) {
      const vendor = await prisma.vendor.create({
        data: { name: vendorName, category: null },
      });
      vendorId = vendor.id;
      vendorMap.set(vendorKey, vendorId);
    }

    // ------------------ Customer ------------------
    const customerName =
      llmData.customer?.value?.customerName?.value?.trim() ||
      "Unknown Customer";
    const customerKey = customerName.toLowerCase();
    let customerId = customerMap.get(customerKey);
    if (!customerId) {
      const customer = await prisma.customer.create({
        data: { name: customerName, region: null },
      });
      customerId = customer.id;
      customerMap.set(customerKey, customerId);
    }

    // ------------------ Invoice ------------------
    const invoiceNo =
      llmData.invoice?.value?.invoiceId?.value ||
      `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    let invoiceDate = new Date(
      llmData.invoice?.value?.invoiceDate?.value || ""
    );
    if (isNaN(invoiceDate.getTime())) invoiceDate = new Date();

    // ------------------ Line Items ------------------
    // Actual nested path: lineItems.value.items.value
    let rawLineItems = llmData?.lineItems?.value?.items?.value ?? [];

    if (rawLineItems && !Array.isArray(rawLineItems)) {
      rawLineItems = [rawLineItems];
    }

    const lineItems = Array.isArray(rawLineItems) ? rawLineItems : [];

    if (!Array.isArray(lineItems)) {
      console.warn("⚠️ Skipping invalid lineItems for invoice:", invoiceNo);
    }

    // Calculate total amount from line items
    let totalAmount = 0;
    for (const li of lineItems) {
      const itemAmount =
        li.totalPrice?.value || li.amount?.value || li.unitPrice?.value || 0;
      totalAmount += itemAmount;
    }

    // Fallback to payment/summary total if lineItems missing
    if (totalAmount === 0) {
      totalAmount =
        llmData?.summary?.value?.invoiceTotal?.value ||
        llmData?.payment?.value?.amount?.value ||
        0;
    }

    // ------------------ Create Invoice ------------------

    // Function to generate a random suffix
    function randomSuffix() {
      return Math.random().toString(36).slice(2, 6);
    }

    let uniqueInvoiceNo = invoiceNo;
    let createdInvoice = null;
    let attempts = 0;

    while (!createdInvoice && attempts < 5) {
      try {
        createdInvoice = await prisma.invoice.create({
          data: {
            invoiceNo: uniqueInvoiceNo,
            vendorId,
            customerId,
            date: invoiceDate,
            amount: totalAmount,
            status:
              llmData.payment?.value?.amount?.value &&
              llmData.payment?.value?.amount?.value >= totalAmount
                ? "paid"
                : "pending",
          },
        });
      } catch (err: any) {
        if (err.code === "P2002" && err.meta?.target?.includes("invoiceNo")) {
          // Unique constraint failed — append new suffix and retry
          uniqueInvoiceNo = `${invoiceNo}-${randomSuffix()}`;
          attempts++;
          continue;
        } else {
          throw err;
        }
      }
    }

    if (!createdInvoice) {
      throw new Error(`Failed to create invoice after ${attempts} retries`);
    }

    const invoice = createdInvoice;

    // ------------------ Line Items insert ------------------
    if (lineItems.length > 0) {
      await prisma.$transaction(
        lineItems.map((li) =>
          prisma.lineItem.create({
            data: {
              invoiceId: invoice.id,
              description:
                li.description?.value || li.itemName?.value || "No description",
              category: li.category?.value || li.type?.value || "Uncategorized",
              amount:
                li.totalPrice?.value ||
                li.amount?.value ||
                li.unitPrice?.value ||
                0,
            },
          })
        )
      );
    }

    // ------------------ Payment ------------------
    const paidDateStr = llmData.payment?.value?.paidDate?.value;
    const paymentAmount = llmData.payment?.value?.amount?.value;
    if (paidDateStr && paymentAmount) {
      const paidDate = new Date(paidDateStr);
      if (!isNaN(paidDate.getTime())) {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            paidDate,
            amount: paymentAmount,
          },
        });
      }
    }
  } catch (err) {
    console.error("❌ Error processing invoice:", err);
  }
}

async function main() {
  console.log("🌱 Starting Prisma Seed...");
  console.log(`📂 Loaded ${data.length} records from Analytics_Test_Data.json`);

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.customer.deleteMany();
  console.log("🧹 Cleared existing data");

  // Prevent duplicates
  const vendorMap = new Map<string, number>();
  const customerMap = new Map<string, number>();

  // Process invoices in parallel (10 at a time)
  await Promise.all(
    data.map((item) =>
      limit(() => processInvoice(item, vendorMap, customerMap))
    )
  );

  // Final stats
  console.log("✅ Database seeded successfully!");
  console.log(`   - Vendors:   ${vendorMap.size}`);
  console.log(`   - Customers: ${customerMap.size}`);
  console.log(`   - Invoices:  ${await prisma.invoice.count()}`);
  console.log(`   - LineItems: ${await prisma.lineItem.count()}`);
  console.log(`   - Payments:  ${await prisma.payment.count()}`);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
