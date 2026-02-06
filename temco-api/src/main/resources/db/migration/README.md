# Database Migrations (Flyway)

## Overview
This project uses **Flyway** to manage database schema changes automatically.

## How It Works
1. On application startup, `FlywayMigrationRunner.java` runs automatically
2. Flyway checks the `flyway_schema_history` table for applied migrations
3. Any new migration files are executed in order
4. The schema version is recorded

## Migration File Naming Convention
```
V{version}__{description}.sql
```

**Examples:**
- `V1__baseline_schema.sql` - Initial schema
- `V2__add_user_preferences.sql` - Add new table
- `V3__alter_login_session.sql` - Modify existing table

**Rules:**
- Version numbers must be unique and sequential
- Use double underscore `__` between version and description
- Use underscores `_` in description (no spaces)
- Files are immutable once deployed (never edit applied migrations)

## Adding a New Migration

### Step 1: Create the file
```sql
-- V2__add_new_feature.sql
CREATE TABLE IF NOT EXISTS new_feature (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);
```

### Step 2: Commit to Git
```bash
git add src/main/resources/db/migration/V2__add_new_feature.sql
git commit -m "Add migration for new_feature table"
git push
```

### Step 3: Deploy
The CI/CD pipeline will build the WAR with the new migration.
On startup, Flyway will automatically apply it.

## Checking Migration Status
```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

## Troubleshooting

### "Migration checksum mismatch"
Someone modified an already-applied migration. **Never do this.**
Fix: Restore the original file or repair the schema history.

### "Migration failed"
Check the SQL syntax. Flyway stops on first error.
Fix: Correct the SQL and redeploy.

## First-Time Setup on Existing Database
For databases that already have tables, Flyway will:
1. Create `flyway_schema_history` table
2. Baseline at version 0 (skip V1 if tables exist)
3. Apply only new migrations going forward
