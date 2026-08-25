-- Migration 010: Sync inspector_id to created_by on inspections table
-- This is a backward-compatibility fix to ensure the created_by NOT NULL constraint is satisfied
-- when the frontend only provides inspector_id.

CREATE OR REPLACE FUNCTION public.sync_inspection_created_by()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.created_by IS NULL AND NEW.inspector_id IS NOT NULL THEN
    NEW.created_by := NEW.inspector_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_inspection_created_by ON public.inspections;

CREATE TRIGGER sync_inspection_created_by
BEFORE INSERT ON public.inspections
FOR EACH ROW
EXECUTE FUNCTION public.sync_inspection_created_by();
