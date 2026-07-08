# Tasks Checklist: E-Commerce Database Setup

- [x] Configure backend `.env` variables with correct parameters (`fashion_store`)
- [x] Create database folders (`backend/modules/database/migrations/`)
- [x] Write migration SQL scripts:
  - [x] `v1_core_schema.sql` (Creates 81 tables and core constraints)
  - [x] `v2_indexing_triggers.sql` (Indexes, soft delete optimizations, automatic updated_at triggers)
  - [x] `v3_seed_data.sql` (Demo seeding data for admin, categories, products, inventory)
- [x] Write CLI migration scripts:
  - [x] `run_migration.js` (Executes v1, v2, v3 in a transaction)
  - [x] `rollback_migration.js` (Rolls back database tables safely)
- [x] Update `backend/db.js` helper config to target `fashion_store`
- [x] Run migration script on database
- [x] Verify that all 81 tables exist and display row counts
