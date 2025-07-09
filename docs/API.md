# API Documentation - Exams Viewer

This document provides comprehensive API documentation for the Exams-Viewer application, including the new statistics system, dark mode functionality, and highlight features.

## 🌐 Frontend JavaScript API

### Statistics System

The statistics system provides comprehensive tracking of user performance and study patterns with advanced storage optimization.

#### Core Classes

##### `ExamSession`

Represents a single exam session with optimized storage.

```javascript
class ExamSession {
  constructor(examCode, examName)

  // Optimized properties (shortened for storage)
  id: string        // Ultra-compact session ID
  ec: string        // Exam code (examCode)
  en: string        // Exam name (examName)
  st: number        // Start time timestamp (startTime)
  et: number        // End time timestamp (endTime)
  q: Array          // Questions array (questions)
  tq: number        // Total questions (totalQuestions)
  ca: number        // Correct answers (correctAnswers)
  ia: number        // Incorrect answers (incorrectAnswers)
  pa: number        // Preview answers (previewAnswers)
  tt: number        // Total time in seconds (totalTime)
  c: boolean        // Completed flag (completed)

  // Backward compatibility getters/setters
  get examCode(): string
  get examName(): string
  get startTime(): number
  get endTime(): number
  get questions(): Array
  get totalQuestions(): number
  get correctAnswers(): number
  get incorrectAnswers(): number
  get previewAnswers(): number
  get totalTime(): number
  get completed(): boolean
}
```

##### `QuestionAttempt`

Tracks all interactions with a single question with heavily optimized storage.

```javascript
class QuestionAttempt {
  constructor(questionNumber, correctAnswers)

  // Optimized properties (shortened for storage)
  qn: number        // Question number (questionNumber)
  ca: Array         // Correct answers (correctAnswers)
  ua: Array         // User answers (userAnswers)
  att: Array        // Attempts array (attempts)
  st: number        // Start timestamp (startTime)
  et: number        // End timestamp (endTime)
  ts: number        // Time spent (timeSpent)
  ic: boolean       // Is correct (isCorrect)
  fs: number        // Final score (finalScore)
  rc: number        // Reset count (resetCount)
  hbc: number       // Highlight button clicks (highlightButtonClicks)
  hvc: number       // Highlight view count (highlightViewCount)
  fat: string       // First action type: 'c'/'i'/'p' (firstActionType)
  far: boolean      // First action recorded (firstActionRecorded)

  // Methods
  addAttempt(selectedAnswers, isCorrect, timeSpent, wasHighlightEnabled): void
  addHighlightButtonClick(): void
  addReset(): void
  addHighlightView(): void
  getTotalHighlightInteractions(): number

  // Backward compatibility getters
  get questionNumber(): number
  get correctAnswers(): Array
  get userAnswers(): Array
  get attempts(): Array
  get startTime(): number
  get endTime(): number
  get timeSpent(): number
  get isCorrect(): boolean
  get finalScore(): number
  get resetCount(): number
  get highlightButtonClicks(): number
  get highlightViewCount(): number
  get firstActionType(): string
  get firstActionRecorded(): boolean
  get highlightAnswers(): Array // Computed from attempts
}
```

#### Statistics Management Functions

##### `startExamSession(examCode: string, examName: string): void`

Starts a new exam session for statistics tracking.

```javascript
startExamSession("CAD", "Certified Application Developer");
```

##### `endCurrentSession(): void`

Ends the current exam session and saves statistics.

```javascript
endCurrentSession();
```

##### `trackQuestionAttempt(questionNumber, correctAnswers, selectedAnswers, isCorrect, timeSpent, wasHighlightEnabled): void`

Tracks a question attempt with comprehensive metrics.

```javascript
trackQuestionAttempt(
  1, // questionNumber
  ["A", "C"], // correctAnswers
  new Set(["A", "C"]), // selectedAnswers
  true, // isCorrect
  45, // timeSpent (seconds)
  false // wasHighlightEnabled
);
```

##### `updateSessionStats(): void`

Updates session statistics based on current questions.

```javascript
updateSessionStats();
```

##### `saveStatistics(): void`

Saves statistics to localStorage with compression.

```javascript
saveStatistics();
```

##### `loadStatistics(): void`

Loads statistics from localStorage with decompression and migration.

```javascript
loadStatistics();
```

#### Storage Optimization

The statistics system uses advanced compression techniques achieving 60-80% storage reduction:

##### `compressData(data: any): string`

Compresses statistics data for efficient storage.

```javascript
const compressed = compressData(statistics);
// Achieves 60-80% storage reduction
```

##### `decompressData(compressedData: string): any`

Decompresses statistics data from localStorage.

```javascript
const decompressed = decompressData(savedData);
```

**Compression Features:**

