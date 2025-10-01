-- Phase 3 delivery visibility enhancements

-- Create enums for task transition context and review checklist status
CREATE TYPE "TaskTransitionContext" AS ENUM ('STATUS_CHANGE', 'BILLING_DEFERMENT');

CREATE TYPE "ReviewChecklistStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'COMPLETE', 'DEFERRED');

-- Extend Task model with deliverable metadata
ALTER TABLE "Task"
  ADD COLUMN "isDeliverable" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "deliverableKey" TEXT;

-- Create table to capture task status history with required notes
CREATE TABLE "TaskStatusHistory" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "fromStatus" "TaskStatus",
  "toStatus" "TaskStatus",
  "context" "TaskTransitionContext" NOT NULL DEFAULT 'STATUS_CHANGE',
  "note" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaskStatusHistory_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "TaskStatusHistory"
  ADD CONSTRAINT "TaskStatusHistory_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskStatusHistory"
  ADD CONSTRAINT "TaskStatusHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create tables supporting file review annotations and checklists
CREATE TABLE "FileAnnotation" (
  "id" TEXT NOT NULL,
  "fileId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "page" INTEGER,
  "position" JSONB,
  "comment" TEXT NOT NULL,
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  "resolvedAt" TIMESTAMP(3),
  "resolvedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FileAnnotation_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "FileAnnotation"
  ADD CONSTRAINT "FileAnnotation_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FileAnnotation"
  ADD CONSTRAINT "FileAnnotation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FileAnnotation"
  ADD CONSTRAINT "FileAnnotation_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("clerkId") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "FileReviewChecklistItem" (
  "id" TEXT NOT NULL,
  "fileId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "status" "ReviewChecklistStatus" NOT NULL DEFAULT 'PENDING',
  "note" TEXT,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FileReviewChecklistItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "FileReviewChecklistItem"
  ADD CONSTRAINT "FileReviewChecklistItem_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FileReviewChecklistItem"
  ADD CONSTRAINT "FileReviewChecklistItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("clerkId") ON DELETE SET NULL ON UPDATE CASCADE;
