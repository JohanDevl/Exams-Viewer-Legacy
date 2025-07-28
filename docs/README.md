# Exams Viewer Documentation

Complete documentation for the Exams Viewer application.

## 🚀 Quick Start
- [Installation Guide](INSTALLATION.md) - Setup and deployment
- [Usage Guide](USAGE.md) - How to use the application
- [Scripts Reference](SCRIPTS_REFERENCE.md) - Python scripts quick reference

## 📚 Core Documentation

### User Guides
- [Features Overview](FEATURES.md) - Complete feature list
- [Navigation](NAVIGATION.md) - User interface guide
- [Statistics](STATISTICS.md) - Learning analytics and progress tracking

### Technical Documentation
- [API Reference](API.md) - API documentation
- [Development Guide](DEVELOPMENT.md) - Development setup and contribution
- [Performance Optimizations](PERFORMANCE_OPTIMIZATIONS.md) - v3.0 manifest system improvements

## 🔧 Scripts & Tools

### Python Scripts
- [Scripts Documentation](scripts/SCRIPTS_DOCUMENTATION.md) - Detailed scripts documentation
- [Scripts Reference](SCRIPTS_REFERENCE.md) - Quick reference and commands

### Key Scripts
| Script | Purpose | Documentation |
|--------|---------|---------------|
| `update_manifest.py` | Generate optimized manifest | [Scripts Docs](scripts/SCRIPTS_DOCUMENTATION.md) |
| `scraper.py` | Web scraping functionality | [Scraper Guide](SCRAPER_IMPROVEMENTS.md) |
| `update_all_exams.py` | Batch operations | [Scripts Reference](SCRIPTS_REFERENCE.md) |

## 🎯 Feature-Specific Guides

### User Interface
- [Enhanced Export System](ENHANCED_EXPORT_SYSTEM.md) - Export questions to various formats
- [Enhanced Progress Indicator](ENHANCED_PROGRESS_INDICATOR.md) - Progress tracking and visualization
- [Visual Status Indicators](VISUAL_STATUS_INDICATORS.md) - Status display system

## 📊 Performance & Architecture

### System Design
- [Performance Optimizations](PERFORMANCE_OPTIMIZATIONS.md) - Major performance improvements
  - 90%+ faster loading times
  - Simplified UI design
  - Optimized manifest system v3.0

### Key Improvements (v3.0)
- **Simplified Interface**: Removed categories, status indicators
- **Performance**: Single request loading (1 vs 20+ requests)
- **Clean Design**: Focus on essential information only
- **Mobile Optimized**: Better touch experience

## 🛠️ Development

### Contributing
1. Read [Development Guide](DEVELOPMENT.md)
2. Check [Scripts Documentation](scripts/SCRIPTS_DOCUMENTATION.md)
3. Review [API Reference](API.md)

### Maintenance
- Use [Scripts Reference](SCRIPTS_REFERENCE.md) for common operations
- Follow [Performance Guidelines](PERFORMANCE_OPTIMIZATIONS.md)
- Check [Installation Guide](INSTALLATION.md) for deployment

## 📖 Documentation Structure

```
docs/
├── README.md                           # This file - Documentation index
├── INSTALLATION.md                     # Setup and deployment
├── USAGE.md                           # User guide
├── FEATURES.md                        # Feature overview
├── DEVELOPMENT.md                     # Development guide
├── API.md                            # API documentation
├── PERFORMANCE_OPTIMIZATIONS.md       # v3.0 improvements
├── SCRIPTS_REFERENCE.md              # Quick scripts reference
└── scripts/
    └── SCRIPTS_DOCUMENTATION.md      # Detailed scripts docs
```

## 🏷️ Version History

### v3.0 (Current) - Simplified & Optimized
- Removed categories and status indicators
- 90%+ performance improvement
- Streamlined UI design
- Optimized manifest system

### Key Features
- **Instant Loading**: Exam information displays immediately
- **Clean Interface**: Focus on exam name and question count
- **Mobile Optimized**: Better touch and mobile experience
- **Performance**: Single HTTP request for metadata

## 🔍 Finding Information

| Looking for... | See... |
|----------------|--------|
| How to install | [INSTALLATION.md](INSTALLATION.md) |
| How to use | [USAGE.md](USAGE.md) |
| Script commands | [SCRIPTS_REFERENCE.md](SCRIPTS_REFERENCE.md) |
| Performance info | [PERFORMANCE_OPTIMIZATIONS.md](PERFORMANCE_OPTIMIZATIONS.md) |
| API details | [API.md](API.md) |
| Feature list | [FEATURES.md](FEATURES.md) |
| Development setup | [DEVELOPMENT.md](DEVELOPMENT.md) |

For specific questions not covered in these docs, check the relevant feature-specific documentation or the scripts documentation for technical implementation details.