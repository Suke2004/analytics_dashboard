import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and parse JSON data file
// Path: from apps/api/scripts/ to apps/data/
const dataPath = join(__dirname, "../../data/Analytics_Test_Data.json");
const data = JSON.parse(readFileSync(dataPath, "utf-8"));

const prisma = new PrismaClient();

interface InvoiceData {
  extractedData?: {
    llmData?: {
      invoice?: {
        value?: {
          invoiceId?: { value?: string };
          invoiceDate?: { value?: string };
        };
      };
      vendor?: {
        value?: {
          vendorName?: { value?: string };
        };
      };
      customer?: {
        value?: {
          customerName?: { value?: string };
        };
      };
      lineItems?: {
        value?: Array<{
          description?: { value?: string };
          category?: { value?: string };
          amount?: { value?: number };
        }>;
      };
      payment?: {
        value?: {
          paidDate?: { value?: string };
          amount?: { value?: number };
        };
      };
    };
  };
}

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (in reverse order of dependencies)
  await prisma.payment.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.customer.deleteMany();

  console.log("🗑️  Cleared existing data");

  // Create maps to track vendors and customers
  const vendorMap = new Map<string, number>();
  const customerMap = new Map<string, number>();

  // Process invoices
  const invoices = Array.isArray(data) ? data : [];
  console.log(`📄 Processing ${invoices.length} invoices...`);

  for (const item of invoices) {
    try {
      const invoiceData = item as InvoiceData;
      const llmData = invoiceData.extractedData?.llmData;

      if (!llmData) continue;

      // Extract vendor
      const vendorName =
        llmData.vendor?.value?.vendorName?.value || "Unknown Vendor";
      let vendorId = vendorMap.get(vendorName);

      if (!vendorId) {
        const vendor = await prisma.vendor.create({
          data: {
            name: vendorName,
            category: null, // TODO: Extract category from data if available
          },
        });
        vendorId = vendor.id;
        vendorMap.set(vendorName, vendorId);
      }

      // Extract customer
      const customerName =
        llmData.customer?.value?.customerName?.value || "Unknown Customer";
      let customerId = customerMap.get(customerName);

      if (!customerId) {
        const customer = await prisma.customer.create({
          data: {
            name: customerName,
            region: null, // TODO: Extract region from data if available
          },
        });
        customerId = customer.id;
        customerMap.set(customerName, customerId);
      }

      // TypeScript guard: ensure IDs are defined
      if (!vendorId || !customerId) {
        console.error("Failed to create vendor or customer");
        continue;
      }

      // Extract invoice details
      const invoiceNo =
        llmData.invoice?.value?.invoiceId?.value ||
        `INV-${Date.now()}-${Math.random()}`;
      const invoiceDateStr = llmData.invoice?.value?.invoiceDate?.value;
      const invoiceDate = invoiceDateStr
        ? new Date(invoiceDateStr)
        : new Date();

      // Calculate total amount from line items
      const lineItems = llmData.lineItems?.value || [];
      let totalAmount = 0;
      for (const item of lineItems) {
        totalAmount += item.amount?.value || 0;
      }

      // If no line items, use payment amount or default to 0
      if (totalAmount === 0) {
        totalAmount = llmData.payment?.value?.amount?.value || 0;
      }

      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNo,
          vendorId,
          customerId,
          date: invoiceDate,
          amount: totalAmount,
          status: "pending", // TODO: Extract status from data if available
        },
      });

      // Create line items
      for (const item of lineItems) {
        await prisma.lineItem.create({
          data: {
            invoiceId: invoice.id,
            description: item.description?.value || "No description",
            category: item.category?.value || "Uncategorized",
            amount: item.amount?.value || 0,
          },
        });
      }

      // Create payment if available
      const paidDateStr = llmData.payment?.value?.paidDate?.value;
      const paymentAmount = llmData.payment?.value?.amount?.value;

      if (paidDateStr && paymentAmount) {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            paidDate: new Date(paidDateStr),
            amount: paymentAmount,
          },
        });
      }
    } catch (error) {
      console.error("Error processing invoice:", error);
      // Continue with next invoice
    }
  }

  console.log("✅ Database seeded successfully!");
  console.log(`   - Vendors: ${vendorMap.size}`);
  console.log(`   - Customers: ${customerMap.size}`);
  console.log(`   - Invoices: ${await prisma.invoice.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
