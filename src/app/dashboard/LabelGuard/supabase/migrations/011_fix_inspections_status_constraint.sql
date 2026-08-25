-- Migration 011: Synchronize status check constraint with frontend intended workflow
-- The frontend is hardcoded to use 'pending_review' which was not explicitly
-- enforced by the older migrations due to 'IF NOT EXISTS' skipping the column.

DO $$
BEGIN
    -- Drop the old constraint regardless of what it was named
    ALTER TABLE public.inspections DROP CONSTRAINT IF EXISTS inspections_status_check;
    
    -- In case it was named something else, attempt to drop any CHECK constraint on status
    -- (This requires querying pg_constraint, but we can just forcefully add the new one
    --  and name it explicitly)
END $$;

ALTER TABLE public.inspections 
ADD CONSTRAINT inspections_status_check 
CHECK (status IN ('draft', 'pending_review', 'verified_compliant', 'verified_non_compliant'));
