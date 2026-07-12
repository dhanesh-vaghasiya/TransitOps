-- AlterEnum
BEGIN;
CREATE TYPE "license_category_new" AS ENUM ('van', 'truck', 'lorry', 'bike', 'car', 'bus');
ALTER TABLE "drivers" ALTER COLUMN "license_category" TYPE "license_category_new" USING ("license_category"::text::"license_category_new");
ALTER TYPE "license_category" RENAME TO "license_category_old";
ALTER TYPE "license_category_new" RENAME TO "license_category";
DROP TYPE "public"."license_category_old";
COMMIT;

-- AlterTable
ALTER TABLE "drivers" ALTER COLUMN "safety_score" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "rbac_matrix" JSONB;

-- CreateTable
CREATE TABLE "security_logs" (
    "id" SERIAL NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "details" TEXT NOT NULL,
    "user_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);
