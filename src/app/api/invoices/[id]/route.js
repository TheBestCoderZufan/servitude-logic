// src/app/api/invoices/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  handleApiError,
  validateRequiredFields,
  getUserRole,
  isClientRole,
} from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const role = await getUserRole(userId);

    const invoice = await prisma.invoice.findFirst({
      where: isClientRole(role)
        ? { id, project: { client: { userId } } }
        : { id, project: { projectManagerId: userId } },
      include: {
        project: {
          include: {
            client: true,
            tasks: {
              include: {
                timeLogs: {
                  include: {
                    user: {
                      select: {
                        clerkId: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Calculate detailed stats
    const isOverdue =
      invoice.status === "SENT" &&
      invoice.dueDate &&
      new Date(invoice.dueDate) < new Date();

    let dueDateStatus = "normal";
    if (invoice.dueDate && invoice.status === "SENT") {
      const now = new Date();
      const due = new Date(invoice.dueDate);
      const diffTime = due - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        dueDateStatus = "overdue";
      } else if (diffDays <= 7) {
        dueDateStatus = "due-soon";
      }
    }

    // Calculate project work summary
    const totalHours = invoice.project.tasks.reduce((sum, task) => {
      return (
        sum + task.timeLogs.reduce((taskSum, log) => taskSum + log.hours, 0)
      );
    }, 0);

    const completedTasks = invoice.project.tasks.filter(
      (task) => task.status === "DONE"
    ).length;
    const totalTasks = invoice.project.tasks.length;

    // Group time logs by user for billing breakdown
    const timeLogsByUser = invoice.project.tasks.reduce((acc, task) => {
      task.timeLogs.forEach((log) => {
        const userKey = log.user.clerkId;
        if (!acc[userKey]) {
          acc[userKey] = {
            user: log.user,
            totalHours: 0,
            logs: [],
          };
        }
        acc[userKey].totalHours += log.hours;
        acc[userKey].logs.push({
          ...log,
          taskTitle: task.title,
        });
      });
      return acc;
    }, {});

    const invoiceWithStats = {
      ...invoice,
      isOverdue,
      dueDateStatus,
      daysUntilDue: invoice.dueDate
        ? Math.ceil(
            (new Date(invoice.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
          )
        : null,
      projectSummary: {
        totalHours,
        completedTasks,
        totalTasks,
        progress:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      timeLogsByUser: Object.values(timeLogsByUser),
    };

    return NextResponse.json(invoiceWithStats);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const role = await getUserRole(userId);
    if (isClientRole(role)) {
      return NextResponse.json(
        { error: "Forbidden: clients cannot update invoices" },
        { status: 403 }
      );
    }
    const body = await request.json();

    // Verify invoice exists and user has access
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        project: {
          projectManagerId: userId,
        },
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Validate required fields
    validateRequiredFields(body, ["amount", "issueDate", "dueDate"]);

    // Validate amount
    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Validate dates
    const issueDate = new Date(body.issueDate);
    const dueDate = new Date(body.dueDate);

    if (dueDate <= issueDate) {
      return NextResponse.json(
        { error: "Due date must be after issue date" },
        { status: 400 }
      );
    }

    // Check if status transition is valid
    const validTransitions = {
      DRAFT: ["SENT", "DRAFT"],
      SENT: ["PAID", "OVERDUE", "SENT"],
      PAID: ["PAID"], // Paid invoices cannot be changed
      OVERDUE: ["PAID", "OVERDUE"],
    };

    const newStatus = body.status?.toUpperCase() || existingInvoice.status;
    if (!validTransitions[existingInvoice.status].includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Cannot change invoice status from ${existingInvoice.status} to ${newStatus}`,
        },
        { status: 400 }
      );
    }

    // Update the invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        amount,
        status: newStatus,
        issueDate,
        dueDate,
      },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
                contactName: true,
                contactEmail: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const role = await getUserRole(userId);
    if (isClientRole(role)) {
      return NextResponse.json(
        { error: "Forbidden: clients cannot delete invoices" },
        { status: 403 }
      );
    }

    // Verify invoice exists and user has access
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        project: {
          projectManagerId: userId,
        },
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Can only delete draft invoices
    if (existingInvoice.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Can only delete draft invoices" },
        { status: 400 }
      );
    }

    // Delete the invoice
    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
