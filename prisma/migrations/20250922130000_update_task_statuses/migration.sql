-- Redefine TaskStatus enum to support delivery workflow states
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";

CREATE TYPE "TaskStatus" AS ENUM (
  'BACKLOG',
  'IN_PROGRESS',
  'BLOCKED',
  'READY_FOR_REVIEW',
  'CLIENT_APPROVED',
  'DONE'
);

-- Drop existing default so it can be recreated after the type conversion
ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Task"
  ALTER COLUMN "status" TYPE "TaskStatus"
  USING (
    CASE "status"
      WHEN 'TODO' THEN 'BACKLOG'::"TaskStatus"
      WHEN 'BACKLOG' THEN 'BACKLOG'::"TaskStatus"
      WHEN 'IN_PROGRESS' THEN 'IN_PROGRESS'::"TaskStatus"
      WHEN 'DONE' THEN 'DONE'::"TaskStatus"
      ELSE 'BACKLOG'::"TaskStatus"
    END
  );

ALTER TABLE "Task"
  ALTER COLUMN "status" SET DEFAULT 'BACKLOG'::"TaskStatus";

DROP TYPE "TaskStatus_old";
