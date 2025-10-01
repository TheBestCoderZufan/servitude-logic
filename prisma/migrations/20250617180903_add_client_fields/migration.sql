-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "industry" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "preferredCommunication" TEXT DEFAULT 'email',
ADD COLUMN     "projectBudget" DOUBLE PRECISION,
ADD COLUMN     "website" TEXT;
