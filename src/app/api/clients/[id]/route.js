// src/app/api/clients/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  handleApiError,
  validateRequiredFields,
  getUserRole,
  isClientRole,
} from "@/lib/api-helpers";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const role = await getUserRole(userId);

    // Build simplified role-aware access filters: CLIENT vs ADMIN
    const isClient = isClientRole(role);
    const whereClause = isClient ? { id, userId } : { id };
    const projectWhere = { clientId: id };

    const client = await prisma.client.findFirst({
      where: whereClause,
      include: {
        projects: {
          where: projectWhere,
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            startDate: true,
            endDate: true,
            projectManager: { select: { name: true } },
            tasks: {
              select: {
                id: true,
                status: true,
              },
            },
            invoices: {
              select: {
                id: true,
                amount: true,
                status: true,
              },
            },
            activities: {
              select: {
                id: true,
                text: true,
                type: true,
                createdAt: true,
              },
            },
          },
          orderBy: { updatedAt: "desc" },
        },
        _count: {
          select: {
            projects: { where: projectWhere },
          },
        },
      },
    });

    if (!client) {
      const exists = await prisma.client.findUnique({ where: { id } });
      if (exists) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const clientUserId = client.userId;
    const clerk = await clerkClient();
    const clientUser = await clerk.users.getUser(clientUserId);
    const contactPhone = clientUser.phoneNumbers.find(
      (pn) => pn.id === clientUser.primaryPhoneNumberId
    );
    client["contactPhone"] = contactPhone.phoneNumber;

    // Calculate stats
    const activeProjects = client.projects.filter((p) =>
      ["PLANNING", "IN_PROGRESS"].includes(p.status)
    ).length;

    const totalRevenue = client.projects.reduce((sum, project) => {
      return (
        sum +
        project.invoices
          .filter((invoice) => invoice.status === "PAID")
          .reduce((invoiceSum, invoice) => invoiceSum + invoice.amount, 0)
      );
    }, 0);

    const totalTasks = client.projects.reduce(
      (sum, project) => sum + project.tasks.length,
      0
    );

    const completedTasks = client.projects.reduce(
      (sum, project) =>
        sum + project.tasks.filter((task) => task.status === "DONE").length,
      0
    );

    const projects = client.projects.map((project) => {
      return {
        projectId: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        projectManager: project.projectManager.name,
        tasks: project.tasks.length,
        invoices: project.invoices.length,
        activities: project.activities.map((activity) => {
          return {
            id: activity.id,
            text: JSON.parse(activity.text),
            type: activity.type,
            createdAt: activity.createdAt,
          };
        }),
      };
    });

    const lastContact =
      client.projects.length > 0
        ? client.projects[0].updatedAt
        : client.createdAt;

    const clientWithStats = {
      ...client,
      projects,
      activeProjects,
      totalRevenue,
      totalTasks,
      completedTasks,
      lastContact,
      status: activeProjects > 0 ? "active" : "inactive",
    };
    return NextResponse.json(clientWithStats);
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
    const role = await getUserRole(userId);
    if (isClientRole(role)) {
      return NextResponse.json(
        { error: "Forbidden: clients cannot update client records" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Verify client exists and user has access
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        projects: {
          some: {
            projectManagerId: userId,
          },
        },
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

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

    // Check if email is being changed and if it conflicts
    if (body.contactEmail !== existingClient.contactEmail) {
      const emailConflict = await prisma.client.findUnique({
        where: { contactEmail: body.contactEmail },
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: "A client with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Update the client
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        companyName: body.companyName,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone || null,
        address: body.address || null,
      },
      include: {
        projects: {
          where: { projectManagerId: userId },
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            projects: {
              where: { projectManagerId: userId },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedClient);
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
    const role = await getUserRole(userId);
    if (isClientRole(role)) {
      return NextResponse.json(
        { error: "Forbidden: clients cannot delete client records" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify client exists and user has access
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        projects: {
          some: {
            projectManagerId: userId,
          },
        },
      },
      include: {
        projects: {
          where: { projectManagerId: userId },
          select: { id: true },
        },
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check if client has active projects
    const activeProjects = await prisma.project.count({
      where: {
        clientId: id,
        projectManagerId: userId,
        status: {
          in: ["PLANNING", "IN_PROGRESS"],
        },
      },
    });

    if (activeProjects > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete client with active projects. Complete or cancel all projects first.",
        },
        { status: 400 }
      );
    }

    // Delete the client
    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
