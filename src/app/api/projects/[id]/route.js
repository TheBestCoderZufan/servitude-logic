// src/app/api/projects/[id]/route.js
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

    const project = await prisma.project.findFirst({
      where: isClientRole(role)
        ? {
            id,
            client: { userId: userId },
          }
        : {
            id,
            projectManagerId: userId,
          },
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
        tasks: {
          include: {
            assignee: {
              select: {
                clerkId: true,
                name: true,
                email: true,
              },
            },
            comments: {
              include: {
                author: {
                  select: {
                    clerkId: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
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
              orderBy: {
                date: "desc",
              },
            },
          },
          orderBy: [
            { status: "asc" },
            { priority: "desc" },
            { createdAt: "desc" },
          ],
        },
        invoices: {
          orderBy: {
            issueDate: "desc",
          },
        },
        files: {
          include: {
            uploadedBy: {
              select: {
                clerkId: true,
                name: true,
                email: true,
              },
            },
            approvals: {
              include: {
                actor: {
                  select: {
                    clerkId: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: {
            uploadedAt: "desc",
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

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Calculate detailed stats
    const tasksByStatus = {
      BACKLOG: project.tasks.filter((t) => t.status === "BACKLOG").length,
      TODO: project.tasks.filter((t) => t.status === "TODO").length,
      IN_PROGRESS: project.tasks.filter((t) => t.status === "IN_PROGRESS")
        .length,
      DONE: project.tasks.filter((t) => t.status === "DONE").length,
    };

    const tasksByPriority = {
      HIGH: project.tasks.filter((t) => t.priority === "HIGH").length,
      MEDIUM: project.tasks.filter((t) => t.priority === "MEDIUM").length,
      LOW: project.tasks.filter((t) => t.priority === "LOW").length,
    };

    const completedTasks = tasksByStatus.DONE;
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

    const pendingAmount = project.invoices
      .filter((invoice) => invoice.status === "SENT")
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

    // Calculate total time logged
    const totalHoursLogged = project.tasks.reduce((sum, task) => {
      return (
        sum + task.timeLogs.reduce((taskSum, log) => taskSum + log.hours, 0)
      );
    }, 0);

    const projectWithStats = {
      ...project,
      progress,
      completedTasks,
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      totalBudget,
      paidAmount,
      pendingAmount,
      teamSize: teamMembers.length,
      teamMembers,
      totalHoursLogged,
      isOverdue:
        project.endDate &&
        new Date(project.endDate) < new Date() &&
        project.status !== "COMPLETED",
      daysUntilDeadline: project.endDate
        ? Math.ceil(
            (new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24)
          )
        : null,
    };

    return NextResponse.json(projectWithStats);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = await getUserRole(userId);
    const isClient = isClientRole(role);

    const isAdmin = role === "ADMIN";
    const { id } = await params;
    const body = await request.json();

    const where = isClient
      ? { id: id, projectManagerId: userId }
      : {
          id: id,
        };

    // Verify project exists and user has access
    const existingProject = await prisma.project.findFirst({
      where: where,
    });
    console.log("existingProject", existingProject);

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

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

    // If client is being changed, verify new client exists
    if (body.clientId !== existingProject.clientId) {
      const client = await prisma.client.findFirst({
        where: isAdmin
          ? { id: body.clientId }
          : {
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
    }

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        status: body.status?.toUpperCase() || existingProject.status,
        startDate: startDate,
        endDate: endDate,
        clientId: body.clientId,
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

    return NextResponse.json(updatedProject);
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

    // Verify project exists and user has access
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        projectManagerId: userId,
      },
      include: {
        tasks: {
          select: { id: true },
        },
        invoices: {
          select: { id: true, status: true },
        },
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if project has pending invoices
    const pendingInvoices = existingProject.invoices.filter(
      (invoice) => invoice.status === "SENT"
    );

    if (pendingInvoices.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete project with pending invoices. Please resolve all invoices first.",
        },
        { status: 400 }
      );
    }

    // Delete project and all related data (cascade)
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