- Property name compression (e.g., `examCode` → `ec`)
- Timestamp optimization (ISO strings → numeric timestamps)
- Boolean compression (`true` → `1`, `false` → `0`)
- Ultra-compact session IDs (60% reduction)
- Advanced string compression (20-40% additional reduction)

#### Statistics Display Functions

##### `displayStatistics(): void`

Opens the statistics modal and displays current data.

```javascript
displayStatistics();
```

##### `showStatsTab(tabName: string): void`

Switches to a specific statistics tab.

```javascript
showStatsTab("overview"); // Overview tab
showStatsTab("exams"); // Per-exam statistics
showStatsTab("sessions"); // Session history
showStatsTab("progress"); // Progress charts
```

##### `updateOverviewTab(): void`

Updates the overview statistics tab with current data.

```javascript
updateOverviewTab();
```

##### `updateExamsTab(): void`

Updates the per-exam statistics tab.

```javascript
updateExamsTab();
```

##### `updateSessionsTab(): void`

Updates the session history tab.

```javascript
updateSessionsTab();
```

##### `updateProgressTab(): void`

Updates the progress charts tab.

```javascript
updateProgressTab();
```

#### Utility Functions

##### `exportStatistics(): void`

Exports statistics to JSON file.

```javascript
exportStatistics();
```

##### `resetAllStatistics(): void`

Resets all statistics after user confirmation.

```javascript
resetAllStatistics();
```

##### `cleanCorruptedStatistics(): void`

Cleans corrupted statistics data and recalculates totals.

```javascript
cleanCorruptedStatistics();
```

##### `formatTime(seconds: number): string`

Formats time in seconds to readable format.

```javascript
formatTime(3665); // Returns "1h 1m 5s"
formatTime(125); // Returns "2m 5s"
formatTime(45); // Returns "45s"
```

##### `createOverviewChart(): void`

Creates the overview pie chart on canvas.

```javascript
createOverviewChart();
```

##### `createProgressChart(): void`

Creates the progress line chart on canvas.

```javascript
createProgressChart();
```

#### Storage Optimization

##### `compressData(data: any): string`

Compresses data for localStorage storage.

```javascript
const compressed = compressData(statistics);
```

##### `decompressData(compressedData: string): any`

Decompresses data from localStorage.

```javascript
const decompressed = decompressData(savedData);
```

### Theme System

#### Theme Management

##### `loadSettings(): void`

Loads settings from localStorage including theme preference.

```javascript
loadSettings();
```

##### `saveSettings(): void`

Saves settings to localStorage and applies theme.

```javascript
saveSettings();
```

##### `applyTheme(isDark: boolean): void`

Applies light or dark theme to the interface.

```javascript
applyTheme(true); // Apply dark theme
applyTheme(false); // Apply light theme
```

#### CSS Custom Properties

The theme system uses CSS custom properties for efficient theme switching:

```css
:root {
  /* Light mode variables */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  --text-primary: #262730;
  --text-secondary: #495057;
  --text-muted: #6c757d;
  --border-color: #d1d5db;
  --border-light: #e9ecef;
  --accent-color: #ff4b4b;
  --accent-hover: #e03e3e;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --error-color: #dc3545;
  --spinner-bg: #f3f3f3;
}

[data-theme="dark"] {
  /* Dark mode variables */
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-tertiary: #3a3a3a;
  --text-primary: #ffffff;
  --text-secondary: #e0e0e0;
  --text-muted: #a0a0a0;
  --border-color: #404040;
  --border-light: #505050;
  --accent-color: #ff6b6b;
  --accent-hover: #ff5252;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
  --spinner-bg: #404040;
}
```

### Highlight System

#### Highlight Management

##### `toggleHighlight(): void`

Toggles highlight mode and updates statistics.

```javascript
toggleHighlight();
```

##### `updateHighlightButton(): void`

Updates highlight button appearance based on current state.

```javascript
updateHighlightButton();
```

#### Highlight Tracking

Highlight usage is automatically tracked in the statistics system:

- Button clicks are tracked when highlight is activated
- View counts are tracked when questions are viewed with highlight active
- First action tracking includes highlight usage as "preview" action

### State Management

The application maintains enhanced global state including:

```javascript
// Core state
let currentExam = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let selectedAnswers = new Set();
let isValidated = false;

// Highlight state
let isHighlightEnabled = false;
let isHighlightTemporaryOverride = false;
let questionStartTime = null;

// Settings state
let settings = {
  showDiscussionDefault: false,
  highlightDefault: false,
  darkMode: false,
};

// Statistics state
let statistics = {
  sessions: [],
  currentSession: null,
  totalStats: {
    totalQuestions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalPreview: 0,
    totalTime: 0,
    totalResets: 0,
    totalHighlightAttempts: 0,
    examStats: {},
  },
};

// Available exams
let availableExams = {};
```

