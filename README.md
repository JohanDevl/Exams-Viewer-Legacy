# Exams Viewer

An automated tool to scrape and maintain up-to-date exam question data from ExamTopics.com, with a web interface for viewing questions.

## 🎯 Features

- **🌐 Web Interface**: Browse questions via GitHub Pages
- **🤖 Automatic scraping** of ExamTopics questions with enhanced accuracy
- **📅 Weekly updates** via GitHub Actions
- **🔄 Force rescan** option to refresh all links
- **🔄 Smart update detection** - only updates changed questions
- **🎯 Enhanced most_voted extraction** - 3-tier logic for maximum accuracy
- **🛡️ Robust error handling** and rate limiting
- **📊 Multi-exam support** with automatic detection
- **📝 Detailed logging** of operations
- **🎨 Modern responsive interface**
- **🔍 Search and filtering** of questions
- **📱 Mobile and desktop compatible**

## 🏗️ Project Structure

```
Exams-Viewer/
├── index.html              # 🌐 GitHub Pages main page
├── styles.css              # 🎨 Web interface styles
├── script.js               # ⚡ Frontend JavaScript
├── README.md              # 📖 Main documentation
├── requirements.txt        # 📦 Python dependencies
├── scripts/               # 🔧 Python automation scripts
│   ├── scraper.py         # 🕷️ Main scraping logic
│   └── update_all_exams.py # 🤖 Automation script
├── data/                  # 📊 Exam data (JSON files)
│   ├── CAD.json          # 📝 Exam questions
│   ├── CAD_links.json    # 🔗 Question links
│   └── ... (other exams)
├── docs/                  # 📚 Documentation
│   ├── API.md            # 📋 API documentation
│   └── DEVELOPMENT.md    # 🛠️ Development guide
└── .github/workflows/     # ⚙️ GitHub Actions
    └── manual-update.yml  # 🔧 Manual update workflow
```

## ⚖️ Legal Compliance & Disclaimers

### 📋 Educational Use Only

This tool is designed **exclusively for educational purposes** and personal study. Commercial use is strictly prohibited.

### 🔒 Content Ownership

- All exam questions and content belong to their respective owners
- ExamTopics.com is the original source of the scraped content
- This tool does not claim ownership of any exam materials
- Content is used under fair use principles for educational purposes

### 🚨 Important Legal Notices

**⚠️ Terms of Service Compliance**

- Users should be aware that web scraping may conflict with ExamTopics.com's Terms of Service
- We recommend users seek permission from content owners before using this tool
- Use this tool at your own risk and responsibility

**🛡️ GDPR Compliance**

- This tool does not intentionally collect personal data
- Any personal information found in scraped content is not processed or stored separately
- Users in the EU should ensure their usage complies with GDPR requirements

**📞 Contact for Removal**

- Content owners can request removal of their content by contacting the repository owner
- We will promptly respond to legitimate takedown requests
- Abuse reports will be handled according to our abuse policy

### 🔧 Rate Limiting & Respectful Scraping

- Built-in delays (5-10 seconds) between requests to respect server resources
- Automatic detection of rate limiting and respectful retry mechanisms
- Monitoring of server response times to avoid overloading

### 📝 Recommended Best Practices

1. **Seek Permission**: Contact ExamTopics.com for explicit permission before large-scale scraping
2. **Respect robots.txt**: Check and follow website crawling guidelines
3. **Educational Use Only**: Never use scraped content for commercial purposes
4. **Attribution**: Always credit the original source (ExamTopics.com)
5. **Responsible Usage**: Use reasonable request rates and respect server resources

## 🌐 Web Interface

**Live Demo**: `https://JohanDevl.github.io/Exams-Viewer/`

### Interface Features

- 📱 **Responsive design** for all devices
- 🔍 **Search and filtering** of questions
- 📊 **Exam navigation** with navigation controls
- 💬 **Display answers and discussions**
- 📈 **Progress tracking** and statistics
- 🎯 **Random question navigation**
- 📄 **PDF export** of questions
- ⚙️ **Customizable settings**
- 🔗 **Direct links to ExamTopics**

## 🚀 Installation

### For Web Viewing Only

Just visit the GitHub Pages URL - no installation needed!

### For Development/Scraping

```bash
# Clone the repository
git clone <repository-url>
cd Exams-Viewer

# Install Python dependencies
pip install -r requirements.txt
```

## 💻 Usage

### 🌐 Web Interface

**Online**: Visit the GitHub Pages URL directly

**Local Development**:

```bash
# Serve the application locally to avoid CORS issues
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

**Usage**:

1. Select an exam from the dropdown
2. Browse questions with navigation controls
3. Search and filter as needed
4. Export questions to PDF if necessary

### 🔧 Manual Scraping

```bash
# Update all exams (smart detection - only updates changed questions)
python scripts/update_all_exams.py

# Update all exams with force rescan of links
python scripts/update_all_exams.py --force-rescan

# Force update ALL existing questions (ignores change detection)
python scripts/update_all_exams.py --force-update

# Update specific exam
python scripts/update_all_exams.py --exam CAD

