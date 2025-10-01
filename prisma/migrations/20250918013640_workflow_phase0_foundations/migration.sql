-- Guarded cleanup for legacy environments where Invoice.updatedAt already exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Invoice'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Invoice" ALTER COLUMN "updatedAt" DROP DEFAULT';
  END IF;
END $$;
