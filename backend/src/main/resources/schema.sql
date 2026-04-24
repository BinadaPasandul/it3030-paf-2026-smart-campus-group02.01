ALTER TABLE IF EXISTS tickets
    ADD COLUMN IF NOT EXISTS category VARCHAR(255);

ALTER TABLE IF EXISTS tickets
    ADD COLUMN IF NOT EXISTS location VARCHAR(255);

ALTER TABLE IF EXISTS tickets
    ADD COLUMN IF NOT EXISTS priority VARCHAR(255);

ALTER TABLE IF EXISTS bookings
    ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP;

ALTER TABLE IF EXISTS bookings
    DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE IF EXISTS bookings
    ADD CONSTRAINT bookings_status_check
    CHECK (status IN ('PENDING', 'APPROVED', 'CHECKED_IN', 'REJECTED', 'CANCELLED'));

UPDATE tickets
SET category = 'Other'
WHERE category IS NULL;

UPDATE tickets
SET location = 'Not specified'
WHERE location IS NULL;

UPDATE tickets
SET priority = 'MEDIUM'
WHERE priority IS NULL;
