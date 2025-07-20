/**
 * Lazy Loading Module
 * 
 * Handles chunked exam loading, memory optimization, and performance management
 * for large datasets in Exams-Viewer application.
 * 
 * Dependencies: 
 * - Global variables: lazyLoadingConfig, settings, allQuestions, window.devLog, window.devError
 * - External functions: devLog, devError (optional debugging)
 */

// ===========================
// CHUNK DETECTION FUNCTIONS
// ===========================

/**
 * Check if exam has chunked version available
 */
async function checkForChunkedExam(examCode) {
  // Always check for chunked version first for optimal performance
  // If chunks exist, prefer lazy loading regardless of settings for large exams

  try {
    const metadataResponse = await fetch(`data/${examCode}/metadata.json`);
    if (metadataResponse.ok) {
      const metadata = await metadataResponse.json();
      if (metadata.chunked && metadata.total_questions > (window.lazyLoadingConfig?.chunkSize || 50)) {
        // Respect user preference - only use lazy loading if explicitly enabled
        if (window.settings?.enableLazyLoading) {
          if (window.lazyLoadingConfig) {
            window.lazyLoadingConfig.isChunkedExam = true;
            window.lazyLoadingConfig.examMetadata = metadata;
            window.lazyLoadingConfig.totalChunks = metadata.total_chunks || Math.ceil(metadata.total_questions / window.lazyLoadingConfig.chunkSize);
          }
          console.log(`🚀 Lazy loading activated for ${examCode}: ${metadata.total_questions} questions in ${window.lazyLoadingConfig.totalChunks} chunks (user setting)`);
          return true;
        } else {
          console.log(`⚡ Chunked version available for ${examCode} but lazy loading disabled in settings`);
        }
      }
    }
  } catch (error) {
    console.log(`No chunked version available for ${examCode}, using standard loading`);
  }
  if (window.lazyLoadingConfig) {
    window.lazyLoadingConfig.isChunkedExam = false;
  }
  return false;
}

// ===========================
// CHUNK LOADING FUNCTIONS
// ===========================

/**
 * Load a specific chunk of questions
 */
async function loadChunk(examCode, chunkId) {
  if (!window.lazyLoadingConfig?.loadedChunks) {
    if (typeof window.devError === 'function') {
      window.devError('Lazy loading config not initialized');
    }
    return [];
  }

  if (window.lazyLoadingConfig.loadedChunks.has(chunkId)) {
    console.log(`📦 Chunk ${chunkId} already loaded from cache`);
    return window.lazyLoadingConfig.loadedChunks.get(chunkId);
  }

  try {
    console.log(`📥 Loading chunk ${chunkId} for ${examCode}...`);
    const response = await fetch(`data/${examCode}/chunks/chunk_${chunkId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load chunk ${chunkId}: ${response.status}`);
    }

    const chunkData = await response.json();
    const questions = chunkData.questions || [];
    
    window.lazyLoadingConfig.loadedChunks.set(chunkId, questions);
    console.log(`✅ Chunk ${chunkId} loaded: ${questions.length} questions (${chunkData.start_question}-${chunkData.end_question})`);
    
    if (typeof window.devLog === 'function') {
      window.devLog(`Loaded chunk ${chunkId}: ${questions.length} questions`);
    }
    
    return questions;
  } catch (error) {
    console.error(`❌ Error loading chunk ${chunkId}:`, error);
    if (typeof window.devError === 'function') {
      window.devError(`Failed to load chunk ${chunkId}`, error);
    }
    return [];
  }
}

/**
 * Preload chunks around a center chunk for smooth navigation
 */
async function preloadChunks(examCode, centerChunk) {
  if (!window.lazyLoadingConfig) {
    return;
  }

  const promises = [];
  const start = Math.max(0, centerChunk - window.lazyLoadingConfig.preloadBuffer);
  const end = Math.min(window.lazyLoadingConfig.totalChunks - 1, centerChunk + window.lazyLoadingConfig.preloadBuffer);

  console.log(`🔄 Preloading chunks ${start}-${end} around chunk ${centerChunk}`);

  for (let chunkId = start; chunkId <= end; chunkId++) {
    if (!window.lazyLoadingConfig.loadedChunks.has(chunkId)) {
      promises.push(loadChunk(examCode, chunkId));
    }
  }

  if (promises.length > 0) {
    // Use Promise.allSettled for better error handling and performance
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    if (failed > 0) {
      console.warn(`⚠️ Preloaded ${successful}/${promises.length} chunks (${failed} failed)`);
    } else {
      console.log(`✅ Preloaded ${successful} chunks`);
    }
  } else {
    console.log(`📦 All chunks ${start}-${end} already cached`);
  }
}

