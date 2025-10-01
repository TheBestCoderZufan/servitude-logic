// src/app/api/projects/route.js
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

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = await getUserRole(userId);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const sortObject = buildSortObject(searchParams);
    const scope = searchParams.get("scope");

    // Search and filter parameters
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const priority = searchParams.get("priority");

    // Build where clause (client vs staff)
    let whereClause = {};
    if (isClientRole(role)) {
      // Clients see only their own projects
      whereClause = { client: { userId } };
    } else if (scope === "all") {
      // Any staff requesting scope=all sees all projects
      whereClause = {};
    } else if (role === "ADMIN" || role === "PROJECT_MANAGER") {
      // Admins and PMs default to all
      whereClause = {};
    } else {
      // Developers default to managed projects
      whereClause = { projectManagerId: userId };
    }

    // Add search filters
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          client: {
            companyName: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    if (status && status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    if (clientId) whereClause.clientId = clientId;

    // Get projects with full details
    const project = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
              contactEmail: true,
            },
          },
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              assignee: {
                select: {
                  clerkId: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          invoices: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
          files: {
            select: {
              id: true,
              fileName: true,
              fileType: true,
              url: true,
              uploadedAt: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              invoices: true,
              files: true,
            },
          },
        },
        orderBy: sortObject,
        skip,
        take: limit,
      }),
      prisma.project.count({ where: whereClause }),
    ]);
    const [projects, totalCount] = project;

    // Calculate additional stats for each project
    const projectsWithStats = projects.map((project) => {
      const completedTasks = project.tasks.filter(
        (task) => task.status === "DONE"
      ).length;
      const totalTasks = project.tasks.length;
      const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const totalBudget = project.invoices.reduce(
        (sum, invoice) => sum + invoice.amount,
        0
      );
      const paidAmount = project.invoices
        .filter((invoice) => invoice.status === "PAID")
        .reduce((sum, invoice) => sum + invoice.amount, 0);

      // Get unique team members
      const teamMembers = project.tasks
        .filter((task) => task.assignee)
        .reduce((acc, task) => {
          const exists = acc.find(
            (member) => member.clerkId === task.assignee.clerkId
          );
          if (!exists) {
            acc.push(task.assignee);
          }
          return acc;
        }, []);

      return {
        ...project,
        progress,
        completedTasks,
        totalBudget,
        paidAmount,
        teamSize: teamMembers.length,
        teamMembers: teamMembers.slice(0, 5), // Limit to first 5 for performance
        isOverdue:
          project.endDate &&
          new Date(project.endDate) < new Date() &&
          project.status !== "COMPLETED",
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      projects: projectsWithStats,
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
        { error: "Forbidden: clients cannot create projects" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    validateRequiredFields(body, ["name", "clientId", "startDate"]);

    // Validate dates
    const startDate = new Date(body.startDate);
    const endDate = body.endDate ? new Date(body.endDate) : null;

    if (endDate && endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Verify client exists and user has access
    const client = await prisma.client.findFirst({
      where: {
        id: body.clientId,
        OR: [
          { userId: userId },
          {
            projects: {
              some: {
                projectManagerId: userId,
              },
            },
          },
        ],
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found or access denied" },
        { status: 404 }
      );
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description || null,
        status: body.status?.toUpperCase() || "PLANNING",
        startDate: startDate,
        endDate: endDate,
        clientId: body.clientId,
        projectManagerId: userId,
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            contactEmail: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            invoices: true,
            files: true,
          },
        },
      },
    });

    // Add calculated fields
    const projectWithStats = {
      ...project,
      progress: 0,
      completedTasks: 0,
      totalBudget: 0,
      paidAmount: 0,
      teamSize: 0,
      teamMembers: [],
      isOverdue: false,
    };

    return NextResponse.json(projectWithStats, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
