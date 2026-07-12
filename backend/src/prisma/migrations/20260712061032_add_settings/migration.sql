-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "depot_name" VARCHAR(255) NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "distance_unit" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
