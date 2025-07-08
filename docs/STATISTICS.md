# Statistics System Documentation

## Overview

The Exams-Viewer application includes a comprehensive statistics system that tracks user performance across exam sessions. This system provides detailed insights into question attempts, answer accuracy, and study patterns.

## Architecture

### Data Structure

The statistics system is built around three main data structures:

#### 1. ExamSession

Represents a single exam session from start to finish.

```javascript
class ExamSession {
  constructor(examCode, examName) {
    this.id = generateSessionId();
    this.examCode = examCode;
    this.examName = examName;
    this.startTime = new Date().toISOString();
    this.endTime = null;
    this.questions = []; // Array of QuestionAttempt objects
    this.totalQuestions = 0;
    this.correctAnswers = 0;
    this.incorrectAnswers = 0;
    this.previewAnswers = 0;
    this.totalTime = 0; // in seconds
    this.completed = false;
  }
}
```

#### 2. QuestionAttempt

Tracks all interactions with a single question.

```javascript
class QuestionAttempt {
  constructor(questionNumber, questionText, correctAnswers, mostVoted) {
    this.questionNumber = questionNumber;
    this.questionText = questionText;
    this.correctAnswers = correctAnswers; // Array of correct answer letters
    this.mostVoted = mostVoted; // Most voted answer from community
    this.userAnswers = []; // Array of user selected answers
    this.attempts = []; // Array of attempt objects
    this.startTime = new Date().toISOString();
    this.endTime = null;
    this.timeSpent = 0; // in seconds
    this.isCorrect = false;
    this.finalScore = 0; // 0-100 percentage
    this.resetCount = 0; // Number of times question was reset
    this.highlightAnswers = []; // Array of highlight mode answers
    this.highlightButtonClicks = 0; // Number of highlight activations
    this.highlightViewCount = 0; // Number of times viewed with highlight active
    this.firstActionType = null; // 'correct', 'incorrect', 'preview'
    this.firstActionRecorded = false; // Flag to ensure only first action counts
  }
}
```

#### 3. Global Statistics Object

Maintains overall statistics across all sessions.

```javascript
let statistics = {
  sessions: [], // Array of completed sessions
  currentSession: null, // Current active session
  totalStats: {
    totalQuestions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalPreview: 0,
    totalTime: 0,
    examStats: {}, // Per-exam aggregated statistics
  },
};
```

## Key Features

### 1. Session Management

**Starting a Session:**

- Automatically triggered when loading an exam
- Creates new `ExamSession` object
- Ends any existing session first

**Ending a Session:**

- Triggered when returning to home or loading different exam
- Calculates total session time
- Adds session to history
- Recalculates aggregate statistics

### 2. Question Tracking

**First Action Principle:**
The system tracks only the **first action** taken on each question to prevent inflation of statistics:

- **Correct**: First validation attempt was correct
- **Incorrect**: First validation attempt was incorrect
- **Preview**: First interaction was using highlight mode

**Tracking Methods:**

- `trackQuestionAttempt()`: Records validation attempts
- `addHighlightButtonClick()`: Records highlight activation
- `addHighlightView()`: Records viewing question with highlight already active

### 3. Answer Types

#### Correct Answers

- User selected all correct answers and no incorrect ones
- Counted only on first attempt per question

#### Incorrect Answers

- User selected wrong answers or incomplete correct answers
- Counted only on first attempt per question

#### Preview Answers

- User's first interaction was using highlight mode
- Includes:
  - Activating highlight button
  - Viewing question with highlight already enabled
  - Any highlight-related interaction

### 4. Statistics Calculation

**Session Statistics:**
Updated in real-time via `updateSessionStats()`:

```javascript
function updateSessionStats() {
  let correct = 0;
  let incorrect = 0;
  let preview = 0;
  let totalQuestions = 0;

  statistics.currentSession.questions.forEach((question) => {
    if (question.firstActionRecorded) {
      totalQuestions++;
      switch (question.firstActionType) {
        case "correct":
          correct++;
          break;
        case "incorrect":
          incorrect++;
          break;
        case "preview":
          preview++;
          break;
      }
    }
  });

  // Update session totals
  statistics.currentSession.correctAnswers = correct;
  statistics.currentSession.incorrectAnswers = incorrect;
  statistics.currentSession.previewAnswers = preview;
  statistics.currentSession.totalQuestions = totalQuestions;
}
```

**Global Statistics:**
Recalculated via `recalculateTotalStats()` when sessions end:

- Aggregates all session data
- Calculates per-exam statistics
- Computes average scores and best scores
- Updates last attempt timestamps

## User Interface

### Statistics Modal

The statistics are displayed in a modal with four tabs:

#### 1. Overview Tab

Displays aggregate statistics across all sessions:

- Total Questions
- Correct Answers
- Incorrect Answers
- Preview Answers

#### 2. By Exam Tab

