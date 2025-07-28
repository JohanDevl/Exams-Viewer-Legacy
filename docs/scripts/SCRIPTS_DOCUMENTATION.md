# Scripts Documentation

This directory contains Python scripts for managing the Exams Viewer project data and operations.

## Available Scripts

### 🔧 Core Scripts

#### `update_manifest.py`
**Purpose**: Generates and maintains the optimized manifest.json file with exam metadata.

**Features**:
- Scans all exam directories automatically
- Extracts question counts, names, and metadata
- Creates optimized manifest for fast frontend loading
- Validates manifest structure
- Creates automatic backups

**Usage**:
```bash
python3 scripts/update_manifest.py
```

**Output**:
- Updates `data/manifest.json`
- Creates `data/manifest.json.backup`
- Shows statistics (total exams, questions)

#### `scraper.py`
**Purpose**: Web scraping script for collecting exam questions from ExamTopics.

**Features**:
- Individual exam scraping with flexible options
- Automatic manifest update after successful scraping
- Respectful scraping with built-in delays
- Force rescan and force update capabilities
- Progress tracking and detailed logging

**Usage**:
```bash
# Basic usage (with automatic manifest update)
python3 scripts/scraper.py CAD

# Advanced options
python3 scripts/scraper.py CSA --force-rescan --force-update
python3 scripts/scraper.py CIS-APM --rapid

# Get help with all options
python3 scripts/scraper.py --help
```

#### `update_all_exams.py`
**Purpose**: Batch script to update all exams and regenerate the manifest.

**Features**:
- Updates all exam data via scraping
- Automatically regenerates manifest after scraping
- Maintains data consistency

**Usage**:
```bash
python3 scripts/update_all_exams.py
```

## Manifest Structure

The manifest.json file follows this optimized structure:

```json
{
  "version": "3.0",
  "generated": "2025-07-28T07:38:50.408557",
  "totalExams": 20,
  "totalQuestions": 2593,
  "exams": [
    {
      "code": "CAD",
      "name": "CAD",
      "description": "CAD certification exam questions",
      "questionCount": 158,
      "lastUpdated": "2025-07-27T22:50:00.961912"
    }
  ]
}
```

## Best Practices

### When to Regenerate Manifest
- After adding new exam data
- After updating existing exams
- After changing exam structure
- Before deploying to production

### Automation
The manifest is automatically updated when running:
- `update_all_exams.py` (includes manifest regeneration after batch updates)
- `scraper.py [EXAM_CODE]` (includes manifest regeneration after individual scraping)
- Any successful scraping operation that modifies exam data

**Note**: Only `update_manifest.py` requires manual execution - all scraping scripts automatically maintain manifest consistency.

### Data Validation
All scripts include:
- JSON structure validation
- Error handling and reporting
- Backup creation before modifications
- Progress logging and statistics

## Performance Benefits

The optimized manifest system provides:
- **~90% reduction** in initial HTTP requests
- **Instant display** of exam information on homepage
- **Lazy loading** of actual exam data
- **Better user experience** with immediate feedback

## Troubleshooting

### Common Issues

**Manifest generation fails**:
```bash
# Check data directory permissions
ls -la data/

# Verify exam.json files are valid
python3 -m json.tool data/[EXAM_CODE]/exam.json
```

**Missing exam data**:
```bash
# Check if exam directories exist
find data/ -name "exam.json" -type f
```

**Validation errors**:
- Ensure all exam.json files are valid JSON
- Check that question arrays are not empty
- Verify file permissions are correct

## Development Notes

### Script Dependencies
- Python 3.6+
- Standard library only (no external dependencies)
- Compatible with all major operating systems

### File Structure
```
scripts/
├── update_manifest.py    # Core manifest generator
├── scraper.py           # Web scraping functionality  
└── update_all_exams.py  # Batch update operations
```

### Integration
Scripts are designed to work together:
1. `scraper.py` collects raw exam data
2. `update_all_exams.py` orchestrates batch operations
3. `update_manifest.py` optimizes data for frontend consumption

## Future Enhancements

### Planned Features
- Incremental manifest updates
- Exam data validation hooks
- Performance metrics collection
- Automated testing integration

### Maintenance
- Regular cleanup of backup files
- Monitor manifest file size growth
- Optimize for large exam collections