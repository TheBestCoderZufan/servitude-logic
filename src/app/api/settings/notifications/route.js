// src/app/api/settings/notifications/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { handleApiError } from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user notification preferences
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        emailNotifications: true,
        pushNotifications: true,
        notificationPreferences: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Default notification settings if not set
    const defaultNotifications = [
      {
        id: "email-tasks",
        title: "Task Assignments",
        description: "Get notified when you are assigned to a new task",
        enabled: true,
      },
      {
        id: "email-projects",
        title: "Project Updates",
        description: "Receive updates about project milestones and deadlines",
        enabled: true,
      },
      {
        id: "email-invoices",
        title: "Invoice Notifications",
        description: "Get notified about invoice payments and overdue bills",
        enabled: false,
      },
      {
        id: "push-mentions",
        title: "Mentions &amp; Comments",
        description: "Push notifications when someone mentions you",
        enabled: true,
      },
      {
        id: "push-deadlines",
        title: "Deadline Reminders",
        description: "Push notifications for upcoming deadlines",
        enabled: true,
      },
    ];

    // Merge user preferences with defaults
    let notifications = defaultNotifications;
    if (user.notificationPreferences) {
      try {
        const userPrefs = JSON.parse(user.notificationPreferences);
        notifications = notifications.map((notification) => ({
          ...notification,
          enabled:
            userPrefs[notification.id] !== undefined
              ? userPrefs[notification.id]
              : notification.enabled,
        }));
      } catch (error) {
        console.error("Error parsing notification preferences:", error);
      }
    }

    return NextResponse.json({
      notifications,
      emailNotifications: user.emailNotifications ?? true,
      pushNotifications: user.pushNotifications ?? true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notifications, emailNotifications, pushNotifications } = body;

    // Convert notifications array to preferences object
    const notificationPreferences = {};
    if (notifications && Array.isArray(notifications)) {
      notifications.forEach((notification) => {
        notificationPreferences[notification.id] = notification.enabled;
      });
    }

    // Update user notification preferences
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        emailNotifications: emailNotifications,
        pushNotifications: pushNotifications,
        notificationPreferences: JSON.stringify(notificationPreferences),
      },
      select: {
        emailNotifications: true,
        pushNotifications: true,
        notificationPreferences: true,
      },
    });

    return NextResponse.json({
      message: "Notification preferences updated successfully",
      ...updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