### Event Handlers

Enhanced event handling system:

```javascript
// Statistics events
document
  .getElementById("statisticsBtn")
  .addEventListener("click", displayStatistics);
document
  .getElementById("closeStatsModal")
  .addEventListener("click", closeStatistics);
document
  .getElementById("exportStatsBtn")
  .addEventListener("click", exportStatistics);
document
  .getElementById("resetStatsBtn")
  .addEventListener("click", resetAllStatistics);

// Theme events
document
  .getElementById("darkModeToggle")
  .addEventListener("change", saveSettings);
document
  .getElementById("darkModeBtn")
  .addEventListener("click", toggleDarkMode);

// Highlight events
document
  .getElementById("highlightBtn")
  .addEventListener("click", toggleHighlight);

// Statistics tabs
document.querySelectorAll(".stats-tab").forEach((tab) => {
  tab.addEventListener("click", () => showStatsTab(tab.dataset.tab));
});
```

### Data Structures

#### Statistics Data Format

```javascript
// Optimized session format
{
  "id": "k7x9m8n2abc",           // Ultra-compact session ID
  "ec": "CAD",                   // Exam code (compressed)
  "en": "Certified App Dev",     // Exam name (compressed)
  "st": 1641234567890,          // Start timestamp (compressed)
  "et": 1641234567890,          // End timestamp (compressed)
  "q": [                        // Questions array (compressed)
    {
      "qn": 1,                  // Question number (compressed)
      "ca": ["A", "C"],         // Correct answers (compressed)
      "ua": ["A", "C"],         // User answers (compressed)
      "att": [                  // Attempts array (compressed)
        {
          "a": ["A", "C"],      // Answers (compressed)
          "c": 1,               // Is correct (compressed boolean)
          "h": 0                // Highlight enabled (compressed boolean)
        }
      ],
      "st": 1641234567890,      // Start timestamp (compressed)
      "et": 1641234567890,      // End timestamp (compressed)
      "ts": 45,                 // Time spent (compressed)
      "ic": 1,                  // Is correct (compressed boolean)
      "fs": 100,                // Final score (compressed)
      "rc": 0,                  // Reset count (compressed)
      "hbc": 2,                 // Highlight button clicks (compressed)
      "hvc": 1,                 // Highlight view count (compressed)
      "fat": "c",               // First action type (compressed)
      "far": 1                  // First action recorded (compressed boolean)
    }
  ],
  "tq": 150,                    // Total questions (compressed)
  "ca": 120,                    // Correct answers (compressed)
  "ia": 25,                     // Incorrect answers (compressed)
  "pa": 5,                      // Preview answers (compressed)
  "tt": 3600,                   // Total time (compressed)
  "c": 1                        // Completed (compressed boolean)
}
```

#### Theme Configuration

```javascript
// Theme settings
const THEME_STORAGE_KEY = "examViewerSettings";
const AUTO_THEME_DETECTION = true;
const THEME_TRANSITION_DURATION = 300; // milliseconds
```

### Feature Flags

```javascript
// Feature configuration
const FEATURES = {
  STATISTICS_ENABLED: true,
  DARK_MODE_ENABLED: true,
  HIGHLIGHT_MODE_ENABLED: true,
  COMPRESSION_ENABLED: true,
  MIGRATION_ENABLED: true,
  DEBUG_MODE: isDevelopmentMode(),
};
```

## 🐍 Python Scripts API

### scraper.py

Main scraping module for ExamTopics data extraction.

#### Functions

##### `update_exam_data(exam_code, progress_callback=None, rapid_scraping=False)`

Updates exam data for a specific exam code.

**Parameters:**

- `exam_code` (str): The exam code (e.g., 'CAD', 'CIS-ITSM')
- `progress_callback` (callable, optional): Progress tracking callback
- `rapid_scraping` (bool, optional): Enable rapid scraping mode (no delays)

**Returns:**

- `dict`: Exam data with questions and metadata

**Example:**

```python
from scripts.scraper import update_exam_data

# Update CAD exam
result = update_exam_data('CAD', rapid_scraping=True)
print(f"Status: {result['status']}")
print(f"Questions: {len(result['questions'])}")
```

##### `load_json(filename)`

Loads JSON data from file with error handling.

**Parameters:**

- `filename` (str): Path to JSON file

**Returns:**

- `dict`: Parsed JSON data or empty dict if error

##### `save_json(data, filename)`

Saves data to JSON file with proper formatting.

**Parameters:**

- `data` (dict): Data to save
- `filename` (str): Output file path

**Returns:**

- `bool`: Success status

### update_all_exams.py

Automation script for updating all exam data.

#### Functions

##### `get_available_exam_codes()`

Scans data directory for available exam codes.

**Returns:**

- `list`: Sorted list of exam codes

