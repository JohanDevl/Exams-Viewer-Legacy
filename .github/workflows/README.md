# GitHub Actions Workflows for Changelog Management

This folder contains GitHub Actions workflows to automate changelog management.

## 📋 Available Workflows

### 1. `update-changelog.yml` - Automatic updates on PR merges

**Trigger:** When a Pull Request is merged into `main` or `master`

**Function:**

- Automatically replaces `{PR_MERGE_DATE}` with the actual merge date
- Commits and pushes changes automatically

**Usage:**

1. In your PRs, use `{PR_MERGE_DATE}` in CHANGELOG.md
2. When the PR is merged, the date will be automatically replaced

### 2. `release-changelog.yml` - Release management

**Triggers:**

- Automatic: When a GitHub release is published
- Manual: Via GitHub Actions interface

**Function:**

- Transforms `[Unreleased]` into versioned section with date
- Creates a new `[Unreleased]` section for future changes
- Replaces remaining `{PR_MERGE_DATE}` placeholders

**Automatic usage:**

1. Create a GitHub release with a tag (e.g., `v2.1.1`)
2. The workflow triggers automatically

**Manual usage:**

1. Go to Actions → Release Changelog Management
2. Click "Run workflow"
3. Enter the version (e.g., `2.1.1`)
4. Optional: specify a date (otherwise uses today)

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

1. **Adding Features:**

   ```markdown
   ## [Unreleased]

   ### Added

   - My new feature with {PR_MERGE_DATE}
   ```

2. **Creating PR:**

   - Keep `{PR_MERGE_DATE}` as-is in the PR

3. **Merging PR:**
   - GitHub Actions automatically replaces `{PR_MERGE_DATE}` with the actual date

### For Releases:

1. **Automatic Release:**

   - Create a GitHub release with a tag
   - The changelog is automatically updated

2. **Manual Release:**
   - Use the "Release Changelog Management" workflow
   - Specify the version and optionally the date

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
