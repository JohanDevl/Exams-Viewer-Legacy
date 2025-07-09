# Exams Viewer

An automated tool to scrape and maintain up-to-date exam question data from ExamTopics.com with a modern web interface.

## 🌐 Direct Access

**🚀 Web Interface**: [https://JohanDevl.github.io/Exams-Viewer/](https://JohanDevl.github.io/Exams-Viewer/)

No installation required! The interface automatically detects your system theme and includes all features.

## 🎯 Main Features

### Web Interface

- **📱 Responsive design** for all devices
- **🔍 Advanced search and filtering**
- **📊 Intuitive question navigation**
- **🌙 Dark mode** with automatic detection
- **📊 Complete statistics system** with storage optimization
- **🎯 Highlight mode** to preview answers
- **📄 PDF and JSON export**
- **📈 Progress tracking** with visual charts

### Automation

- **🤖 Automatic scraping** of ExamTopics questions
- **🔄 Smart change detection**
- **📅 Manual triggering** via GitHub Actions
- **🛡️ Robust error handling**
- **📝 Detailed logging** of operations

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

1. Select an exam from the dropdown list
2. Navigate between questions using controls
3. Use highlight mode to preview answers
4. Check your statistics in the dedicated panel
5. Export your data or questions to PDF

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
├── script.js           # JavaScript with statistics system
├── data/               # Exam data (JSON files)
├── scripts/            # Python automation scripts
├── docs/               # Detailed documentation
└── requirements.txt    # Python dependencies
```

## 📚 Complete Documentation

- **[📋 Installation Guide](docs/INSTALLATION.md)** - Detailed installation and configuration instructions
- **[📖 Usage Guide](docs/USAGE.md)** - Complete interface and feature usage
- **[🎯 Features](docs/FEATURES.md)** - Detailed description of all features
- **[🛠️ Development Guide](docs/DEVELOPMENT.md)** - Instructions for developers
- **[📊 Statistics System](docs/STATISTICS.md)** - Statistics system documentation
- **[📋 API Documentation](docs/API.md)** - Technical API documentation
- **[🔧 Scraper Improvements](docs/SCRAPER_IMPROVEMENTS.md)** - Improvement details

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