##### `update_single_exam(exam_code, progress_tracker)`

Updates a single exam with error handling.

**Parameters:**

- `exam_code` (str): Exam code to update
- `progress_tracker` (ProgressTracker): Progress tracking instance

**Returns:**

- `dict`: Update result with status and metadata

##### `main()`

Main automation function that processes all exams.

**Usage:**

```bash
python scripts/update_all_exams.py
```

#### Classes

##### `ProgressTracker`

Simple progress tracking utility.

**Methods:**

- `__init__(description="")`: Initialize tracker
- `progress(value, text="")`: Log progress message

## 📊 Data Structures

### Exam Data Format

```json
{
  "status": "complete",
  "error": null,
  "questions": [
    {
      "question": "Question text content",
      "answers": [
        "A. First option",
        "B. Second option",
        "C. Third option",
        "D. Fourth option"
      ],
      "comments": [
        {
          "user": "username",
          "text": "Comment text",
          "selected_answer": "A"
        }
      ],
      "most_voted": "A",
      "question_number": "1",
      "link": "https://www.examtopics.com/...",
      "error": null
    }
  ]
}
```

### Update Log Format

```json
{
  "timestamp": "2024-01-04T10:30:00.000Z",
  "total_exams": 12,
  "successful_updates": 11,
  "failed_updates": 1,
  "total_questions": 1850,
  "results": [
    {
      "exam_code": "CAD",
      "status": "success",
      "question_count": 150,
      "error": null
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables

- `RAPID_SCRAPING`: Enable rapid mode (default: false)
- `MAX_RETRIES`: Maximum retry attempts (default: 3)
- `DELAY_SECONDS`: Delay between requests (default: 5)

### Rate Limiting

Default delays:

- Between exams: 10 seconds
- Between questions: 5 seconds
- Rapid mode: No delays

## 🚨 Error Handling

### Common Errors

1. **Rate Limiting**: HTTP 429 responses

   - Automatic retry with exponential backoff
   - Logs warning and continues

2. **Network Errors**: Connection timeouts

   - Retry logic with increasing delays
   - Graceful degradation

3. **Parsing Errors**: Invalid HTML/JSON

   - Skip problematic questions
   - Log detailed error information

4. **File System Errors**: Permission/disk space
   - Fail fast with clear error messages
   - Preserve existing data

## 🌐 Frontend JavaScript API

### Statistics System

The frontend includes a comprehensive statistics system with optimized storage and backward compatibility.

#### Classes

##### `ExamSession`

Represents a single exam session with optimized storage.

```javascript
class ExamSession {
  constructor(examCode, examName);

  // Optimized properties (internal storage)
  id: string;           // Ultra-compact session ID
  ec: string;           // Exam code (shortened)
  en: string;           // Exam name (shortened)
  st: number;           // Start time as timestamp (shortened)
  et: number | null;    // End time (shortened)
  q: QuestionAttempt[]; // Array of question attempts (shortened)
  tq: number;           // Total questions (shortened)
  ca: number;           // Correct answers (shortened)
  ia: number;           // Incorrect answers (shortened)
  pa: number;           // Preview answers (shortened)
  tt: number;           // Total time in seconds (shortened)
  c: boolean;           // Completed flag (shortened)

  // Backward compatibility getters/setters
  get examCode(): string;
  get examName(): string;
  get startTime(): number;
  get endTime(): number | null;
  get questions(): QuestionAttempt[];
  get totalQuestions(): number;
  get correctAnswers(): number;
  get incorrectAnswers(): number;
  get previewAnswers(): number;
  get totalTime(): number;
  get completed(): boolean;

  generateCompactId(): string;
}
```

##### `QuestionAttempt`

Tracks all interactions with a single question with optimized storage.

```javascript
class QuestionAttempt {
  constructor(questionNumber: string, correctAnswers: string[]);

  // Optimized properties (internal storage)
  qn: string;           // Question number (shortened)
  ca: string[];         // Correct answers array (shortened)
  ua: string[];         // User answers (shortened)
  att: AttemptObject[]; // Attempts array (shortened)
  st: number;           // Start timestamp (shortened)
  et: number | null;    // End timestamp (shortened)
  ts: number;           // Time spent (shortened)
  ic: boolean;          // Is correct (shortened)
  fs: number;           // Final score (shortened)
  rc: number;           // Reset count (shortened)
  hbc: number;          // Highlight button clicks (shortened)
  hvc: number;          // Highlight view count (shortened)
  fat: string | null;   // First action type: 'c'/'i'/'p' (shortened)
  far: boolean;         // First action recorded (shortened)

  // Methods
  addAttempt(selectedAnswers: Set<string>, isCorrect: boolean, timeSpent: number, wasHighlightEnabled: boolean): void;
  addHighlightButtonClick(): void;
  addReset(): void;
  addHighlightView(): void;
  getTotalHighlightInteractions(): number;

