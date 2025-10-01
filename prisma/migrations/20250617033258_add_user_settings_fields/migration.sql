-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "dateFormat" TEXT DEFAULT 'MM/DD/YYYY',
ADD COLUMN     "emailNotifications" BOOLEAN DEFAULT true,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "language" TEXT DEFAULT 'en',
ADD COLUMN     "notificationPreferences" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "pushNotifications" BOOLEAN DEFAULT true,
ADD COLUMN     "timeFormat" TEXT DEFAULT '12h',
ADD COLUMN     "timezone" TEXT DEFAULT 'America/New_York';
