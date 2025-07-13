# GitHub Actions Workflows for Changelog Management

This folder contains GitHub Actions workflows to automate changelog management.

## 📋 Available Workflows

### 1. `update-changelog.yml` - Automatic updates on PR merges

**Trigger:** When a Pull Request is merged into `main` or `master`

**Function:**

- Automatically replaces `{PR_MERGE_DATE}` with the actual merge date
- Commits and pushes changes automatically
- Triggers develop branch synchronization

**Usage:**

1. In your PRs, use `{PR_MERGE_DATE}` in CHANGELOG.md
2. When the PR is merged, the date will be automatically replaced
3. Develop branch is automatically synchronized after successful update

### 2. `release-changelog.yml` - Release management

**Triggers:**

- Automatic: When a GitHub release is published
- Manual: Via GitHub Actions interface

**Function:**

- Transforms `[Unreleased]` into versioned section with date
- Creates a new `[Unreleased]` section for future changes
- Replaces remaining `{PR_MERGE_DATE}` placeholders
- Triggers develop branch synchronization

**Automatic usage:**

1. Create a GitHub release with a tag (e.g., `v2.1.1`)
2. The workflow triggers automatically

**Manual usage:**

1. Go to Actions → Release Changelog Management
2. Click "Run workflow"
3. Enter the version (e.g., `2.1.1`)
4. Optional: specify a date (otherwise uses today)

### 3. `sync-develop.yml` - Automatic develop branch synchronization

**Triggers:**

- Automatic: After `update-changelog.yml` or `release-changelog.yml` completes successfully
- Manual: Via GitHub Actions interface

**Function:**

- Synchronizes `develop` branch with latest `main` changes
- Merges changelog updates and release preparations
- Handles conflicts detection and reporting
- Maintains development branch current with production

**Automatic behavior:**

1. Triggers after changelog workflows complete
2. Checks if develop is behind main
3. Performs fast-forward merge if no conflicts
4. Reports success or failure with detailed summary

**Manual usage:**

1. Go to Actions → Sync Develop Branch
2. Click "Run workflow"
3. Choose force sync option if needed

### 4. `manual-sync-develop.yml` - Advanced develop synchronization

**Trigger:** Manual execution only

**Function:**

- Advanced synchronization with multiple strategies
- Conflict detection and analysis
- Option to create PR instead of direct merge
- Dry run capability for testing

**Strategies:**

- **Merge**: Creates merge commit (recommended)
- **Rebase**: Replays develop commits on main
- **Reset**: Hard reset develop to main (destructive)

**Options:**

- **Create PR**: Creates sync PR instead of direct merge
- **Dry Run**: Analyzes changes without making modifications
- **Force Sync**: Synchronizes even if no changes detected

**Usage:**

1. Go to Actions → Manual Sync Develop
2. Click "Run workflow"
3. Select strategy and options
4. Review dry run results before applying changes

## 🔧 Required Configuration

### Permissions

The workflows need the following permissions:

- `contents: write` - To modify and commit files
- `pull-requests: read` - To read PR information

### Supported Branches

- `main`
- `master`

## 📝 CHANGELOG.md Format

### Expected Structure:

```markdown
# Changelog

## [Unreleased]

### Added

- New feature with {PR_MERGE_DATE}

## [2.1.0] - 2024-01-15

### Added

- Previous feature
```

### Supported Placeholders:

- `{PR_MERGE_DATE}` - Replaced with the PR merge date
- `[Unreleased]` - Transformed into versioned section during releases

## 🚀 Recommended Development Workflow

### For Developers:

1. **Working on Features:**
   - Create feature branches from `develop`
   - Add changelog entries with `{PR_MERGE_DATE}`
   - Submit PR from feature branch to `develop`

2. **Adding Features to Changelog:**

   ```markdown
   ## [Unreleased]

   ### Added

   - My new feature with {PR_MERGE_DATE}
   ```

3. **Creating PR to Main:**
   - Create PR from `develop` to `main` for releases
   - Keep `{PR_MERGE_DATE}` as-is in the PR
   - Include comprehensive changelog entries

4. **After PR Merge:**
   - GitHub Actions automatically replaces `{PR_MERGE_DATE}` with actual date
   - `develop` branch is automatically synchronized with `main`
   - Development can continue immediately on updated `develop`

### For Releases:

1. **Automatic Release:**
   - Create a GitHub release with a tag (e.g., `v2.5.2`)
   - The changelog is automatically updated
   - `develop` branch is synchronized after release preparation

2. **Manual Release:**
   - Use the "Release Changelog Management" workflow
   - Specify the version and optionally the date
   - `develop` synchronization happens automatically

### Branch Synchronization:

1. **Automatic Synchronization:**
   - Happens automatically after changelog updates
   - No manual intervention required in most cases
   - Conflicts are detected and reported

2. **Manual Synchronization:**
   - Use "Sync Develop Branch" for simple sync
   - Use "Manual Sync Develop" for advanced options
   - Dry run available to preview changes

3. **Conflict Resolution:**
   - If conflicts occur, manual intervention is required
   - Use "Manual Sync Develop" with PR option
   - Resolve conflicts in the created PR

## 🔍 Monitoring

### Workflow Verification:

1. Go to the "Actions" tab of your repository
2. Verify that workflows executed without errors
3. Summaries show the changes made

### Useful Logs:

- Each workflow generates a detailed summary
- Logs show exactly what changes were made
- In case of errors, logs indicate the cause

## ⚠️ Important Notes

1. **Backup:** Workflows directly modify CHANGELOG.md
2. **Conflicts:** If the file was modified in the meantime, the workflow may fail
3. **Permissions:** Ensure `GITHUB_TOKEN` has the right permissions
4. **Format:** Follow standard Markdown format for the changelog

## 🛠️ Troubleshooting

### Common Issues:

**Workflow doesn't trigger:**

- Verify that the PR is merged (not just closed)
- Check that the target branch is `main` or `master`

**Permission errors:**

- Check repository permissions
- `GITHUB_TOKEN` must have write access

**Changes not applied:**

- Verify that CHANGELOG.md format is correct
- Check workflow logs for details

**Conflicts during push:**

- The file was modified during workflow execution
- Manually re-run the workflow if necessary
