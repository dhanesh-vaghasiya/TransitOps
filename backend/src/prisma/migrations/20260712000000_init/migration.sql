-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "vehicle_status" AS ENUM ('available', 'on_trip', 'in_shop', 'retired');

-- CreateEnum
CREATE TYPE "vehicle_type" AS ENUM ('van', 'truck', 'lorry', 'bike', 'car', 'bus');

-- CreateEnum
CREATE TYPE "driver_status" AS ENUM ('available', 'on_trip', 'off_duty', 'suspended');

-- CreateEnum
CREATE TYPE "license_category" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');

-- CreateEnum
CREATE TYPE "trip_status" AS ENUM ('draft', 'dispatched', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "maintenance_status" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "maintenance_type" AS ENUM ('oil_change', 'tire_replacement', 'engine_repair', 'brake_service', 'general_inspection', 'other');

-- CreateEnum
CREATE TYPE "expense_category" AS ENUM ('toll', 'parking', 'fine', 'insurance', 'other');

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "status" "user_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "registration_number" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "model" VARCHAR(255),
    "type" "vehicle_type" NOT NULL,
    "max_load_capacity" DECIMAL(10,2) NOT NULL,
    "odometer" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "acquisition_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "vehicle_status" NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "license_number" VARCHAR(100) NOT NULL,
    "license_category" "license_category" NOT NULL,
    "license_expiry" DATE NOT NULL,
    "contact_number" VARCHAR(20),
    "safety_score" DECIMAL(4,2) NOT NULL DEFAULT 100.00,
    "status" "driver_status" NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" SERIAL NOT NULL,
    "trip_number" VARCHAR(50) NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "driver_id" INTEGER NOT NULL,
    "source" VARCHAR(255) NOT NULL,
    "destination" VARCHAR(255) NOT NULL,
    "cargo_weight" DECIMAL(10,2) NOT NULL,
    "planned_distance" DECIMAL(10,2) NOT NULL,
    "actual_distance" DECIMAL(10,2),
    "fuel_consumed" DECIMAL(10,2),
    "status" "trip_status" NOT NULL DEFAULT 'draft',
    "started_at" TIMESTAMP(6),
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_logs" (
    "id" SERIAL NOT NULL,
    "work_order_number" VARCHAR(50) NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "maintenance_type" "maintenance_type" NOT NULL,
    "description" TEXT,
    "cost" DECIMAL(10,2) NOT NULL,
    "status" "maintenance_status" NOT NULL DEFAULT 'scheduled',
    "started_at" TIMESTAMP(6),
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_logs" (
    "id" SERIAL NOT NULL,
    "receipt_number" VARCHAR(80),
    "trip_id" INTEGER,
    "vehicle_id" INTEGER NOT NULL,
    "liters" DECIMAL(10,2) NOT NULL,
    "cost_per_liter" DECIMAL(10,2) NOT NULL,
    "total_cost" DECIMAL(10,2) NOT NULL,
    "odometer_reading" DECIMAL(10,2) NOT NULL,
    "logged_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuel_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "expense_number" VARCHAR(50) NOT NULL,
    "trip_id" INTEGER,
    "vehicle_id" INTEGER NOT NULL,
    "category" "expense_category" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "incurred_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "idx_users_status" ON "users"("status");
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");
CREATE INDEX "idx_user_roles_role" ON "user_roles"("role_id");
CREATE INDEX "idx_user_roles_user" ON "user_roles"("user_id");
CREATE UNIQUE INDEX "vehicles_registration_number_key" ON "vehicles"("registration_number");
CREATE INDEX "idx_vehicles_status" ON "vehicles"("status");
CREATE INDEX "idx_vehicles_type" ON "vehicles"("type");
CREATE UNIQUE INDEX "drivers_license_number_key" ON "drivers"("license_number");
CREATE INDEX "idx_drivers_status" ON "drivers"("status");
CREATE INDEX "idx_drivers_license_expiry" ON "drivers"("license_expiry");
CREATE INDEX "idx_drivers_name" ON "drivers"("name");
CREATE UNIQUE INDEX "trips_trip_number_key" ON "trips"("trip_number");
CREATE INDEX "idx_trips_status" ON "trips"("status");
CREATE INDEX "idx_trips_vehicle" ON "trips"("vehicle_id");
CREATE INDEX "idx_trips_driver" ON "trips"("driver_id");
CREATE INDEX "idx_trips_dates" ON "trips"("created_at");
CREATE UNIQUE INDEX "maintenance_logs_work_order_number_key" ON "maintenance_logs"("work_order_number");
CREATE INDEX "idx_maintenance_vehicle" ON "maintenance_logs"("vehicle_id");
CREATE INDEX "idx_maintenance_status" ON "maintenance_logs"("status");
CREATE UNIQUE INDEX "fuel_logs_receipt_number_key" ON "fuel_logs"("receipt_number");
CREATE INDEX "idx_fuel_vehicle" ON "fuel_logs"("vehicle_id");
CREATE INDEX "idx_fuel_trip" ON "fuel_logs"("trip_id");
CREATE UNIQUE INDEX "expenses_expense_number_key" ON "expenses"("expense_number");
CREATE INDEX "idx_expenses_vehicle" ON "expenses"("vehicle_id");
CREATE INDEX "idx_expenses_trip" ON "expenses"("trip_id");
CREATE INDEX "idx_expenses_category" ON "expenses"("category");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraints
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_max_load_capacity_check" CHECK ("max_load_capacity" > 0);
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_odometer_check" CHECK ("odometer" >= 0);
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_acquisition_cost_check" CHECK ("acquisition_cost" >= 0);
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_safety_score_check" CHECK ("safety_score" >= 0 AND "safety_score" <= 100);
ALTER TABLE "trips" ADD CONSTRAINT "trips_cargo_weight_check" CHECK ("cargo_weight" > 0);
ALTER TABLE "trips" ADD CONSTRAINT "trips_planned_distance_check" CHECK ("planned_distance" > 0);
ALTER TABLE "trips" ADD CONSTRAINT "trips_actual_distance_check" CHECK ("actual_distance" IS NULL OR "actual_distance" >= 0);
ALTER TABLE "trips" ADD CONSTRAINT "trips_fuel_consumed_check" CHECK ("fuel_consumed" IS NULL OR "fuel_consumed" >= 0);
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_cost_check" CHECK ("cost" >= 0);
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_liters_check" CHECK ("liters" > 0);
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_cost_per_liter_check" CHECK ("cost_per_liter" > 0);
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_total_cost_check" CHECK ("total_cost" > 0);
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_odometer_reading_check" CHECK ("odometer_reading" >= 0);
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_amount_check" CHECK ("amount" >= 0);

-- Status transition triggers
CREATE OR REPLACE FUNCTION fn_trip_dispatched()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'dispatched' AND OLD.status = 'draft' THEN
        UPDATE vehicles SET status = 'on_trip', updated_at = CURRENT_TIMESTAMP WHERE id = NEW.vehicle_id;
        UPDATE drivers SET status = 'on_trip', updated_at = CURRENT_TIMESTAMP WHERE id = NEW.driver_id;
        NEW.started_at := COALESCE(NEW.started_at, CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trip_dispatched
    BEFORE UPDATE ON trips
    FOR EACH ROW
    WHEN (OLD.status = 'draft' AND NEW.status = 'dispatched')
    EXECUTE FUNCTION fn_trip_dispatched();

CREATE OR REPLACE FUNCTION fn_trip_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status = 'dispatched' THEN
        UPDATE vehicles SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = NEW.vehicle_id;
        UPDATE drivers SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = NEW.driver_id;
        NEW.completed_at := COALESCE(NEW.completed_at, CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trip_completed
    BEFORE UPDATE ON trips
    FOR EACH ROW
    WHEN (OLD.status = 'dispatched' AND NEW.status = 'completed')
    EXECUTE FUNCTION fn_trip_completed();

CREATE OR REPLACE FUNCTION fn_trip_cancelled()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status = 'dispatched' THEN
        UPDATE vehicles SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = NEW.vehicle_id;
        UPDATE drivers SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = NEW.driver_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trip_cancelled
    BEFORE UPDATE ON trips
    FOR EACH ROW
    WHEN (OLD.status = 'dispatched' AND NEW.status = 'cancelled')
    EXECUTE FUNCTION fn_trip_cancelled();

CREATE OR REPLACE FUNCTION fn_maintenance_started()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'in_progress' AND OLD.status = 'scheduled' THEN
        UPDATE vehicles SET status = 'in_shop', updated_at = CURRENT_TIMESTAMP WHERE id = NEW.vehicle_id;
        NEW.started_at := COALESCE(NEW.started_at, CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maintenance_started
    BEFORE UPDATE ON maintenance_logs
    FOR EACH ROW
    WHEN (OLD.status = 'scheduled' AND NEW.status = 'in_progress')
    EXECUTE FUNCTION fn_maintenance_started();

CREATE OR REPLACE FUNCTION fn_maintenance_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
        UPDATE vehicles SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = NEW.vehicle_id;
        NEW.completed_at := COALESCE(NEW.completed_at, CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maintenance_completed
    BEFORE UPDATE ON maintenance_logs
    FOR EACH ROW
    WHEN (OLD.status = 'in_progress' AND NEW.status = 'completed')
    EXECUTE FUNCTION fn_maintenance_completed();

-- Dashboard and reporting views
CREATE OR REPLACE VIEW v_vehicle_utilization AS
SELECT
    v.id,
    v.registration_number,
    v.name,
    v.status,
    COUNT(t.id) FILTER (WHERE t.status = 'completed') AS total_trips,
    COALESCE(SUM(t.actual_distance), 0) AS total_distance,
    COALESCE(SUM(t.fuel_consumed), 0) AS total_fuel,
    CASE
        WHEN COALESCE(SUM(t.fuel_consumed), 0) = 0 THEN 0
        ELSE COALESCE(SUM(t.actual_distance), 0) / COALESCE(SUM(t.fuel_consumed), 0)
    END AS fuel_efficiency
FROM vehicles v
LEFT JOIN trips t ON v.id = t.vehicle_id
GROUP BY v.id, v.registration_number, v.name, v.status;

CREATE OR REPLACE VIEW v_operational_cost AS
WITH fuel_totals AS (
    SELECT vehicle_id, SUM(total_cost) AS total_fuel_cost
    FROM fuel_logs
    GROUP BY vehicle_id
),
maintenance_totals AS (
    SELECT vehicle_id, SUM(cost) AS total_maintenance_cost
    FROM maintenance_logs
    GROUP BY vehicle_id
),
expense_totals AS (
    SELECT vehicle_id, SUM(amount) AS total_other_expenses
    FROM expenses
    GROUP BY vehicle_id
)
SELECT
    v.id AS vehicle_id,
    v.registration_number,
    COALESCE(f.total_fuel_cost, 0) AS total_fuel_cost,
    COALESCE(m.total_maintenance_cost, 0) AS total_maintenance_cost,
    COALESCE(e.total_other_expenses, 0) AS total_other_expenses,
    COALESCE(f.total_fuel_cost, 0) + COALESCE(m.total_maintenance_cost, 0) + COALESCE(e.total_other_expenses, 0) AS total_operational_cost
FROM vehicles v
LEFT JOIN fuel_totals f ON v.id = f.vehicle_id
LEFT JOIN maintenance_totals m ON v.id = m.vehicle_id
LEFT JOIN expense_totals e ON v.id = e.vehicle_id;

CREATE OR REPLACE VIEW v_fleet_kpi AS
SELECT
    (SELECT COUNT(*) FROM vehicles WHERE status = 'available') AS available_vehicles,
    (SELECT COUNT(*) FROM vehicles WHERE status = 'on_trip') AS active_vehicles,
    (SELECT COUNT(*) FROM vehicles WHERE status = 'in_shop') AS maintenance_vehicles,
    (SELECT COUNT(*) FROM vehicles) AS total_vehicles,
    (SELECT COUNT(*) FROM trips WHERE status = 'dispatched') AS active_trips,
    (SELECT COUNT(*) FROM trips WHERE status = 'draft') AS pending_trips,
    (SELECT COUNT(*) FROM drivers WHERE status = 'on_trip') AS drivers_on_duty,
    (SELECT COUNT(*) FROM drivers) AS total_drivers;
