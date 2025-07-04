# API Documentation - Exams Viewer

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

## 🌐 Frontend API (JavaScript)

### Main Functions

#### `discoverAvailableExams()`

Automatically discovers available exams in the data folder.

**Returns:**

- `Object`: Mapping of available exam codes

#### `loadExam(examCode)`

Loads a specific exam and initializes the interface.

**Parameters:**

- `examCode` (string): Code of the exam to load

#### `navigateQuestion(direction)`

Navigate between questions.

**Parameters:**

- `direction` (string): 'next' or 'prev'

#### `exportToPDF()`

Exports current questions to PDF.

### State Management

The application maintains a global state including:

- `currentExam`: Currently loaded exam
- `currentQuestions`: List of questions
- `currentQuestionIndex`: Current question index
- `selectedAnswers`: Selected answers
- `settings`: User settings

## 🔗 GitHub Pages Integration

### Automatic Deployment

- Automatic deployment from `main` branch
- Static files served directly
- No build process required

### URL Structure

- Main page: `/`
- Exam data: `/data/{exam_code}.json`
- Exam links: `/data/{exam_code}_links.json`

## 📱 Responsive Design

The interface automatically adapts to different screen sizes:

- **Desktop**: Full interface with all controls
- **Tablet**: Touch-optimized interface
- **Mobile**: Simplified interface with touch navigation

## 🎨 Customization

### Themes

The interface supports customization via CSS:

- CSS variables for colors
- Modular classes for components
- Dark mode support (coming soon)

### User Settings

- Show discussion by default
- Highlight correct answers
- Navigation preferences

## 🔍 Search and Filtering

### Search Features

- Text search in questions
- Filter by question type
- Search in answers and comments

### Performance

- Client-side search for optimal responsiveness
- Data indexing for fast searches
- Search result caching
