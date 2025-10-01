// src/app/api/invoices/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  handleApiError,
  validateRequiredFields,
  getPaginationParams,
  buildSortObject,
  getUserRole,
  isClientRole,
} from "@/lib/api-helpers";
import { generateInvoiceNumber } from "@/lib/utils";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const sortObject = buildSortObject(searchParams);
    const role = await getUserRole(userId);

    // Search and filter parameters
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const projectId = searchParams.get("projectId");
    const dateRange = searchParams.get("dateRange"); // 'this-month', 'last-month', 'this-quarter', 'this-year'

    // Build where clause (client vs staff)
    const whereClause = isClientRole(role)
      ? {
          project: {
            client: { userId: userId },
          },
        }
      : {
          project: {
            projectManagerId: userId,
          },
        };

    // Add search filters
    if (search) {
      whereClause.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        {
          project: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          project: {
            client: {
              companyName: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    if (status && status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (clientId) {
      whereClause.project = {
        ...whereClause.project,
        clientId,
      };
    }

    // Date range filters
    if (dateRange) {
      const now = new Date();
      let startDate, endDate;

      switch (dateRange) {
        case "this-month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case "last-month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case "this-quarter":
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
          break;
        case "this-year":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
      }

      if (startDate && endDate) {
        whereClause.issueDate = {
          gte: startDate,
          lte: endDate,
        };
      }
    }

    // Get invoices with full details
    const [invoices, totalCount] = await Promise.all([
      prisma.invoice.findMany({
        where: whereClause,
        include: {
          project: {
            include: {
              client: {
                select: {
                  id: true,
                  companyName: true,
                  contactName: true,
                  contactEmail: true,
                  contactPhone: true,
                  address: true,
                },
              },
            },
          },
        },
        orderBy: sortObject,
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where: whereClause }),
    ]);

    // Calculate additional stats for each invoice
    const invoicesWithStats = invoices.map((invoice) => {
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

      return {
        ...invoice,
        isOverdue,
        dueDateStatus,
        daysUntilDue: invoice.dueDate
          ? Math.ceil(
              (new Date(invoice.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
            )
          : null,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      invoices: invoicesWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = await getUserRole(userId);
    if (isClientRole(role)) {
      return NextResponse.json(
        { error: "Forbidden: clients cannot create invoices" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    validateRequiredFields(body, [
      "projectId",
      "amount",
      "issueDate",
      "dueDate",
    ]);

    // Verify project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: body.projectId,
        projectManagerId: userId,
      },
      include: {
        client: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

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

    // Generate unique invoice number if not provided
    const invoiceNumber = body.invoiceNumber || generateInvoiceNumber();

    // Check if invoice number already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { invoiceNumber },
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: "Invoice number already exists" },
        { status: 409 }
      );
    }

    // Create the invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        amount,
        status: body.status?.toUpperCase() || "DRAFT",
        issueDate,
        dueDate,
        projectId: body.projectId,
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
                contactPhone: true,
                address: true,
              },
            },
          },
        },
      },
    });

    // Add calculated fields
    const invoiceWithStats = {
      ...invoice,
      isOverdue: false,
      dueDateStatus: "normal",
      daysUntilDue: Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)),
    };

    return NextResponse.json(invoiceWithStats, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
