# Mandatory Database Query Notification Rule

Every single response to the user MUST conclude with a clear and explicit **Database Action Required** section:

1. **Check Every Request for Database Impact**:
   - Assess if the requested changes require:
     - New database tables, columns, or altered types
     - Foreign keys, constraints, or unique indexes
     - Row-Level Security (RLS) policies or grants
     - Stored procedures, triggers, or migrations
     - Data backfills, seeds, or cleanup queries

2. **If Manual SQL Execution IS Required**:
   - Explicitly provide the exact, copy-pasteable SQL snippet.
   - Specify the target database (`Supabase SQL Editor`).
   - Clearly describe what the query accomplishes and any safety precautions.

3. **If NO Database Queries Are Required**:
   - You MUST explicitly include the following confirmation at the end of the response:
     > **Database Status**: No manual database queries required for this update. (All operations are fully wired through the client/API or no schema changes were involved).
