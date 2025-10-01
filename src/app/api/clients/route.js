// src/app/api/clients/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  handleApiError,
  validateRequiredFields,
  getPaginationParams,
  buildSortObject,
  getUserRole,
  isClientRole,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const sortObject = buildSortObject(searchParams);
    const role = await getUserRole(userId);

    // Search functionality
    const search = searchParams.get("search");
    // const status = searchParams.get("status");
    // const industry = searchParams.get("industry");

    // Build where clause
    const whereClause = isClientRole(role)
      ? { userId: userId } // client sees only their own client record
      : {
          // OR: [
          //   { projects: { some: { projectManagerId: userId } } },
          //   { userId: userId }, // owner-created clients
          // ],
        };

    // Add search filters
    if (search) {
      whereClause.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { contactEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get clients with project counts and latest project info
    const [clients, totalCount] = await Promise.all([
      prisma.client.findMany({
        where: whereClause,
        include: {
          projects: {
            where: isClientRole(role) ? {} : { projectManagerId: userId },
            select: {
              id: true,
              name: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: { updatedAt: "desc" },
          },
          _count: {
            select: {
              projects: {
                where: isClientRole(role) ? {} : { projectManagerId: userId },
              },
            },
          },
        },
        orderBy: sortObject,
        skip,
        take: limit,
      }),
      prisma.client.count({ where: whereClause }),
    ]);

    // Calculate additional stats for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        // Get active projects count
        const activeProjects = client.projects.filter((p) =>
          ["PLANNING", "IN_PROGRESS"].includes(p.status)
        ).length;

        console.log("activeProjects", activeProjects);

        // Get total revenue for this client
        const revenueResult = await prisma.invoice.aggregate({
          where: {
            project: {
              clientId: client.id,
              ...(isClientRole(role) ? {} : { projectManagerId: userId }),
            },
            status: "PAID",
          },
          _sum: {
            amount: true,
          },
        });

        // Get last contact date (most recent project update)
        const lastContact =
          client.projects.length > 0
            ? client.projects[0].updatedAt
            : client.createdAt;

        return {
          ...client,
          activeProjects,
          totalRevenue: revenueResult._sum.amount || 0,
          lastContact,
          status: activeProjects > 0 ? "active" : "inactive",
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      clients: clientsWithStats,
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
    const ckClient = await clerkClient();
    const user = await ckClient.users.getUser(userId);
    const userFullName = user.firstName + " " + user.lastName;
    const { emailAddress } = await ckClient.emailAddresses.getEmailAddress(
      user.primaryEmailAddressId
    );
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = await getUserRole(userId);
    if (isClientRole(role)) {
      return NextResponse.json(
        { error: "Forbidden: clients cannot create clients" },
        { status: 403 }
      );
    }

    await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: emailAddress,
        name: userFullName,
        // Default all new users to CLIENT until an admin updates their role
        role: "CLIENT",
      },
    });

    const body = await request.json();

    // Validate required fields
    validateRequiredFields(body, [
      "companyName",
      "contactName",
      "contactEmail",
    ]);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.contactEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if client with this email already exists
    const existingClient = await prisma.client.findUnique({
      where: { contactEmail: body.contactEmail },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "A client with this email already exists" },
        { status: 409 }
      );
    }

    // Create the client
    const client = await prisma.client.create({
      data: {
        companyName: body.companyName,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone || null,
        address: body.address || null,
        userId: userId,
        website: body.website || null,
        industry: body.industry || null,
        notes: body.notes || null,
        projectBudget: body.projectBudget
          ? parseFloat(body.projectBudget)
          : null,
        preferredCommunication: body.preferredCommunication || "email",
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    // Add calculated fields
    const clientWithStats = {
      ...client,
      activeProjects: 0,
      totalRevenue: 0,
      lastContact: client.createdAt,
      status: "inactive",
    };

    return NextResponse.json(clientWithStats, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
