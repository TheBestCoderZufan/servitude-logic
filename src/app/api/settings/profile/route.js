// src/app/api/settings/profile/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { handleApiError, validateRequiredFields } from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure a User record exists; default role to CLIENT on first creation
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      const ck = await clerkClient();
      const ckUser = await ck.users.getUser(userId);
      const fullName = [ckUser.firstName, ckUser.lastName].filter(Boolean).join(" ");
      const emailObj = ckUser.emailAddresses?.find(
        (e) => e.id === ckUser.primaryEmailAddressId
      ) || ckUser.emailAddresses?.[0];
      const email = emailObj?.emailAddress || "";

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name: fullName || null,
          role: "CLIENT",
        },
      });
    }

    // Return user profile data
    const profile = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        clerkId: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        company: true,
        jobTitle: true,
        bio: true,
        timezone: true,
        language: true,
        dateFormat: true,
        timeFormat: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(profile);
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

    // Validate and sanitize input
    const updateData = {};
    const allowedFields = [
      "name",
      "phone",
      "company",
      "jobTitle",
      "bio",
      "timezone",
      "language",
      "dateFormat",
      "timeFormat",
    ];

    // Only include allowed fields that are present in the request
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: updateData,
      select: {
        clerkId: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        company: true,
        jobTitle: true,
        bio: true,
        timezone: true,
        language: true,
        dateFormat: true,
        timeFormat: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}
