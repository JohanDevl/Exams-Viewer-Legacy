# Scripts Reference Guide

Quick reference for Exams Viewer Python scripts and maintenance operations.

## Essential Commands

### 🚀 Quick Operations

```bash
# Update manifest (most common operation)
python3 scripts/update_manifest.py

# Full system update (scraping + manifest) - RECOMMENDED
python3 scripts/update_all_exams.py

# Individual exam scraping (with automatic manifest update)
python3 scripts/scraper.py [EXAM_CODE]

# Check current manifest status
ls -la data/manifest.json
```

### 📊 Manifest Information

The manifest contains essential metadata for all exams:
- Total exams and questions
- Individual exam question counts
- Last update timestamps
- Optimized for frontend performance

### 🔧 Maintenance Tasks

| Task | Command | Frequency | Auto-Manifest |
|------|---------|-----------|---------------|
| Update manifest only | `python3 scripts/update_manifest.py` | After data changes | N/A |
| Full update | `python3 scripts/update_all_exams.py` | Weekly/Monthly | ✅ Yes |
| Individual exam | `python3 scripts/scraper.py [CODE]` | As needed | ✅ Yes |

## File Structure

```
scripts/
├── README.md              # Quick start guide
├── update_manifest.py     # Manifest generator (main script)
├── scraper.py            # Web scraping functionality
└── update_all_exams.py   # Batch operations

data/
├── manifest.json         # Optimized metadata file
├── manifest.json.backup  # Automatic backup
└── [EXAM_CODE]/         # Individual exam directories
    ├── exam.json        # Question data
    └── links.json       # Scraping metadata
```

## Performance Benefits

### Before Optimization
- 🐌 20+ HTTP requests on page load
- ⏳ Progressive loading with "Loading..." states
- 📡 ~200KB+ initial data transfer

### After Optimization  
- ⚡ 1 HTTP request for manifest (~6KB)
- 🚀 Instant display of all exam information
- 📱 Better mobile performance
- 🎯 Lazy loading of selected exams only

## Troubleshooting

### Common Issues

**Permission denied**:
```bash
chmod +x scripts/update_manifest.py
```

**JSON validation errors**:
```bash
python3 -m json.tool data/manifest.json
```

**Missing exam data**:
```bash
find data/ -name "exam.json" -type f | wc -l
```

### Validation

The manifest includes built-in validation:
- Required field checking
- JSON structure validation
- Question count verification
- Automatic backup creation

## Integration

### CI/CD Pipeline
```yaml
# Example GitHub Action step
- name: Update Manifest
  run: python3 scripts/update_manifest.py
```

### Pre-deployment
Always run before deploying:
```bash
python3 scripts/update_manifest.py
git add data/manifest.json
git commit -m "update: refresh manifest with latest exam data"
```

## Advanced Usage

### Batch Operations
```bash
# Update specific exams then regenerate manifest
python3 scripts/scraper.py CAD
python3 scripts/scraper.py CSA
python3 scripts/update_manifest.py
```

### Development
```bash
# Test manifest generation without saving
python3 -c "
from scripts.update_manifest import generate_manifest
manifest = generate_manifest()
print(f'Would generate manifest with {len(manifest[\"exams\"])} exams')
"
```

For detailed documentation, see [scripts/SCRIPTS_DOCUMENTATION.md](scripts/SCRIPTS_DOCUMENTATION.md).