# Rollback and recovery — Ruang Campus

## Principle

The migration is additive and must not be treated as permission to delete data.
The safest application rollback is a deployment rollback; the safest database
rollback is to stop using new Webinar records while preserving them until an
operator decides how to retain them.

## Before a migration

- Keep a full, tested logical database backup outside this repository.
- Record row counts and protected snapshots described in
  [DATA-MIGRATION.md](DATA-MIGRATION.md).
- Record the migration filenames, Git commit, operator, timestamp, target
  project, and the verified initial admin profile UUID.
- Test restoration to a non-production environment if provider policy permits.

## If the application deployment fails

1. Roll the existing Cloudflare Pages project back to its last known good
   deployment. Do not create a new project or Worker as an emergency bypass.
2. Leave the database unchanged while inspecting application logs and the
   target-specific configuration.
3. Disable publication of affected Webinars rather than deleting records if a
   content-level incident occurs.
4. Preserve logs and snapshots for investigation, without exporting student
   data into source control.

## If the Webinar migration needs to be disabled

The Webinar and Bootcamp grade-audit migrations have no destructive rollback
SQL by design. Dropping Webinar tables could delete newly created Webinar
content, resources, and audit logs; dropping the grade-audit table would erase
the before/after history needed to investigate an approved grading change.
Instead:

1. Roll back the application deployment so routes no longer write to the new
   tables.
2. Revoke the affected `platform_role_assignments` row or revoke admin access
   through the approved operator path if authorization is implicated.
3. Set affected Webinar records to `archived` through an authenticated admin
   operation if public access must stop.
4. Export and review Webinar data before any future approved table removal.

Only after written approval confirms that the new Webinar records can be
discarded may an operator prepare a separately reviewed destructive migration.
It must name exact tables, verify row counts, have a fresh backup, and be run
outside an active incident.

## If historical Bootcamp data appears wrong

1. Stop grading writes and do not recalculate scores automatically.
2. Preserve the corresponding `bootcamp_grade_audit_logs` records and compare
   their before/after snapshots with live memberships, submissions, quiz
   results, attendance, plus points, feedback, and criteria scores.
3. Restore only the smallest approved scope from the tested backup, preserving
   a copy of the current state for forensic comparison.
4. Record the operator, timestamp, source snapshot, affected IDs, and
   validation result. Do not overwrite unrelated students or batches.

The legacy final-score display formula is tested for compatibility but is not a
license to rewrite historical stored grades. Any correction requires an
approved snapshot/dry-run/rollback plan first.