  // Backward compatibility getters
  get questionNumber(): string;
  get correctAnswers(): string[];
  get userAnswers(): string[];
  get attempts(): AttemptObject[];
  get startTime(): number;
  get endTime(): number | null;
  get timeSpent(): number;
  get isCorrect(): boolean;
  get finalScore(): number;
  get resetCount(): number;
  get highlightButtonClicks(): number;
  get highlightViewCount(): number;
  get firstActionType(): string | null;
  get firstActionRecorded(): boolean;
  get highlightAnswers(): Array<{answers: string[], timestamp: number}>;
}
```

##### `AttemptObject`

Ultra-compact attempt tracking object.

```javascript
interface AttemptObject {
  a: string[]; // answers (shortened)
  c: boolean; // is correct (shortened)
  h: boolean; // highlight enabled (shortened)
}
```

#### Statistics Management Functions

##### `startExamSession(examCode: string, examName: string): void`

Starts a new exam session for statistics tracking.

```javascript
startExamSession("CAD", "Certified Application Developer");
```

##### `endCurrentSession(): void`

Ends the current exam session and saves statistics.

```javascript
endCurrentSession();
```

##### `trackQuestionAttempt(questionNumber: string, correctAnswers: string[], selectedAnswers: Set<string>, isCorrect: boolean, timeSpent: number, wasHighlightEnabled: boolean): void`

Tracks a question attempt with comprehensive metrics.

```javascript
trackQuestionAttempt("1", ["A", "C"], new Set(["A", "C"]), true, 45, false);
```

##### `updateSessionStats(): void`

Updates session statistics based on current question attempts.

```javascript
updateSessionStats();
```

##### `recalculateTotalStats(): void`

Recalculates total statistics from all sessions.

```javascript
recalculateTotalStats();
```

#### Data Persistence

##### `saveStatistics(): void`

Saves statistics to localStorage with compression.

```javascript
saveStatistics();
```

##### `loadStatistics(): void`

Loads statistics from localStorage with decompression and migration.

```javascript
loadStatistics();
```

#### Statistics Display

##### `displayStatistics(): void`

Opens the statistics modal and updates all tabs.

```javascript
displayStatistics();
```

##### `showStatsTab(tabName: string): void`

Switches to a specific statistics tab.

```javascript
showStatsTab("overview"); // 'overview', 'exams', 'sessions', 'progress'
```

##### `updateOverviewTab(): void`

Updates the overview statistics tab with current data.

```javascript
updateOverviewTab();
```

##### `updateExamsTab(): void`

Updates the per-exam statistics tab.

```javascript
updateExamsTab();
```

##### `updateSessionsTab(): void`

Updates the sessions history tab.

```javascript
updateSessionsTab();
```

##### `updateProgressTab(): void`

Updates the progress charts tab.

```javascript
updateProgressTab();
```

#### Utility Functions

##### `exportStatistics(): void`

Exports statistics to JSON file.

```javascript
exportStatistics();
```

##### `resetAllStatistics(): void`

Resets all statistics after user confirmation.

```javascript
resetAllStatistics();
```

##### `cleanCorruptedStatistics(): void`

Cleans corrupted statistics data and recalculates totals.

```javascript
cleanCorruptedStatistics();
```

##### `formatTime(seconds: number): string`

Formats time in seconds to readable format.

```javascript
formatTime(3665); // Returns "1h 1m 5s"
formatTime(125); // Returns "2m 5s"
formatTime(45); // Returns "45s"
```

##### `createOverviewChart(): void`

Creates the overview pie chart on canvas.

```javascript
createOverviewChart();
```

##### `createProgressChart(): void`

Creates the progress line chart on canvas.

```javascript
createProgressChart();
```

#### Storage Optimization

##### `compressData(data: any): string`

Compresses data for localStorage storage.

```javascript
const compressed = compressData(statistics);
```

##### `decompressData(compressedData: string): any`

Decompresses data from localStorage.

```javascript
const decompressed = decompressData(savedData);
```

### Theme System

#### Theme Management

##### `loadSettings(): void`

Loads settings from localStorage including theme preference.

```javascript
loadSettings();
```

##### `saveSettings(): void`

Saves settings to localStorage and applies theme.

```javascript
saveSettings();
```

##### `applyTheme(isDark: boolean): void`

Applies light or dark theme to the interface.

```javascript
applyTheme(true); // Apply dark theme
applyTheme(false); // Apply light theme
```

#### CSS Custom Properties

The theme system uses CSS custom properties for efficient theme switching:

```css
:root {
  /* Light mode variables */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  --text-primary: #262730;
  --text-secondary: #495057;
  --text-muted: #6c757d;
  --border-color: #d1d5db;
  --border-light: #e9ecef;
  --accent-color: #ff4b4b;
  --accent-hover: #e03e3e;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --error-color: #dc3545;
  --spinner-bg: #f3f3f3;
}

