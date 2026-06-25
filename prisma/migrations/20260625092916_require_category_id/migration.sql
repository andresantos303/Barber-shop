-- AlterTable
-- `category` is dropped now that every row has been backfilled with a `categoryId`
-- (verified: 0 rows with NULL categoryId as of this migration).
ALTER TABLE "Service" DROP COLUMN "category";
ALTER TABLE "Service" ALTER COLUMN "categoryId" SET NOT NULL;
