// src/app/api/settings/team/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { handleApiError } from "@/lib/api-helpers";
import { getInitials } from "@/lib/utils";
import { getRoleLabel } from "@/data/route/settings/team/teamData";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get projects managed by the current user
    const userProjects = await prisma.project.findMany({
      where: { projectManagerId: userId },
      select: { id: true },
    });

    const projectIds = userProjects.map((p) => p.id);

    // Get all users who are assigned to tasks in these projects
    const teamMembers = await prisma.user.findMany({
      where: {
        OR: [
          // Users assigned to tasks in user's projects
          {
            assignedTasks: {
              some: {
                projectId: { in: projectIds },
              },
            },
          },
          // Users who are project managers
          {
            managedProjects: {
              some: {},
            },
          },
        ],
        // Exclude the current user
        NOT: {
          clerkId: userId,
        },
      },
      select: {
        clerkId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            assignedTasks: true,
            managedProjects: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Transform data to match frontend expectations
    const formattedTeamMembers = teamMembers.map((member) => {
      return {
        id: member.clerkId,
        name: member.name || "Unknown User",
        email: member.email,
        role: getRoleLabel[member.role] || "Member",
        avatar: getInitials(member.name),
        status: "Active", // We can enhance this later with actual status tracking
        tasksCount: member._count.assignedTasks,
        projectsCount: member._count.managedProjects,
        joinedAt: member.createdAt,
      };
    });

    return NextResponse.json({
      teamMembers: formattedTeamMembers,
      totalMembers: formattedTeamMembers.length,
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

    const body = await request.json();
    const { email, role = "DEVELOPER" } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    // For now, we'll just return a message since user creation is handled by Clerk
    // In a full implementation, you might send an invitation email here
    return NextResponse.json({
      message: "Team member invitation would be sent to " + email,
      email,
      role,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