[data-theme="dark"] {
  /* Dark mode variables */
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-tertiary: #3a3a3a;
  --text-primary: #ffffff;
  --text-secondary: #e0e0e0;
  --text-muted: #a0a0a0;
  --border-color: #404040;
  --border-light: #505050;
  --accent-color: #ff6b6b;
  --accent-hover: #ff5252;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
  --spinner-bg: #404040;
}
```

### Highlight System

#### Highlight Management

##### `toggleHighlight(): void`

Toggles highlight mode and updates statistics.

```javascript
toggleHighlight();
```

##### `updateHighlightButton(): void`

Updates highlight button appearance based on current state.

```javascript
updateHighlightButton();
```

#### Highlight Tracking

Highlight usage is automatically tracked in the statistics system:

- Button clicks are tracked when highlight is activated
- View counts are tracked when questions are viewed with highlight active
- First action tracking includes highlight usage as "preview" action

### State Management

The application maintains enhanced global state including:

```javascript
// Core state
let currentExam = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let selectedAnswers = new Set();
let isValidated = false;

// Highlight state
let isHighlightEnabled = false;
let isHighlightTemporaryOverride = false;
let questionStartTime = null;

// Settings state
let settings = {
  showDiscussionDefault: false,
  highlightDefault: false,
  darkMode: false,
};

// Statistics state
let statistics = {
  sessions: [],
  currentSession: null,
  totalStats: {
    totalQuestions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalPreview: 0,
    totalTime: 0,
    totalResets: 0,
    totalHighlightAttempts: 0,
    examStats: {},
  },
};

// Available exams
let availableExams = {};
```

### Event Handlers

Enhanced event handling system:

```javascript
// Statistics events
document
  .getElementById("statisticsBtn")
  .addEventListener("click", displayStatistics);
document
  .getElementById("closeStatsModal")
  .addEventListener("click", closeStatistics);
document
  .getElementById("exportStatsBtn")
  .addEventListener("click", exportStatistics);
document
  .getElementById("resetStatsBtn")
  .addEventListener("click", resetAllStatistics);

// Theme events
document
  .getElementById("darkModeToggle")
  .addEventListener("change", saveSettings);
document
  .getElementById("darkModeBtn")
  .addEventListener("click", toggleDarkMode);

// Highlight events
document
  .getElementById("highlightBtn")
  .addEventListener("click", toggleHighlight);

// Statistics tabs
document.querySelectorAll(".stats-tab").forEach((tab) => {
  tab.addEventListener("click", () => showStatsTab(tab.dataset.tab));
});
```

### Data Structures

#### Statistics Data Format

```json
{
  "sessions": [
    {
      "id": "k4x2mp8abc",
      "ec": "CAD",
      "en": "Certified Application Developer",
      "st": 1641123456789,
      "et": 1641127056789,
      "q": [
        {
          "qn": "1",
          "ca": ["A", "C"],
          "ua": ["A", "C"],
          "att": [
            {
              "a": ["A", "C"],
              "c": true,
              "h": false
            }
          ],
          "st": 1641123456789,
          "et": 1641123501789,
          "ts": 45,
          "ic": true,
          "fs": 100,
          "rc": 0,
          "hbc": 1,
          "hvc": 2,
          "fat": "c",
          "far": true
        }
      ],
      "tq": 150,
      "ca": 120,
      "ia": 25,
      "pa": 5,
      "tt": 3600,
      "c": true
    }
  ],
  "currentSession": null,
  "totalStats": {
    "totalQuestions": 150,
    "totalCorrect": 120,
    "totalIncorrect": 25,
    "totalPreview": 5,
    "totalTime": 3600,
    "totalResets": 8,
    "totalHighlightAttempts": 45,
    "examStats": {
      "CAD": {
        "examName": "Certified Application Developer",
        "totalQuestions": 150,
        "totalCorrect": 120,
        "totalIncorrect": 25,
        "totalPreview": 5,
        "totalTime": 3600,
        "totalResets": 8,
        "totalHighlightAttempts": 45,
        "sessions": 1,
        "averageScore": 80,
        "bestScore": 80,
        "lastAttempt": 1641127056789
      }
    }
  }
}
```

#### Settings Data Format

```json
{
  "showDiscussionDefault": false,
  "highlightDefault": false,
  "darkMode": false
}
```

### Performance Optimization

#### Storage Compression

The statistics system uses advanced compression techniques:

```javascript
// Property name compression mapping
const compressionMap = {
  '"examCode"': '"ec"',
  '"examName"': '"en"',
  '"startTime"': '"st"',
  '"endTime"': '"et"',
  '"questions"': '"q"',
  '"totalQuestions"': '"tq"',
  '"correctAnswers"': '"ca"',
  '"incorrectAnswers"': '"ia"',
  '"previewAnswers"': '"pa"',
  '"totalTime"': '"tt"',
  '"completed"': '"c"',
  // ... additional mappings
  ":true": ":1",
  ":false": ":0",
  ":null": ":n",
};
```

#### Performance Metrics

- **Storage Reduction**: 60-80% reduction in localStorage usage
- **Load Time**: 40-60% faster load/save operations
- **Memory Usage**: 40-60% reduction in memory footprint
- **Compression Ratios**:
  - Session IDs: 60% reduction
  - Timestamps: 46% reduction
  - Property names: 83% reduction
  - Full sessions: 62% reduction

### Error Handling

#### Statistics Error Handling

```javascript
function saveStatistics() {
  try {
    const compressedData = compressData(statistics);
    localStorage.setItem("examViewerStatistics", compressedData);
  } catch (error) {
    devError("Error saving statistics:", error);
  }
}

