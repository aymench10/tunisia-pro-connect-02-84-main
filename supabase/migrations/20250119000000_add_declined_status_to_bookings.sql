-- Add 'declined' status to bookings table
-- This migration updates the CHECK constraint to include 'declined' as a valid status

-- Drop the existing constraint
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add the new constraint with 'declined' included
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'declined'));

-- Comment for documentation
COMMENT ON CONSTRAINT bookings_status_check ON public.bookings IS 
  'Valid booking statuses: pending, confirmed, completed, cancelled, declined';
