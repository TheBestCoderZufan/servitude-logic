// src/app/api/invoices/overdue-check/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const now = new Date();

    // Update sent invoices that are past due date to overdue status
    const result = await prisma.invoice.updateMany({
      where: {
        status: "SENT",
        dueDate: {
          lt: now,
        },
      },
      data: {
        status: "OVERDUE",
      },
    });

    return NextResponse.json({
      message: `Updated ${result.count} invoices to overdue status`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error updating overdue invoices:", error);
    return NextResponse.json(
      { error: "Failed to update overdue invoices" },
      { status: 500 }
    );
  }
}
