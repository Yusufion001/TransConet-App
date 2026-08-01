-- PostgreSQL Row-Level Security (RLS) Setup Script for TransConet
-- This script applies strict database-level security policies to prevent unauthorized data access.
-- Requires PostgreSQL 12+

-- 1. Enable RLS on core tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TransporterProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vehicle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LoadPosting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Bid" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportTicket" ENABLE ROW LEVEL SECURITY;

-- 2. Define Policies for "User" table
-- Users can only read and update their own accounts, Admins have full access
CREATE POLICY "Users can view and manage their own record" ON "User"
  FOR ALL
  USING (
    id = current_setting('app.current_user_id', true) OR 
    current_setting('app.current_role', true) = 'ADMIN'
  );

-- 3. Define Policies for "TransporterProfile"
CREATE POLICY "Transporters manage own profiles" ON "TransporterProfile"
  FOR ALL
  USING (
    "userId" = current_setting('app.current_user_id', true) OR 
    current_setting('app.current_role', true) = 'ADMIN'
  );

-- Anyone can view verified transporters
CREATE POLICY "Public can view verified transporters" ON "TransporterProfile"
  FOR SELECT
  USING ("isVerified" = true);

-- 4. Define Policies for "Vehicle"
CREATE POLICY "Transporters manage own vehicles" ON "Vehicle"
  FOR ALL
  USING (
    "transporterProfileId" IN (
      SELECT id FROM "TransporterProfile" WHERE "userId" = current_setting('app.current_user_id', true)
    ) OR current_setting('app.current_role', true) = 'ADMIN'
  );

-- 5. Define Policies for "LoadPosting"
CREATE POLICY "Customers manage own load postings" ON "LoadPosting"
  FOR ALL
  USING (
    "customerId" = current_setting('app.current_user_id', true) OR 
    current_setting('app.current_role', true) = 'ADMIN'
  );

-- Any authenticated user can view available load postings (Marketplace)
CREATE POLICY "Marketplace loads are public to users" ON "LoadPosting"
  FOR SELECT
  USING (status = 'AVAILABLE');

-- 6. Define Policies for "Bid"
CREATE POLICY "Drivers manage their own bids" ON "Bid"
  FOR ALL
  USING (
    "driverId" = current_setting('app.current_user_id', true) OR 
    current_setting('app.current_role', true) = 'ADMIN'
  );

CREATE POLICY "Customers can view bids on their own loads" ON "Bid"
  FOR SELECT
  USING (
    "loadId" IN (
      SELECT id FROM "LoadPosting" WHERE "customerId" = current_setting('app.current_user_id', true)
    )
  );

-- 7. Define Policies for "SupportTicket"
CREATE POLICY "Users manage their own support tickets" ON "SupportTicket"
  FOR ALL
  USING (
    "userId" = current_setting('app.current_user_id', true) OR 
    current_setting('app.current_role', true) = 'ADMIN'
  );

-- Informational: Prisma Client Extension for RLS handles the injection of app.current_user_id during transactions
-- by wrapping operations in a set_config() call inside `src/db/prisma.ts`.

-- 8. Enforce Strict Single-Role Identity (Immutable Role)
-- Ensure that once a user is created as CUSTOMER or TRANSPORTER, it cannot be changed.
CREATE OR REPLACE FUNCTION enforce_immutable_role()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        RAISE EXCEPTION 'Role switching is strictly prohibited. The role % is immutable for this account.', OLD.role;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS immutable_role_trigger ON "User";
CREATE TRIGGER immutable_role_trigger
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION enforce_immutable_role();
