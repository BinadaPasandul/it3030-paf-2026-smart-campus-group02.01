ALTER TABLE IF EXISTS tickets
    ADD COLUMN IF NOT EXISTS category VARCHAR(255);

ALTER TABLE IF EXISTS tickets
    ADD COLUMN IF NOT EXISTS location VARCHAR(255);

ALTER TABLE IF EXISTS tickets
    ADD COLUMN IF NOT EXISTS priority VARCHAR(255);

UPDATE tickets
SET category = 'Other'
WHERE category IS NULL;

UPDATE tickets
SET location = 'Not specified'
WHERE location IS NULL;

UPDATE tickets
SET priority = 'MEDIUM'
WHERE priority IS NULL;