// ===========================
// QUESTION MANAGEMENT FUNCTIONS
// ===========================

/**
 * Get chunk ID for a specific question index
 */
function getChunkIdForQuestion(questionIndex) {
  if (!window.lazyLoadingConfig?.chunkSize) {
    return 0;
  }
  return Math.floor(questionIndex / window.lazyLoadingConfig.chunkSize);
}

/**
 * Ensure a specific question is loaded (load chunk if necessary)
 */
async function ensureQuestionLoaded(examCode, questionIndex) {
  if (!window.lazyLoadingConfig?.isChunkedExam) {
    return true;
  }

  const requiredChunk = getChunkIdForQuestion(questionIndex);
  
  if (!window.lazyLoadingConfig.loadedChunks.has(requiredChunk)) {
    console.log(`📥 Loading chunk ${requiredChunk} for question ${questionIndex + 1}...`);
    
    try {
      await loadChunk(examCode, requiredChunk);
      await preloadChunks(examCode, requiredChunk);
      
      // Update assembled questions immediately after loading
      if (typeof window.assembleCurrentQuestions === 'function') {
        window.allQuestions = window.assembleCurrentQuestions();
      }
      
      console.log(`✅ Chunk ${requiredChunk} loaded successfully`);
      
      if (typeof window.devLog === 'function') {
        window.devLog(`Question ${questionIndex + 1} loaded from chunk ${requiredChunk}`);
      }
    } catch (error) {
      console.error(`❌ Failed to load chunk ${requiredChunk}:`, error);
      if (typeof window.devError === 'function') {
        window.devError(`Failed to ensure question ${questionIndex + 1} loaded`, error);
      }
      return false;
    }
  }

  return window.lazyLoadingConfig.loadedChunks.has(requiredChunk);
}

/**
 * Assemble current questions from loaded chunks and placeholders
 */
function assembleCurrentQuestions() {
  if (!window.lazyLoadingConfig?.isChunkedExam) {
    return window.allQuestions || [];
  }

  const assembledQuestions = [];
  let loadedChunks = 0;
  let placeholderChunks = 0;

  for (let chunkId = 0; chunkId < window.lazyLoadingConfig.totalChunks; chunkId++) {
    if (window.lazyLoadingConfig.loadedChunks.has(chunkId)) {
      assembledQuestions.push(...window.lazyLoadingConfig.loadedChunks.get(chunkId));
      loadedChunks++;
    } else {
      // Add lightweight placeholder questions for unloaded chunks
      const startIndex = chunkId * window.lazyLoadingConfig.chunkSize;
      const endIndex = Math.min(startIndex + window.lazyLoadingConfig.chunkSize, window.lazyLoadingConfig.examMetadata.total_questions);
      for (let i = startIndex; i < endIndex; i++) {
        assembledQuestions.push({
          question_number: (i + 1).toString(),
          question: `Question ${i + 1}`,
          answers: [],
          isPlaceholder: true,
          chunkId: chunkId
        });
      }
      placeholderChunks++;
    }
  }
  
  console.log(`🧩 Assembled ${assembledQuestions.length} questions: ${loadedChunks} chunks loaded, ${placeholderChunks} placeholders`);
  
  if (typeof window.devLog === 'function') {
    window.devLog(`Assembled ${assembledQuestions.length} questions from ${loadedChunks} loaded chunks`);
  }
  
  return assembledQuestions;
}

// ===========================
// MEMORY OPTIMIZATION FUNCTIONS
// ===========================

/**
 * Clear unused chunks to free memory
 */
function clearUnusedChunks(currentQuestionIndex, keepBuffer = 2) {
  if (!window.lazyLoadingConfig?.isChunkedExam || !window.lazyLoadingConfig.loadedChunks) {
    return 0;
  }

  const currentChunk = getChunkIdForQuestion(currentQuestionIndex);
  const keepStart = Math.max(0, currentChunk - keepBuffer);
  const keepEnd = Math.min(window.lazyLoadingConfig.totalChunks - 1, currentChunk + keepBuffer);
  
  let clearedCount = 0;
  
  for (const [chunkId] of window.lazyLoadingConfig.loadedChunks) {
    if (chunkId < keepStart || chunkId > keepEnd) {
      window.lazyLoadingConfig.loadedChunks.delete(chunkId);
      clearedCount++;
    }
  }
  
  if (clearedCount > 0) {
    console.log(`🧹 Cleared ${clearedCount} unused chunks (keeping chunks ${keepStart}-${keepEnd})`);
    if (typeof window.devLog === 'function') {
      window.devLog(`Memory optimization: cleared ${clearedCount} chunks`);
    }
  }
  
  return clearedCount;
}

