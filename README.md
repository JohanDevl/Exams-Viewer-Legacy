# Exams Viewer

An automated tool to scrape and maintain up-to-date exam question data from ExamTopics.com, with a web interface for viewing questions.

## 🎯 Features

- **🌐 Web Interface**: Browse questions via GitHub Pages
- **🤖 Automatic scraping** of ExamTopics questions
- **📅 Daily updates** via GitHub Actions
- **🔄 Force rescan** option to refresh all links
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
    └── daily-update.yml  # 📅 Daily automation
```

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
# Update all exams
python scripts/update_all_exams.py

# Update all exams with force rescan
python scripts/update_all_exams.py --force-rescan

# Update specific exam
python scripts/update_all_exams.py --exam CAD

# Update specific exam with force rescan
python scripts/update_all_exams.py --exam CAD --force-rescan
```

### 🤖 Automation

The tool automatically updates every day at 2:00 AM UTC via GitHub Actions.

**Manual trigger with options:**

1. Go to the "Actions" tab on GitHub
2. Select "Daily Data Update"
3. Click "Run workflow"
4. **Available Options:**
   - **Force rescan**: Check to force rescan all links
   - **Specific exam**: Enter an exam code to update only that exam

#### 🔄 Force Rescan Feature

The force rescan option is useful when:

- New questions have been added to ExamTopics but the links file shows "complete"
- You want to ensure all links are refreshed
- There have been changes to the ExamTopics website structure

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

### Rate Limiting

The scraper includes delays to respect servers:

- 10 seconds between different exams
- 5 seconds between questions (normal mode)
- "Rapid scraping" mode available for automation

### GitHub Actions

The automation workflow:

- Runs daily at 2:00 AM UTC
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
      "most_voted": "A",
      "question_number": "1",
      "link": "https://...",
      "error": null
    }
  ]
}
```

## 🛠️ Development

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed development instructions.

### Quick Start

1. Fork the repository
2. Make your changes
3. Test locally
4. Submit a pull request

## 📝 Logging

Each execution generates detailed logs including:

- Update timestamp
- Force rescan status
- Specific exam target (if applicable)
- Number of exams processed
- Success/failures per exam
- Total number of questions
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
