-- CreateEnum
CREATE TYPE "IntakeStatus" AS ENUM ('REVIEW_PENDING', 'RETURNED_FOR_INFO', 'APPROVED_FOR_ESTIMATE', 'ESTIMATE_IN_PROGRESS', 'ESTIMATE_SENT', 'CLIENT_SCOPE_APPROVED', 'CLIENT_SCOPE_DECLINED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'CLIENT_APPROVAL_PENDING', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ProjectWorkflowPhase" AS ENUM ('INTAKE', 'ESTIMATION', 'KICKOFF', 'DELIVERY', 'REVIEW', 'BILLING', 'COMPLETE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InvoiceWorkflowState" AS ENUM ('AWAITING_VALIDATION', 'READY_TO_SEND', 'SCHEDULED', 'SENT_AND_PENDING_PAYMENT', 'IN_REMINDER_SEQUENCE', 'PAID_AND_CONFIRMED', 'CLOSED');

-- CreateEnum
CREATE TYPE "IntakePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "intakeStatus" "IntakeStatus" NOT NULL DEFAULT 'REVIEW_PENDING',
ADD COLUMN     "kickoffCompletedAt" TIMESTAMP(3),
ADD COLUMN     "kickoffScheduledAt" TIMESTAMP(3),
ADD COLUMN     "workflowMetadata" JSONB,
ADD COLUMN     "workflowPhase" "ProjectWorkflowPhase" NOT NULL DEFAULT 'INTAKE',
ADD COLUMN     "workflowPhaseUpdatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "reminderSequenceStartedAt" TIMESTAMP(3),
ADD COLUMN     "scheduledSendAt" TIMESTAMP(3),
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "validatedAt" TIMESTAMP(3),
ADD COLUMN     "validationSummary" TEXT,
ADD COLUMN     "workflowState" "InvoiceWorkflowState" NOT NULL DEFAULT 'AWAITING_VALIDATION';

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "entityType" TEXT,
ADD COLUMN     "intakeId" TEXT,
ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "proposalId" TEXT;

-- CreateTable
CREATE TABLE "Intake" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "status" "IntakeStatus" NOT NULL DEFAULT 'REVIEW_PENDING',
    "assignedAdminId" TEXT,
    "checklist" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedForEstimateAt" TIMESTAMP(3),
    "returnedForInfoAt" TIMESTAMP(3),
    "estimateInProgressAt" TIMESTAMP(3),
    "estimateSentAt" TIMESTAMP(3),
    "clientDecisionAt" TIMESTAMP(3),
    "notes" TEXT,
    "summary" TEXT,
    "formData" JSONB,
    "priority" "IntakePriority" NOT NULL DEFAULT 'MEDIUM',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectProposal" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "intakeId" TEXT,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "preparedById" TEXT,
    "summary" TEXT,
    "lineItems" JSONB,
    "estimatedHours" DOUBLE PRECISION,
    "estimateAmount" DOUBLE PRECISION,
    "selectedModules" JSONB,
    "sentAt" TIMESTAMP(3),
    "clientViewedAt" TIMESTAMP(3),
    "clientApprovedAt" TIMESTAMP(3),
    "clientDeclinedAt" TIMESTAMP(3),
    "approvalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Intake_projectId_key" ON "Intake"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectProposal_projectId_key" ON "ProjectProposal"("projectId");
CREATE UNIQUE INDEX "ProjectProposal_intakeId_key" ON "ProjectProposal"("intakeId");

-- AddForeignKey
ALTER TABLE "Intake" ADD CONSTRAINT "Intake_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intake" ADD CONSTRAINT "Intake_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intake" ADD CONSTRAINT "Intake_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "User"("clerkId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectProposal" ADD CONSTRAINT "ProjectProposal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectProposal" ADD CONSTRAINT "ProjectProposal_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectProposal" ADD CONSTRAINT "ProjectProposal_preparedById_fkey" FOREIGN KEY ("preparedById") REFERENCES "User"("clerkId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "ProjectProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
