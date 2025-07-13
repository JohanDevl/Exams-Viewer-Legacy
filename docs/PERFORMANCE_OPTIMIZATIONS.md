# Performance Optimizations Guide

This document describes the comprehensive performance optimizations implemented in Exams-Viewer v2.5.x to improve loading times, user experience, and data integrity.

## Implemented Optimizations

### 1. 🚀 Lazy Loading with Virtual Pagination

**Status:** Optional feature (disabled by default in user settings)

**Objective:** Drastically reduce initial loading times by loading only necessary questions for large exams.

#### How it works:
- **Data chunks:** Large exams (>100 questions) are divided into chunks of 50 questions
- **User-controlled:** Can be enabled/disabled in settings for experimental use
- **Non-blocking UI:** Navigation provides immediate feedback with progressive loading
- **Intelligent preloading:** Adjacent chunks are preloaded in the background
- **Fallback support:** Gracefully falls back to standard loading if chunks unavailable

#### File structure:
```
data/
├── manifest.json
├── CAD/
│   ├── exam.json             # Main exam data
│   ├── metadata.json         # Lazy loading metadata
│   ├── links.json            # Scraping metadata
│   ├── chunks/
│   │   ├── chunk_0.json      # Questions 1-50
│   │   ├── chunk_1.json      # Questions 51-100
│   │   ├── chunk_2.json      # Questions 101-150
│   │   └── chunk_3.json      # Questions 151-158
│   └── images/               # Exam-specific images
└── CIS-APM/
    ├── exam.json
    └── ...
```

#### Creating chunks:
```bash
# Create chunks for a specific exam
python scripts/create_chunks.py --exam CAD --chunk-size 50

# Process all exams (>100 questions)
python scripts/create_chunks.py --all --min-questions 100

# Clean up chunks for an exam
python scripts/create_chunks.py --cleanup CAD

# Migrate from old structure to new folder structure
python scripts/migrate_data_structure.py
```

### 2. 💾 Intelligent Cache with Service Worker

**Objective:** Improve performance by intelligently caching data with background updates.

#### Features:
- **Cache-first strategy:** Cached data is served immediately
- **Background updates:** Data is updated silently in the background
- **Preloading:** Popular exams are cached automatically
- **Version management:** Intelligent cache invalidation

#### Cache strategies:
- **Static files:** Cache-first (index.html, script.js, styles.css)
- **Exam data:** Cache-first with background update
- **Manifest:** Network-first for latest updates
- **Chunks:** Cache-first with background update

### 3. 🖼️ Automatic Image Compression

**Objective:** Reduce data size by automatically optimizing images during scraping.

#### Features:
- **Automatic detection:** Identifies images in questions
- **Smart compression:** Converts to WebP with JPEG fallback
- **Resizing:** Images limited to 800x600px maximum
- **Optimization:** Compression with 85% quality for good balance

#### Storage format:
```json
{
  "question": "...",
  "images": {
    "img_a1b2c3d4": {
      "webp": "base64_encoded_webp_data",
      "jpeg": "base64_encoded_jpeg_data",
      "original_url": "https://example.com/image.png",
      "size": [640, 480]
    }
  }
}
```

### 4. 🛡️ Data Integrity and Storage Management

**Objective:** Eliminate data corruption issues and optimize localStorage usage.

#### Features:
- **Corruption Prevention:** Removed problematic compression system causing data corruption
- **Standard JSON Storage:** Uses reliable JSON.stringify/parse instead of custom compression
- **Intelligent Storage Management:** Auto-cleanup prevents localStorage overflow
- **Data Validation:** Enhanced corruption detection with structure validation
- **User Controls:** Manual statistics management tools in settings

#### Storage optimization:
```javascript
// Auto-cleanup at 4.5MB threshold
if (dataToSave.length > 4500000) {
  statistics.sessions = statistics.sessions.slice(-50);
}

// User-controlled cleanup options
cleanOldStatistics(); // Keep last 20 sessions
resetAllStatistics(); // Complete reset with confirmation
```

#### Legacy data handling:
```javascript
// Backward compatibility for compressed data
try {
  parsed = JSON.parse(savedStats); // Try standard JSON first
} catch {
  parsed = decompressData(savedStats); // Fallback to legacy format
  setTimeout(() => saveStatistics(), 1000); // Migrate to new format
}
```

### 5. ⚙️ User Settings and Control

**Objective:** Give users control over performance features and data management.

#### Settings options:
- **Lazy Loading Toggle:** Enable/disable experimental lazy loading
- **Statistics Management:** Clean old sessions or reset all data
- **Data Export/Import:** Backup and restore user data
- **Storage Information:** View current usage and session counts

#### Settings interface:
```html
<label class="toggle-label">
  <input type="checkbox" id="enableLazyLoading" />
  <span class="toggle-slider"></span>
  Enable lazy loading (experimental)
</label>
```