/**
 * Get memory usage statistics
 */
function getMemoryStats() {
  if (!window.lazyLoadingConfig?.isChunkedExam) {
    return {
      isChunked: false,
      totalChunks: 0,
      loadedChunks: 0,
      memoryUsage: 'N/A'
    };
  }

  const loadedCount = window.lazyLoadingConfig.loadedChunks?.size || 0;
  const totalQuestions = window.lazyLoadingConfig.examMetadata?.total_questions || 0;
  const loadedQuestions = Array.from(window.lazyLoadingConfig.loadedChunks.values())
    .reduce((total, chunk) => total + chunk.length, 0);
  
  return {
    isChunked: true,
    totalChunks: window.lazyLoadingConfig.totalChunks,
    loadedChunks: loadedCount,
    totalQuestions: totalQuestions,
    loadedQuestions: loadedQuestions,
    memoryUsage: `${Math.round((loadedQuestions / totalQuestions) * 100)}%`,
    chunkSize: window.lazyLoadingConfig.chunkSize
  };
}

/**
 * Reset lazy loading configuration
 */
function resetLazyLoadingConfig() {
  if (window.lazyLoadingConfig) {
    window.lazyLoadingConfig.loadedChunks.clear();
    window.lazyLoadingConfig.currentChunk = 0;
    window.lazyLoadingConfig.totalChunks = 0;
    window.lazyLoadingConfig.isChunkedExam = false;
    window.lazyLoadingConfig.examMetadata = null;
    
    console.log('🔄 Lazy loading config reset');
    if (typeof window.devLog === 'function') {
      window.devLog('Lazy loading configuration reset');
    }
  }
}

// ===========================
// PERFORMANCE MONITORING
// ===========================

/**
 * Monitor chunk loading performance
 */
function createPerformanceMonitor() {
  const stats = {
    totalLoadTime: 0,
    chunksLoaded: 0,
    averageLoadTime: 0,
    errors: 0
  };

  return {
    startTimer() {
      return performance.now();
    },
    
    recordLoad(startTime) {
      const duration = performance.now() - startTime;
      stats.totalLoadTime += duration;
      stats.chunksLoaded++;
      stats.averageLoadTime = stats.totalLoadTime / stats.chunksLoaded;
      
      if (typeof window.devLog === 'function') {
        window.devLog(`Chunk loaded in ${duration.toFixed(2)}ms (avg: ${stats.averageLoadTime.toFixed(2)}ms)`);
      }
    },
    
    recordError() {
      stats.errors++;
    },
    
    getStats() {
      return { ...stats };
    },
    
    reset() {
      stats.totalLoadTime = 0;
      stats.chunksLoaded = 0;
      stats.averageLoadTime = 0;
      stats.errors = 0;
    }
  };
}

// ===========================
// INITIALIZATION FUNCTIONS
// ===========================

/**
 * Initialize lazy loading system
 */
function initializeLazyLoading() {
  if (!window.lazyLoadingConfig) {
    window.lazyLoadingConfig = {
      chunkSize: 50, // Questions per chunk
      loadedChunks: new Map(), // Map of chunkId -> questions array
      currentChunk: 0,
      totalChunks: 0,
      preloadBuffer: 1, // Number of chunks to preload ahead/behind
      isChunkedExam: false, // Whether current exam uses chunking
      examMetadata: null, // Metadata for chunked exams
    };
    
    console.log('🚀 Lazy loading system initialized');
    if (typeof window.devLog === 'function') {
      window.devLog('Lazy loading system initialized with default config');
    }
  }
}

// ===========================
// MODULE EXPORTS
// ===========================

// Export all lazy loading functions for use in other modules
export {
  // Chunk detection
  checkForChunkedExam,
  
  // Chunk loading
  loadChunk,
  preloadChunks,
  
  // Question management
  getChunkIdForQuestion,
  ensureQuestionLoaded,
  assembleCurrentQuestions,
  
  // Memory optimization
  clearUnusedChunks,
  getMemoryStats,
  resetLazyLoadingConfig,
  
  // Performance monitoring
  createPerformanceMonitor,
  
  // Initialization
  initializeLazyLoading,
};