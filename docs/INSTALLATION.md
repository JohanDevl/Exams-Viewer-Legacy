# Installation Guide

## 🚀 Quick Start

### For Web Viewing Only

**No installation needed!** Just visit the GitHub Pages URL:

- **Live Demo**: [https://JohanDevl.github.io/Exams-Viewer/](https://JohanDevl.github.io/Exams-Viewer/)
- The interface automatically detects your system theme preference
- Includes full statistics tracking and all features
- Works on all modern browsers and mobile devices

### For Development/Scraping

If you want to run the scraper or contribute to development:

```bash
# Clone the repository
git clone https://github.com/JohanDevl/Exams-Viewer.git
cd Exams-Viewer

# Install Python dependencies
pip install -r requirements.txt
```

## 💻 Development Setup

### Prerequisites

- **Python 3.11+** - For running scraper scripts
- **Git** - For version control and cloning
- **GitHub account** - For automation and contributions
- **Modern web browser** - Chrome, Firefox, Safari, Edge
- **Code editor** - VS Code, Sublime Text, or any preferred editor

### Local Development Environment

1. **Clone the repository**

   ```bash
   git clone https://github.com/JohanDevl/Exams-Viewer.git
   cd Exams-Viewer
   ```

2. **Install Python dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Verify installation**

   ```bash
   python -c "import requests, bs4; print('Dependencies installed successfully')"
   ```

4. **Test scraper (optional)**

   ```bash
   python scripts/update_all_exams.py --exam CAD
   ```

5. **Serve web interface locally**

   ```bash
   # Use Python built-in server
   python -m http.server 8000

   # Or use Node.js if available
   npx http-server -p 8000

   # Or use any other static file server
   ```

6. **Open in browser**
   - Navigate to `http://localhost:8000`
   - The interface should load with all features available

## 🔧 Dependencies

### Python Dependencies

The project uses minimal Python dependencies for scraping:

```txt
requests>=2.31.0
beautifulsoup4>=4.12.0
```

Install via:

```bash
pip install -r requirements.txt
```

### Frontend Dependencies

The web interface uses **no build process** and minimal external dependencies:

- **Font Awesome 6.0.0** - Icons (loaded via CDN)
- **Vanilla JavaScript** - No frameworks required
- **Modern CSS** - CSS Grid, Flexbox, Custom Properties
- **HTML5** - Semantic markup

All frontend dependencies are loaded via CDN, so no local installation is required.

## 🌐 Local Development Server

### Why Use a Local Server?

While you can open `index.html` directly in a browser, using a local server is recommended to:

- Avoid CORS issues when loading JSON data
- Test the application in a production-like environment
- Enable proper caching and performance testing
- Support all export features correctly

### Server Options

#### Option 1: Python (Recommended)

```bash
python -m http.server 8000
```

#### Option 2: Node.js

```bash
npx http-server -p 8000
```

#### Option 3: PHP

```bash
php -S localhost:8000
```

#### Option 4: VS Code Live Server Extension

- Install the "Live Server" extension
- Right-click on `index.html`
- Select "Open with Live Server"

### Testing the Installation

1. **Open the web interface** at `http://localhost:8000`
2. **Select an exam** from the dropdown
3. **Navigate through questions** using the controls
4. **Test statistics** by attempting some questions
5. **Try dark mode** toggle
6. **Test highlight mode** on questions
7. **Export functionality** (PDF and statistics)

## 📊 Data Setup

### Initial Data

The repository includes sample data for several exams:

- CAD, CAS-PA, CIS-\* series, CSA
- Each exam includes questions and metadata
- Statistics system works immediately with existing data

### Adding New Exam Data

To add data for new exams:

1. **Run the scraper** for a new exam code:

   ```bash
   python scripts/update_all_exams.py --exam NEW_EXAM_CODE
   ```

2. **Verify data files** are created:

   ```
   data/NEW_EXAM_CODE.json
   data/NEW_EXAM_CODE_links.json
   ```

3. **Test in web interface** - new exam should appear in dropdown

### Data Validation

Verify your data setup:

```bash
# Check data directory
ls -la data/

# Validate JSON structure
python -c "import json; print('Valid JSON') if json.load(open('data/CAD.json')) else print('Invalid JSON')"

# Test scraper functionality
python scripts/update_all_exams.py --exam CAD
```

## 🚀 Deployment Options

### GitHub Pages (Recommended)

The easiest deployment method:

1. **Fork the repository** on GitHub
2. **Enable GitHub Pages** in repository settings
3. **Select source** as "Deploy from a branch"
4. **Choose branch** `main` and folder `/` (root)
5. **Access your site** at `https://yourusername.github.io/Exams-Viewer/`

### Manual Static Hosting

For other hosting providers:

1. **Upload files** to your web server:

   ```
   index.html
   styles.css
   script.js
   data/
   favicon.ico
   favicon.svg
   ```

2. **Ensure MIME types** are configured correctly:

   - `.json` files should serve as `application/json`
   - `.css` files should serve as `text/css`
   - `.js` files should serve as `application/javascript`

3. **Test the deployment** by visiting your URL

### Docker Deployment (Advanced)

For containerized deployment:

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t exams-viewer .
docker run -p 8080:80 exams-viewer
```

## 🔧 Configuration

### Environment Variables

For scraping automation, you can configure:

```bash
# Optional: Set custom delays
export SCRAPER_DELAY=10

# Optional: Set custom headers
export USER_AGENT="Custom User Agent"
```

### GitHub Actions Setup

For automated updates:

1. **Fork the repository**
2. **Configure secrets** if needed (usually not required)
3. **Enable Actions** in repository settings
4. **Test manual trigger** in Actions tab

### Custom Configuration

Create a `config.json` file for custom settings:

```json
{
  "scraper": {
    "delay": 10,
    "timeout": 30,
    "retries": 3
  },
  "interface": {
    "defaultTheme": "auto",
    "questionsPerPage": 1,
    "enableStatistics": true
  }
}
```

## 🔍 Verification

### Installation Verification Checklist

- [ ] Repository cloned successfully
- [ ] Python dependencies installed
- [ ] Local server running on port 8000
- [ ] Web interface loads at `http://localhost:8000`
- [ ] Exam dropdown populated with available exams
- [ ] Questions load and display correctly
- [ ] Statistics panel opens and functions
- [ ] Dark mode toggle works
- [ ] Highlight mode functions on questions
- [ ] Export features work (PDF and JSON)
- [ ] No console errors in browser developer tools

### Troubleshooting Installation

#### Common Issues

**Python Dependencies**:

```bash
# If pip install fails, try:
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

**CORS Issues**:

```bash
# Always use a local server, not file:// URLs
python -m http.server 8000
```

**Port Already in Use**:

```bash
# Use a different port
python -m http.server 8001
```

**JSON Loading Issues**:

- Ensure you're using a local server
- Check browser console for specific errors
- Verify JSON files exist in `data/` directory

#### Getting Help

If you encounter issues:

1. **Check existing issues** on GitHub
2. **Search documentation** in the `docs/` folder
3. **Create a new issue** with:
   - Your operating system
   - Python version (`python --version`)
   - Browser and version
   - Specific error messages
   - Steps to reproduce

## 📝 Next Steps

After installation:

1. **Read the Usage Guide** - `docs/USAGE.md`
2. **Explore Features** - `docs/FEATURES.md`
3. **Check Development Guide** - `docs/DEVELOPMENT.md`
4. **Review API Documentation** - `docs/API.md`
5. **Understand Statistics** - `docs/STATISTICS.md`

## 🔄 Updates

### Keeping Your Installation Updated

```bash
# Pull latest changes
git pull origin main

# Update dependencies if needed
pip install -r requirements.txt --upgrade

# Update exam data
python scripts/update_all_exams.py
```

### Automatic Updates

The GitHub Pages deployment automatically updates when:

- New commits are pushed to the main branch
- Manual updates are triggered via GitHub Actions
- Data files are updated through the automation system

Your local development environment will need manual updates using `git pull`.