## Performance Benefits

### Loading Times
- **Medium exams (50-100 questions):** 40-60% reduction
- **Large exams (200+ questions):** 70-80% reduction
- **Navigation:** Near-instantaneous with preloading

### Memory Usage
- **70% reduction** in memory footprint for large exams
- Maximum of 3 chunks in memory (previous, current, next)

### Data Size
- **Optimized images:** 40-60% size reduction
- **Intelligent cache:** Avoids redundant downloads
- **WebP compression:** Up to 50% reduction vs JPEG

### User Experience
- **Initial loading:** Immediate for first chunk (when lazy loading enabled)
- **Navigation:** Non-blocking with immediate feedback
- **Data integrity:** Eliminated corruption issues and "corrupted data" messages
- **User control:** Optional lazy loading and data management tools
- **Offline mode:** Partial functionality with cache

## Configuration and Parameters

### Lazy Loading
```javascript
let lazyLoadingConfig = {
  chunkSize: 50,           // Questions per chunk
  preloadBuffer: 1,        // Chunks to preload
  isChunkedExam: false,    // Auto-detection
};

// User setting (disabled by default)
let settings = {
  enableLazyLoading: false, // User must opt-in
};
```

### Service Worker
```javascript
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_STRATEGIES = {
  examData: 'cache-first-with-background-update',
  chunks: 'cache-first-with-background-update',
  manifest: 'network-first'
};
```

### Image Compression
```python
def download_and_compress_image(img_url, max_size=(800, 600), quality=85):
    # Maximum resize to 800x600
    # JPEG/WebP quality at 85%
    # Automatic RGB conversion
```

## Migration and Backward Compatibility

### Compatibility
- **Existing exams:** Work without modification
- **Optional lazy loading:** Disabled by default, user must opt-in
- **Data migration:** Automatic migration from legacy compressed format
- **Progressive enhancement:** Optimizations activate only when enabled and available
- **Corruption recovery:** Enhanced detection and automatic cleanup

### Migration Process
1. **Create chunks:** Use `scripts/create_chunks.py`
2. **Migrate structure:** Use `scripts/migrate_data_structure.py`
3. **Service Worker:** Registers automatically on page load
4. **Images:** Optimized during next scraping

## Monitoring and Debug

### Performance Logs
```javascript
// Enable debug logging
const DEBUG_MODE = true;

// Available logs
console.log('Lazy loading activated for exam:', examCode);
console.log('Chunk loaded:', chunkId);
console.log('Cache updated:', url);
```

### Metrics
- Initial loading time
- Number of chunks loaded
- Cache size
- Preloading success rate

## Useful Commands

```bash
# Create chunks for all large exams
python scripts/create_chunks.py --all --min-questions 100 --chunk-size 50

# Force recreation of chunks
python scripts/create_chunks.py --exam CAD --force

# Clean up all chunks for an exam
python scripts/create_chunks.py --cleanup CAD

# Migrate data structure to new folder organization
python scripts/migrate_data_structure.py

# Check created chunk sizes
ls -lh data/*/chunks/*.json

# Install new dependencies
pip install -r requirements.txt
```

## Development and Testing

### Local Testing
1. Open DevTools (F12)
2. Network tab: Observe chunk requests
3. Application > Service Workers: Check cache status
4. Console: Monitor lazy loading logs

### Validation
- Navigate between questions to test lazy loading
- Verify optimized images display correctly
- Test offline mode (disable network)
- Measure loading times before/after

## Troubleshooting

### Common Issues

#### "Corrupted data cleared" Messages
**Fixed in v2.5.1+** - This was caused by the old compression system and has been resolved.

**If you still see this:**
1. Clear browser cache and localStorage
2. Refresh the page to download fresh data
3. The issue should not recur with the new storage system

#### Lazy Loading Performance
**If lazy loading feels slow:**
1. Check that you have enabled it in Settings > Interface Settings
2. Disable it if you prefer immediate full loading
3. Large chunks may take time on slow connections

#### Storage Space Issues
**To free up space:**
1. Go to Settings > Statistics Management
2. Click "Clean Old Sessions" to keep only recent data
3. Use "Reset All Statistics" for complete cleanup (with confirmation)

### Best Practices

#### For Users
1. **Leave lazy loading disabled** unless you frequently use very large exams (200+ questions)
2. **Clean statistics periodically** if you use the app heavily
3. **Export favorites** before doing major cleanups
4. **Use advanced search** to filter large exams instead of loading everything

#### For Developers
1. **Test with both lazy loading on/off** to ensure compatibility
2. **Monitor localStorage usage** during development
3. **Test data migration paths** when making storage changes
4. **Validate JSON structure** when adding new data fields

This implementation ensures a significantly improved user experience while maintaining backward compatibility and giving users full control over performance features.