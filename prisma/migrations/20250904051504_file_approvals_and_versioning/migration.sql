-- CreateEnum
CREATE TYPE "FileApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'CHANGES_REQUESTED');

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "approvalStatus" "FileApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "FileApproval" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "fileId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileApproval_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("clerkId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileApproval" ADD CONSTRAINT "FileApproval_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileApproval" ADD CONSTRAINT "FileApproval_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
