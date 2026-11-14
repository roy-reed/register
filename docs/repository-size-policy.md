# Repository size and domain-data retention

The `domains/` tree is the source of truth for active DNS records. Its JSON files are
operational data, so they stay in Git while the records are active. This policy prevents
generated exports, caches, and local tooling output from becoming a second source of truth.

## Audit baseline

A GitHub API audit on 2026-11-13 reported a repository size of approximately 347,050 KiB.
That number is an evaluation baseline and can change with GitHub's storage accounting.

The CI command `npm run check:repository-size` reports the total size of tracked files and
the twenty largest files. It warns at 350 MiB and fails when a single tracked file reaches
90 MiB, leaving room below GitHub's 100 MiB per-file limit.

## Retention and review

- Keep active domain records and the minimal metadata required to review them.
- Do not commit generated exports, caches, local logs, or package-manager directories.
- Review tracked size and the largest files at least quarterly.
- When the repository approaches 400 MiB, prepare a migration review before adding bulk data.
- Do not rewrite Git history or delete domain records as a routine size fix.

## Migration procedure

If an inactive data set must leave the active repository:

1. Export the exact files and record the date, source commit, and retention reason.
2. Store an encrypted archive outside the repository and create a SHA-256 manifest.
3. Verify the archive by restoring it to a temporary location and comparing the manifest.
4. Record the archive location, owner, expiry/review date, and restore instructions in the change.
5. Remove the files through a normal reviewed pull request after restore verification.

History compaction or removal of previously published records requires a separate decision
because it affects auditability and downstream consumers.