# Update specific exam with force rescan + force update
python scripts/update_all_exams.py --exam CAD --force-rescan --force-update
```

### 🤖 Manual Updates

The tool can be updated manually via GitHub Actions (automatic weekly updates have been disabled).

**Manual trigger with options:**

1. Go to the "Actions" tab on GitHub
2. Select "Manual Data Update"
3. Click "Run workflow"
4. **Available Options:**
   - **Force rescan**: Check to force rescan all links
   - **Force update**: Check to force update all existing questions
   - **Specific exam**: Enter an exam code to update only that exam

#### 🔄 Advanced Update Options

**Force Rescan** is useful when:

- New questions have been added to ExamTopics but the links file shows "complete"
- You want to ensure all links are refreshed
- There have been changes to the ExamTopics website structure

**Force Update** is useful when:

- You want to refresh all existing questions with the latest data
- Apply scraper improvements to previously scraped questions
- Update `most_voted` answers that were previously `null`
- Ensure all questions benefit from enhanced extraction logic

## 📊 Supported Exams

The tool automatically detects available exams in the `data/` folder:

- **CAD** - Certified Application Developer
- **CAS-PA** - Customer Service Management Professional
- **CIS-APM** - Application Portfolio Management
- **CIS-CSM** - Customer Service Management
- **CIS-Discovery** - Discovery
- **CIS-EM** - Event Management
- **CIS-FSM** - Field Service Management
- **CIS-HAM** - Hardware Asset Management
- **CIS-HR** - Human Resources
- **CIS-ITSM** - IT Service Management
- **CIS-PPM** - Project Portfolio Management
- **CIS-RC** - Risk and Compliance
- **CIS-SAM** - Software Asset Management
- **CIS-SIR** - Security Incident Response
- **CIS-SM** - Service Mapping
- **CIS-SPM** - Strategic Portfolio Management
- **CIS-VR** - Vulnerability Response
- **CIS-VRM** - Vendor Risk Management
- **CSA** - Certified System Administrator

## 🔧 Configuration

### Enhanced Scraper Features

**🎯 3-Tier Most Voted Extraction:**

1. **Primary**: Official ExamTopics majority (`"is_most_voted": true`)
2. **Secondary**: Highest vote count (if > 0 votes)
3. **Tertiary**: Suggested answers from ExamTopics (`"correct-answer"` class)

**🔍 Smart Update Detection:**

- Compares existing vs new question data
- Only updates when content actually changed
- Detects changes in: `most_voted`, question content, answers, content hash
- Efficient: unchanged questions are skipped

### Rate Limiting

The scraper includes delays to respect servers:

- 10 seconds between different exams
- 5 seconds between questions (normal mode)
- "Rapid scraping" mode available for automation

### GitHub Actions

The automation workflow:

- Manual trigger only
- Can be triggered manually with options
- Generates detailed logs
- Automatically commits changes

## 📄 Data Format

Data is stored in JSON format:

```json
{
  "status": "complete",
  "error": null,
  "questions": [
    {
      "question": "Question text...",
      "answers": ["A. Option 1", "B. Option 2", ...],
      "comments": [...],
      "most_voted": "A",           // Enhanced 3-tier extraction
      "question_number": "1",
      "link": "https://...",
      "error": null
    }
  ]
}
```

### Enhanced Data Quality

**🎯 Most Voted Accuracy**: The `most_voted` field now uses a 3-tier extraction system:

- **100% coverage**: Captures official votes, partial votes, and suggested answers
- **Automatic updates**: Existing questions with `null` values get updated
- **Smart detection**: Only re-scrapes when content actually changes

## 🚀 Recent Improvements

### v2.0 - Enhanced Scraper & Smart Updates

**🎯 3-Tier Most Voted Extraction:**

- **Problem solved**: Many questions had `most_voted: null` even when answers were visible on the website
- **Solution**: Enhanced extraction logic that captures official votes, partial votes, and suggested answers
- **Result**: 100% success rate in extracting available answer data

**🔍 Smart Update Detection:**

- **Problem solved**: `update_all_exams.py` would skip existing questions entirely, missing content changes
- **Solution**: Intelligent comparison system that detects actual changes
- **Result**: Existing questions now benefit from scraper improvements automatically

**📊 Impact:**

- **CAD Exam**: 7/7 previously null `most_voted` values were successfully updated
- **Efficiency**: Unchanged questions are skipped, saving time and resources
- **Accuracy**: Enhanced extraction captures all types of answer data available

**🔧 New Command Options:**

```bash
# Smart update (default) - only updates changed content
python scripts/update_all_exams.py --exam CAD

# Force update all existing questions
python scripts/update_all_exams.py --exam CAD --force-update
```

For detailed technical information, see [docs/SCRAPER_IMPROVEMENTS.md](docs/SCRAPER_IMPROVEMENTS.md).

## 🛠️ Development

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed development instructions.

### 🎯 Cursor Rules

This project includes comprehensive **Cursor Rules** (`.cursor/rules/exams-viewer.mdc`) that automatically enforce:

- **Critical requirement**: Exam lists must be in alphabetical order
- Code style guidelines for JavaScript, Python, HTML/CSS
- Architecture patterns and common development practices
- Security guidelines and performance considerations
- Comprehensive code review checklist

The rules are automatically applied when using Cursor IDE and help maintain consistency across all contributions.

### Quick Start

1. Fork the repository
2. Make your changes
3. Test locally
4. Submit a pull request

## 📝 Logging

Each execution generates detailed logs including:

- Update timestamp
- Force rescan status
- Force update status
- Specific exam target (if applicable)
- Number of exams processed
- Success/failures per exam
- Total number of questions
- **New**: Update summary (new questions, updated questions, skipped questions)
- **New**: Detailed change reasons for updated questions
- Detailed error messages

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📜 License

This project is for educational purposes only. All exam content belongs to their respective owners.

This project is licensed under a custom Educational Use License. See the `LICENSE` file for details.

## 🆘 Support

If you encounter issues:

1. Check [existing issues](../../issues)
2. Create a new issue with details
3. Provide error logs if available

## 🙏 Acknowledgments

- ExamTopics.com for exam data
- GitHub Pages for hosting
- The open source community for tools used