function loadStatistics() {
  try {
    const savedStats = localStorage.getItem("examViewerStatistics");
    if (savedStats) {
      statistics = decompressData(savedStats);
    }
  } catch (error) {
    devError("Error loading statistics:", error);
    // Reset to default if corrupted
    statistics = getDefaultStatistics();
  }
}
```

#### Migration System

The system includes automatic migration for backward compatibility:

```javascript
// Migrate existing sessions to new optimized format
statistics.sessions.forEach((session) => {
  if (session.examCode !== undefined && session.ec === undefined) {
    // Convert old format to new format
    session.ec = session.examCode;
    session.en = session.examName;
    session.st =
      typeof session.startTime === "string"
        ? new Date(session.startTime).getTime()
        : session.startTime;
    // ... additional migrations

    // Clean up old properties
    delete session.examCode;
    delete session.examName;
    delete session.startTime;
    // ... cleanup
  }
});
```

### Development Utilities

#### Debug Functions

```javascript
function isDevelopmentMode() {
  return (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.search.includes("debug=true")
  );
}

function devLog(...args) {
  if (isDevelopmentMode()) {
    console.log(...args);
  }
}

function devError(...args) {
  if (isDevelopmentMode()) {
    console.error(...args);
  }
}
```

#### Performance Monitoring

```javascript
// Log compression ratios in development
if (isDevelopmentMode()) {
  const originalSize = JSON.stringify(statistics).length;
  const compressedSize = compressedData.length;
  const ratio = (
    ((originalSize - compressedSize) / originalSize) *
    100
  ).toFixed(1);
  devLog(
    `Statistics saved - Original: ${originalSize} bytes, Compressed: ${compressedSize} bytes, Saved: ${ratio}%`
  );
}
```

## 🔧 Configuration

### Enhanced Environment Variables

- `RAPID_SCRAPING`: Enable rapid mode (default: false)
- `MAX_RETRIES`: Maximum retry attempts (default: 3)
- `DELAY_SECONDS`: Delay between requests (default: 5)
- `DEBUG_MODE`: Enable debug logging (default: false)

### Frontend Configuration

#### Statistics Configuration

```javascript
// Statistics settings
const STATISTICS_STORAGE_KEY = "examViewerStatistics";
const SETTINGS_STORAGE_KEY = "examViewerSettings";
const COMPRESSION_ENABLED = true;
const MIGRATION_ENABLED = true;
const DEBUG_COMPRESSION = isDevelopmentMode();
```

#### Theme Configuration

```javascript
// Theme settings
const THEME_STORAGE_KEY = "examViewerSettings";
const AUTO_THEME_DETECTION = true;
const THEME_TRANSITION_DURATION = 300; // milliseconds
```

### Feature Flags

```javascript
// Feature configuration
const FEATURES = {
  STATISTICS_ENABLED: true,
  DARK_MODE_ENABLED: true,
  HIGHLIGHT_MODE_ENABLED: true,
  COMPRESSION_ENABLED: true,
  MIGRATION_ENABLED: true,
  DEBUG_MODE: isDevelopmentMode(),
};
```

## 🚨 Enhanced Error Handling

### Frontend Error Types

1. **Statistics Errors**

   - Storage quota exceeded
   - Data corruption during compression/decompression
   - Migration failures

2. **Theme Errors**

   - CSS custom property support issues
   - System theme detection failures

3. **Highlight Errors**
   - State synchronization issues
   - Statistics tracking failures

### Error Recovery

```javascript
// Graceful error recovery for statistics
function recoverFromStatisticsError() {
  try {
    // Attempt to recover from backup
    const backup = localStorage.getItem("examViewerStatistics_backup");
    if (backup) {
      statistics = JSON.parse(backup);
      return true;
    }
  } catch (error) {
    devError("Backup recovery failed:", error);
  }

  // Reset to default state
  statistics = getDefaultStatistics();
  return false;
}
```

### Performance Optimization

#### Statistics Performance

The statistics system includes several performance optimizations:

- **Compression**: 60-80% reduction in storage size
- **Lazy Loading**: Statistics loaded only when needed
- **Efficient Updates**: Incremental updates instead of full recalculation
- **Memory Management**: Automatic cleanup of old sessions

#### Theme Performance

- **CSS Variables**: Efficient theme switching with no JavaScript overhead
- **Prefers-Color-Scheme**: Automatic system theme detection
- **Smooth Transitions**: Optimized CSS transitions for theme changes
- **Mobile Optimization**: Reduced reflow and repaint operations

#### Highlight Performance

- **Event Delegation**: Efficient event handling for highlight interactions
- **State Caching**: Cached highlight states to reduce computations
- **DOM Optimization**: Minimal DOM manipulation during highlight changes

### Data Migration

The application includes robust data migration for backward compatibility:

```javascript
// Migration example
function migrateStatistics(oldData) {
  // Migrate session format
  if (oldData.sessions) {
    oldData.sessions.forEach((session) => {
      if (session.examCode && !session.ec) {
        session.ec = session.examCode;
        delete session.examCode;
      }
    });
  }

  // Migrate question format
  if (oldData.questions) {
    oldData.questions.forEach((question) => {
      if (question.questionNumber && !question.qn) {
        question.qn = question.questionNumber;
        delete question.questionNumber;
      }
    });
  }

  return oldData;
}
```

### Development Utilities

#### Debug Functions

```javascript
// Development mode detection
function isDevelopmentMode() {
  return (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === ""
  );
}

