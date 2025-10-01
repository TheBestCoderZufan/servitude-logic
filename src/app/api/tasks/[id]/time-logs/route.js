// src/app/api/tasks/[id]/time-logs/route.js
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = params;

    // Verify task exists and user has access
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          { assigneeId: userId },
          {
            project: {
              projectManagerId: userId,
            },
          },
        ],
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const timeLogs = await prisma.timeLog.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            clerkId: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(timeLogs);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = params;
    const body = await request.json();

    // Validate required fields
    validateRequiredFields(body, ["hours", "date"]);

    // Verify task exists and user has access
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          { assigneeId: userId },
          {
            project: {
              projectManagerId: userId,
            },
          },
        ],
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Validate hours
    const hours = parseFloat(body.hours);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      return NextResponse.json(
        { error: "Hours must be a positive number and cannot exceed 24" },
        { status: 400 }
      );
    }

    // Validate date
    const date = new Date(body.date);
    if (date > new Date()) {
      return NextResponse.json(
        { error: "Cannot log time for future dates" },
        { status: 400 }
      );
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        hours,
        date,
        description: body.description || null,
        taskId,
        userId,
      },
      include: {
        user: {
          select: {
            clerkId: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(timeLog, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
