# Visual Status Indicators

The Exams Viewer features a comprehensive visual status indicator system that provides immediate feedback about question states and user interactions. This system helps users quickly identify question progress and organize their study sessions effectively.

## Overview

The visual status indicator system displays color-coded badges and icons throughout the interface to show:
- Question completion status (new, viewed, answered correctly/incorrectly)
- User engagement (favorites, notes, categories)
- Study progress tracking
- Navigation context

## Status Types

### Primary Status Indicators

#### 🆕 New Questions
- **Color**: Gray
- **Icon**: Circle outline
- **Meaning**: Questions that have never been visited
- **Badge Text**: "NEW"

#### 👁️ Viewed Questions  
- **Color**: Orange/Amber
- **Icon**: Eye
- **Meaning**: Questions that have been viewed but not answered
- **Badge Text**: "VIEWED"

#### ✅ Correct Answers
- **Color**: Green
- **Icon**: Check circle
- **Meaning**: Questions answered correctly during validation
- **Badge Text**: "CORRECT"

#### ❌ Incorrect Answers
- **Color**: Red
- **Icon**: X circle  
- **Meaning**: Questions answered incorrectly during validation
- **Badge Text**: "WRONG"

### Secondary Status Indicators

#### ⭐ Favorite Questions
- **Color**: Yellow/Gold
- **Icon**: Star (filled)
- **Meaning**: Questions marked as favorites by the user
- **Location**: Appears as secondary badge

#### 📝 Questions with Notes
- **Color**: Purple
- **Icon**: Sticky note
- **Meaning**: Questions that have personal notes attached
- **Location**: Appears as secondary badge

#### 🏷️ Categorized Questions
- **Color**: Cyan/Teal
- **Icon**: Tag
- **Meaning**: Questions assigned to custom categories
- **Location**: Appears as secondary badge

## Where Status Indicators Appear

### Progress Sidebar
The most comprehensive display of status indicators appears in the progress sidebar:

```
┌─────────────────────────┐
│ Question Progress       │
├─────────────────────────┤
│ Q1  [NEW]               │
│ Q2  [VIEWED] ⭐         │
│ Q3  [CORRECT] 📝        │
│ Q4  [WRONG] ⭐ 🏷️       │
└─────────────────────────┘
```

Each question item shows:
- Question number
- Primary status badge
- Secondary indicator badges
- Preview of question text

### Main Progress Bar
The enhanced main progress bar displays aggregate statistics:
- Total answered questions (green checkmark)
- Favorite questions count (yellow star)
- Remaining questions (gray circle)

## Enabling Status Indicators

### Question Toolbar
To access favorites, categories, and notes (which enable secondary indicators):

1. Open **Settings** (⚙️ icon)
2. Enable **"Show question toolbar (favorites, groups, notes)"**
3. The toolbar will appear below each question with:
   - Favorite button (⭐)
   - Category dropdown ("Select category...")
   - Add category button (➕)
   - Notes button (📝)

### Progress Sidebar
To view the comprehensive status display:

1. Click the **sidebar toggle** button (☰) in the navigation
2. Or use keyboard shortcut: **S**
3. The sidebar shows all questions with their current status

## Status Tracking

### Automatic Tracking
The system automatically tracks:
- **Question visits**: When you navigate to a question
- **Answer attempts**: When you validate answers
- **Correctness**: Based on comparison with provided correct answers

### Manual Actions
Users can manually set:
- **Favorites**: Click the star button or press **F**
- **Categories**: Select from dropdown or create custom categories
- **Notes**: Add personal notes using the notes button or press **N**

## Performance Features

### Intelligent Caching
- Status calculations are cached for performance
- Cache automatically invalidates when data changes
- Supports large question sets (200+ questions) efficiently

### Responsive Design
- Badges automatically resize on mobile devices
- Layout adapts to screen size:
  - **Desktop**: Horizontal badge layout
  - **Tablet (768px)**: Smaller badges
  - **Mobile (480px)**: Vertical stacking of badges

## Dark Mode Support

All status indicators are fully compatible with dark mode:
- Automatic color scheme adaptation
- Maintained contrast ratios for accessibility
- Consistent visual hierarchy in both themes

## Accessibility

### Color Independence
- All status types include icons alongside colors
- Text labels provided for screen readers
- Proper ARIA labels on all interactive elements

### Keyboard Navigation
- All status-related actions accessible via keyboard
- Focus indicators clearly visible
- Logical tab order maintained

### Screen Reader Support
- Comprehensive aria-label attributes
- Status changes announced to assistive technologies
- Semantic HTML structure preserved

## Use Cases

### Study Session Management
- Quickly identify which questions need attention
- Track progress through large question sets
- Resume study sessions where you left off

### Content Organization
- Group related questions with categories
- Mark important or difficult questions as favorites
- Add personal notes for later review

### Progress Monitoring
- Visual confirmation of completion status
- Immediate feedback on answer accuracy
- Overall progress tracking across sessions

## Technical Implementation

### Data Storage
- Question visits stored in session statistics
- Answer results tracked with timestamp and correctness
- Favorites and categories saved in localStorage
- Notes preserved across browser sessions

### Cache Management
- LRU cache with 200-item limit
- Automatic invalidation on data changes
- Memory-efficient storage patterns

### Integration Points
- Seamlessly integrates with existing statistics system
- Compatible with lazy loading for large datasets
- Works with search and filter functionality

## Troubleshooting

### Status Not Updating
- Check that question toolbar is enabled in settings
- Verify browser localStorage is functioning
- Clear browser cache if indicators seem stuck

### Missing Categories
- Ensure question toolbar is visible
- Check that categories were saved properly
- Use "Reset All Data" in settings if needed (note: this clears all favorites)

### Performance Issues
- Status cache automatically manages memory
- Large question sets may have brief loading delays
- Enable lazy loading in settings for very large exams

## Future Enhancements

Planned improvements include:
- Difficulty level indicators
- Time-based status tracking
- Custom color themes
- Export of status data
- Collaborative status sharing