// Debug logging
function devLog(message, data) {
  if (isDevelopmentMode()) {
    console.log(`[DEBUG] ${message}`, data);
  }
}

// Error logging
function devError(message, error) {
  if (isDevelopmentMode()) {
    console.error(`[ERROR] ${message}`, error);
  }
}
```

#### Performance Monitoring

```javascript
// Performance monitoring for statistics
function monitorStatisticsPerformance() {
  const startTime = performance.now();

  // Perform statistics operation
  saveStatistics();

  const endTime = performance.now();
  const duration = endTime - startTime;

  devLog(`Statistics save took ${duration.toFixed(2)}ms`);
}
```

### Configuration

#### Statistics Configuration

```javascript
// Statistics settings
const STATISTICS_CONFIG = {
  MAX_SESSIONS: 100, // Maximum sessions to keep
  COMPRESSION_ENABLED: true, // Enable data compression
  AUTO_CLEANUP: true, // Auto-cleanup old sessions
  BACKUP_ENABLED: true, // Enable backup creation
  MIGRATION_ENABLED: true, // Enable automatic migration
};
```

#### Theme Configuration

```javascript
// Theme settings
const THEME_CONFIG = {
  STORAGE_KEY: "examViewerSettings",
  AUTO_DETECTION: true,
  TRANSITION_DURATION: 300,
  PREFERS_COLOR_SCHEME: true,
  SMOOTH_TRANSITIONS: true,
};
```

#### Highlight Configuration

```javascript
// Highlight settings
const HIGHLIGHT_CONFIG = {
  TRACK_USAGE: true, // Track highlight usage
  VISUAL_FEEDBACK: true, // Show visual feedback
  STATISTICS_INTEGRATION: true, // Integrate with statistics
  RESET_ON_NAVIGATION: true, // Reset on question navigation
};
```

### API Examples

#### Complete Statistics Workflow

```javascript
// Initialize statistics system
loadStatistics();

// Start exam session
startExamSession("CAD", "Certified Application Developer");

// Track question attempt
trackQuestionAttempt(1, ["A", "C"], new Set(["A", "C"]), true, 45, false);

// Update session stats
updateSessionStats();

// Display statistics
displayStatistics();

// Export statistics
exportStatistics();

// End session
endCurrentSession();
```

#### Complete Theme Workflow

```javascript
// Load theme settings
loadSettings();

// Apply theme based on system preference
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(prefersDark);

// Listen for system theme changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    applyTheme(e.matches);
  });

// Save theme settings
saveSettings();
```

#### Complete Highlight Workflow

```javascript
// Initialize highlight system
isHighlightEnabled = settings.highlightDefault;

// Toggle highlight mode
toggleHighlight();

// Update highlight button
updateHighlightButton();

// Track highlight usage (automatic)
// Highlight interactions are automatically tracked in statistics
```

This enhanced API documentation covers all the new features including the advanced statistics system, dark mode support, highlight functionality, and performance optimizations while maintaining backward compatibility with existing implementations.