Shows statistics grouped by exam code:

- Questions attempted per exam
- Correct/Incorrect/Preview breakdown
- Average and best scores
- Number of sessions
- Last attempt date
- Total time spent

#### 3. Sessions Tab

Lists individual session history:

- Session date and time
- Exam name
- Question counts by type
- Session score
- Time spent
- Reset count

#### 4. Progress Tab

Shows performance trends over time:

- Line chart of session scores
- Progress visualization
- Performance trends

### Statistics Actions

**Export Statistics:**

- Downloads complete statistics as JSON file
- Includes all session data and metadata
- Filename: `exam-statistics-YYYY-MM-DD.json`

**Reset Statistics:**

- Clears all stored statistics
- Requires user confirmation
- Cannot be undone

## Data Persistence

### Local Storage

Statistics are automatically saved to browser's localStorage:

```javascript
function saveStatistics() {
  localStorage.setItem("examViewerStatistics", JSON.stringify(statistics));
}

function loadStatistics() {
  const savedStats = localStorage.getItem("examViewerStatistics");
  // Parse and migrate data if needed
}
```

### Data Migration

The system includes automatic migration for:

- New fields added to existing data structures
- Backward compatibility with older data formats
- Corruption detection and cleanup

## Performance Considerations

### Optimization Strategies

1. **Lazy Calculation**: Statistics are recalculated only when needed
2. **Incremental Updates**: Session stats updated in real-time
3. **Efficient Storage**: Only essential data persisted
4. **Memory Management**: Old sessions cleaned up automatically

### Scaling Considerations

- Statistics stored locally per browser
- No server-side persistence required
- Handles hundreds of sessions efficiently
- Automatic cleanup of corrupted data

## Development Guidelines

### Adding New Statistics

1. **Update Data Structures**: Add new fields to relevant classes
2. **Implement Tracking**: Add tracking calls where events occur
3. **Update Calculations**: Modify calculation functions
4. **Add Migration**: Ensure backward compatibility
5. **Update UI**: Add display components

### Testing Statistics

```javascript
// Enable development mode for detailed logging
const isDevelopmentMode = () => {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
};

// Debug logging (only in development)
devLog("Statistics updated:", statistics);
```

### Common Patterns

**Question Interaction Tracking:**

```javascript
// Always check for current session
if (statistics.currentSession) {
  // Find or create question attempt
  let questionAttempt = statistics.currentSession.questions.find(
    (q) => q.questionNumber === questionNumber
  );

  if (!questionAttempt) {
    questionAttempt = new QuestionAttempt(/* ... */);
    statistics.currentSession.questions.push(questionAttempt);
  }

  // Track the interaction
  questionAttempt.addSomeInteraction();

  // Update session stats
  updateSessionStats();
  saveStatistics();
}
```

## Troubleshooting

### Common Issues

1. **Statistics Not Updating**

   - Check if session is active
   - Verify `updateSessionStats()` is called
   - Check for JavaScript errors

2. **Data Corruption**

   - System includes automatic cleanup
   - Use "Reset Statistics" as last resort
   - Check browser console for errors

3. **Performance Issues**
   - Statistics recalculation is optimized
   - Large datasets handled efficiently
   - Consider export/import for data management

### Debug Information

Enable development mode logging:

```javascript
// Check current session
console.log("Current session:", statistics.currentSession);

// Check question attempts
console.log("Question attempts:", statistics.currentSession?.questions);

// Check total stats
console.log("Total stats:", statistics.totalStats);
```

## API Reference

### Core Functions

#### Session Management

- `startExamSession(examCode, examName)`: Start new session
- `endCurrentSession()`: End current session
- `loadStatistics()`: Load from localStorage
- `saveStatistics()`: Save to localStorage

#### Question Tracking

- `trackQuestionAttempt(...)`: Record validation attempt
- `updateSessionStats()`: Recalculate session statistics
- `recalculateTotalStats()`: Recalculate global statistics

#### UI Functions

- `displayStatistics()`: Show statistics modal
- `updateOverviewTab()`: Refresh overview display
- `updateExamsTab()`: Refresh exams display
- `updateSessionsTab()`: Refresh sessions display

#### Utility Functions

- `generateSessionId()`: Create unique session ID
- `formatTime(seconds)`: Format duration display
- `exportStatistics()`: Export data to JSON
- `resetAllStatistics()`: Clear all statistics

### Event Handlers

#### Question Interactions

- Highlight button click → `addHighlightButtonClick()`
- Question view with highlight → `addHighlightView()`
- Answer validation → `trackQuestionAttempt()`
- Question reset → `addReset()`

#### Session Events

- Exam load → `startExamSession()`
- Return to home → `endCurrentSession()`
- Page unload → `endCurrentSession()`

This documentation provides a comprehensive overview of the statistics system architecture, implementation details, and usage guidelines for the Exams-Viewer application.
