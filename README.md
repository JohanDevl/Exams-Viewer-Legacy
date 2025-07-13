# Exams Viewer

An automated tool to scrape and maintain up-to-date exam question data from ExamTopics.com with a modern web interface.

## 🌐 Direct Access

**🚀 Web Interface**: [https://JohanDevl.github.io/Exams-Viewer/](https://JohanDevl.github.io/Exams-Viewer/)

No installation required! The interface automatically detects your system theme and includes all features.

## 🎯 Main Features

### Web Interface

- **📱 Responsive design** for all devices
- **🔍 Advanced search and filtering** with auto-completion
- **⌨️ Enhanced keyboard navigation** with vim-style shortcuts
- **📊 Enhanced progress indicator** with animated progress bar and real-time statistics
- **📊 Visual progress sidebar** with question overview
- **📚 Navigation history** with back/forward buttons
- **🌙 Dark mode** with automatic detection
- **📊 Complete statistics system** with intelligent storage management
- **🎯 Highlight mode** to preview answers
- **📄 PDF and JSON export** with custom formatting
- **📈 Progress tracking** with visual charts and analytics
- **📝 Built-in changelog viewer** with Markdown rendering
- **⚡ Optional lazy loading** for large exams (experimental)
- **🧹 Data management tools** for storage optimization

### Performance & Storage

- **🚀 Intelligent caching** with service worker
- **📦 Chunked loading** for large exams (100+ questions)
- **🗜️ Automatic image compression** during scraping
- **💾 Smart storage management** with auto-cleanup
- **🔧 User-controlled lazy loading** setting
- **📊 Statistics data optimization** with corruption prevention

### Automation

- **🤖 Automatic scraping** of ExamTopics questions
- **🔄 Smart change detection** and incremental updates
- **📅 Manual triggering** via GitHub Actions
- **🛡️ Robust error handling** with recovery mechanisms
- **📝 Detailed logging** of operations
- **📋 Automated changelog management** with GitHub Actions
- **🖼️ Image processing** with WebP/JPEG compression

## 📊 Supported Exams

The system automatically detects available exams:

- **CAD** - Certified Application Developer
- **CAS-PA** - Customer Service Management Professional
- **CIS-\*** - Complete ServiceNow certification series
- **CSA** - Certified System Administrator

_Over 20 exams available with questions, discussions, and statistics._

## 🚀 Installation

### Web Usage Only

Visit the GitHub Pages URL directly - no installation needed!

### Development/Scraping

```bash
git clone https://github.com/JohanDevl/Exams-Viewer.git
cd Exams-Viewer
pip install -r requirements.txt
```

## 💻 Usage

### Web Interface

1. **Select an exam** from the dropdown list
2. **Monitor progress**: Watch the animated progress indicator for real-time statistics and completion percentage
3. **Navigate with keyboard shortcuts**: Use arrow keys, `hjkl` (vim-style), or `Space/Enter` for quick navigation
4. **Open progress sidebar**: Press `Ctrl+S` or click the hamburger menu to see detailed progress
5. **Use navigation history**: Click Back/Forward buttons to return to previously visited questions
6. **Access keyboard help**: Press `?` to see all available shortcuts
7. **Use highlight mode** to preview answers before validation
8. **Check statistics** in the dedicated panel with detailed analytics
9. **Export data** to PDF or JSON format
10. **Manage performance**: Enable lazy loading in settings for large exams
11. **Clean storage**: Use statistics management tools to optimize space

### Manual Updates

```bash
# Update all exams
python scripts/update_all_exams.py

# Update specific exam
python scripts/update_all_exams.py --exam CAD
```

## 🏗️ Project Structure

```
Exams-Viewer/
├── index.html          # Main web interface
├── styles.css          # Styles with dark mode support
├── script.js           # JavaScript with statistics and lazy loading
├── service-worker.js   # Intelligent caching system
├── data/               # Exam data with folder structure
│   ├── EXAM_CODE/      # Individual exam folders
│   │   ├── exam.json   # Main exam questions
│   │   ├── links.json  # Scraping metadata
│   │   ├── metadata.json # Chunking information
│   │   └── chunks/     # Question chunks for large exams
│   └── manifest.json   # Available exams registry
├── scripts/            # Python automation scripts
│   ├── scraper.py      # Enhanced scraper with image compression
│   ├── create_chunks.py # Chunk generation utility
│   └── migrate_data_structure.py # Data migration tool
├── docs/               # Detailed documentation
└── requirements.txt    # Python dependencies
```

## 📚 Complete Documentation

- **[📋 Installation Guide](docs/INSTALLATION.md)** - Detailed installation and configuration instructions
- **[📖 Usage Guide](docs/USAGE.md)** - Complete interface and feature usage
- **[🎯 Features](docs/FEATURES.md)** - Detailed description of all features
- **[🛠️ Development Guide](docs/DEVELOPMENT.md)** - Instructions for developers
- **[📊 Statistics System](docs/STATISTICS.md)** - Statistics system documentation
- **[⌨️ Navigation Features](docs/NAVIGATION.md)** - Enhanced navigation and keyboard shortcuts
- **[⚡ Performance Optimizations](docs/PERFORMANCE_OPTIMIZATIONS.md)** - Lazy loading and performance features
- **[📋 API Documentation](docs/API.md)** - Technical API documentation
- **[🔧 Scraper Improvements](docs/SCRAPER_IMPROVEMENTS.md)** - Improvement details
- **[📝 Changelog](CHANGELOG.md)** - Project version history and changes

## ⚖️ Legal Compliance

### 📋 Educational Use Only

This tool is designed **exclusively for educational purposes** and personal study. Commercial use is strictly prohibited.

### 🔒 Content Ownership

- All exam questions belong to their respective owners
- ExamTopics.com is the original source of scraped content
- This tool does not claim ownership of any exam materials
- Content is used under fair use principles for educational purposes

### 🛡️ Respectful Scraping

- Built-in delays (5-10 seconds) between requests
- Automatic rate limiting detection
- Server response time monitoring

## 🤝 Contributing

Contributions are welcome! Check the [Development Guide](docs/DEVELOPMENT.md) for more information.

## 📜 License

This project is for educational purposes only. All exam content belongs to its respective owners.

## 🆘 Support

If you encounter issues:

1. Check [existing issues](../../issues)
2. Create a new issue with details
3. Consult documentation in the `docs/` folder
