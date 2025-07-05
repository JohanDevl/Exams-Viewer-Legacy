// Global state
let currentExam = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let selectedAnswers = new Set();
let isValidated = false;
let isHighlightEnabled = false;
let settings = {
  showDiscussionDefault: false,
  highlightDefault: false,
};

// Available exams mapping (will be populated dynamically)
let availableExams = {};

// Dynamically discover available exams from data folder
async function discoverAvailableExams() {
  try {
    const discoveredExams = {};

    // Method 1: Try to get file listing from directory (if server supports it)
    try {
      const dirResponse = await fetch("data/");
      if (dirResponse.ok) {
        const dirText = await dirResponse.text();

        // Parse HTML directory listing to find .json files (excluding _links.json)
        const jsonFileRegex = /href="([^"]*\.json)"/g;
        let match;
        while ((match = jsonFileRegex.exec(dirText)) !== null) {
          const filename = match[1];
          // Skip _links.json files, only get main exam files
          if (!filename.includes("_links") && filename.endsWith(".json")) {
            const examCode = filename.replace(".json", "");
            discoveredExams[examCode] = examCode;
          }
        }

        if (Object.keys(discoveredExams).length > 0) {
          console.log(
            "Discovered exams from directory listing:",
            Object.keys(discoveredExams)
          );
          availableExams = discoveredExams;
          return availableExams;
        }
      }
    } catch (error) {
      console.log(
        "Directory listing not available, trying alternative methods"
      );
    }

    // Method 2: Auto-discover by scanning for _links.json files
    console.log("Auto-discovering exams by scanning for _links.json files...");

    // Generate potential exam codes based on common patterns
    const examPrefixes = ["CAD", "CSA", "CAS-PA"];
    const cisModules = [
      "APM",
      "CPG",
      "CSM",
      "Discovery",
      "EM",
      "FSM",
      "HAM",
      "HR",
      "ITSM",
      "PPM",
      "RC",
      "SAM",
      "SIR",
      "SM",
      "SPM",
      "VR",
      "VRM",
    ];

    // Add CIS- prefixed modules
    for (const module of cisModules) {
      examPrefixes.push(`CIS-${module}`);
    }

    // Also try some common variations and new modules that might be added
    const additionalPatterns = [
      "CIS-WSD",
      "CIS-TMG",
      "CIS-SP",
      "CIS-RIM",
      "CIS-GRC",
      "CIS-TSOM",
      "CIS-SecOps",
      "CIS-CAB",
      "CIS-CIM",
      "CIS-CSM-PRO",
      "CIS-ITAM",
    ];

    const allPotentialCodes = [...examPrefixes, ...additionalPatterns];
    console.log("Checking potential codes:", allPotentialCodes);

    // Check for _links.json files to discover what exams are available
    const availableCodes = [];
    const checkPromises = allPotentialCodes.map(async (code) => {
      try {
        const linkResponse = await fetch(`data/${code}_links.json`, {
          method: "HEAD",
        });
        if (linkResponse.ok) {
          availableCodes.push(code);
          console.log(`Found _links.json for: ${code}`);
        }
      } catch (error) {
        // Ignore errors for non-existent files
      }
    });

    await Promise.all(checkPromises);
    console.log("Available codes with _links.json:", availableCodes);

    // Now check if corresponding .json files exist for discovered codes
    const examCheckPromises = availableCodes.map(async (examCode) => {
      try {
        const response = await fetch(`data/${examCode}.json`, {
          method: "HEAD",
        });
        if (response.ok) {
          discoveredExams[examCode] = examCode;
          console.log(`Confirmed exam file exists for: ${examCode}`);
        } else {
          console.log(
            `Exam file not found for: ${examCode} (status: ${response.status})`
          );
        }
      } catch (error) {
        console.log(`Failed to check exam file for: ${examCode}`, error);
      }
    });

    await Promise.all(examCheckPromises);

    // Method 3: If still no exams found, try brute force approach
    if (Object.keys(discoveredExams).length === 0) {
      console.log("Fallback: brute force checking for .json files...");

      const bruteForcePromises = allPotentialCodes.map(async (examCode) => {
        try {
          const response = await fetch(`data/${examCode}.json`, {
            method: "HEAD",
          });
          if (response.ok) {
            discoveredExams[examCode] = examCode;
          }
        } catch (error) {
          // Ignore errors for non-existent files
        }
      });

      await Promise.all(bruteForcePromises);
    }

    // Method 4: Try to discover by attempting to load a manifest file (if it exists)
    if (Object.keys(discoveredExams).length === 0) {
      console.log("Attempting to load manifest file...");
      try {
        const manifestResponse = await fetch("data/manifest.json");
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          if (manifest.exams && Array.isArray(manifest.exams)) {
            for (const examCode of manifest.exams) {
              try {
                const response = await fetch(`data/${examCode}.json`, {
                  method: "HEAD",
                });
                if (response.ok) {
                  discoveredExams[examCode] = examCode;
                }
              } catch (error) {
                // Ignore errors for non-existent files
              }
            }
          }
        }
      } catch (error) {
        console.log("No manifest file found");
      }
    }

    availableExams = discoveredExams;
    console.log("Final discovered exams:", Object.keys(availableExams));

    return availableExams;
  } catch (error) {
    console.error("Error discovering exams:", error);
    // Fallback: return empty object if discovery fails
    availableExams = {};
    return availableExams;
  }
}

// Initialize app
document.addEventListener("DOMContentLoaded", async function () {
  loadSettings();
  setupEventListeners();

  // Show loading message
  const examsList = document.getElementById("examsList");
  examsList.innerHTML =
    '<div class="loading-exams"><div class="spinner"></div><p>Discovering available exams...</p></div>';

  // Discover available exams first
  await discoverAvailableExams();
  await populateExamDropdown();
  await displayAvailableExams();

  // Auto-load exam if URL has hash
  const hash = window.location.hash.slice(1);
  if (hash && availableExams[hash.toUpperCase()]) {
    document.getElementById("examCode").value = hash.toUpperCase();
    loadExam(hash.toUpperCase());
  }
});

// Load settings from localStorage
function loadSettings() {
  const savedSettings = localStorage.getItem("examViewerSettings");
  if (savedSettings) {
    settings = { ...settings, ...JSON.parse(savedSettings) };
    document.getElementById("showDiscussionDefault").checked =
      settings.showDiscussionDefault;
    document.getElementById("highlightDefault").checked =
      settings.highlightDefault;
    isHighlightEnabled = settings.highlightDefault;
  }
}

// Save settings to localStorage
function saveSettings() {
  settings.showDiscussionDefault = document.getElementById(
    "showDiscussionDefault"
  ).checked;
  settings.highlightDefault =
    document.getElementById("highlightDefault").checked;
  localStorage.setItem("examViewerSettings", JSON.stringify(settings));
  isHighlightEnabled = settings.highlightDefault;
}

// Populate exam dropdown with available exams
async function populateExamDropdown() {
  const examSelect = document.getElementById("examCode");

  // Clear existing options except the first one
  examSelect.innerHTML = '<option value="">Select an exam...</option>';

  // Get exam data with question counts
  const examOptions = [];

  for (const examCode of Object.keys(availableExams)) {
    try {
      const response = await fetch(`data/${examCode}.json`);
      if (response.ok) {
        const data = await response.json();
        const questionCount = data.questions ? data.questions.length : 0;
        examOptions.push({
          code: examCode,
          questionCount: questionCount,
        });
      }
    } catch (error) {
      // If we can't load the file, still add it but without question count
      examOptions.push({
        code: examCode,
        questionCount: 0,
      });
    }
  }

  // Sort exams alphabetically by code
  examOptions.sort((a, b) => a.code.localeCompare(b.code));

  // Add options to select
  examOptions.forEach((exam) => {
    const option = document.createElement("option");
    option.value = exam.code;
    option.textContent =
      exam.questionCount > 0
        ? `${exam.code} (${exam.questionCount} questions)`
        : exam.code;
    examSelect.appendChild(option);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Exam selection
  document.getElementById("examCode").addEventListener("change", function (e) {
    const examCode = this.value.trim().toUpperCase();
    if (examCode) {
      loadExam(examCode);
    }
  });

  // Settings
  document.getElementById("settingsBtn").addEventListener("click", () => {
    document.getElementById("settingsModal").style.display = "flex";
  });

  document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("settingsModal").style.display = "none";
    saveSettings();
  });

  // Navigation
  document
    .getElementById("prevBtn")
    .addEventListener("click", () => navigateQuestion(-1));
  document
    .getElementById("nextBtn")
    .addEventListener("click", () => navigateQuestion(1));
  document
    .getElementById("homeBtn")
    .addEventListener("click", () => goToHome());
  document
    .getElementById("randomBtn")
    .addEventListener("click", () => navigateToRandomQuestion());
  document
    .getElementById("jumpBtn")
    .addEventListener("click", () => jumpToQuestion());

  // Answer controls
  document
    .getElementById("validateBtn")
    .addEventListener("click", validateAnswers);
  document.getElementById("resetBtn").addEventListener("click", resetAnswers);
  document
    .getElementById("highlightBtn")
    .addEventListener("click", toggleHighlight);

  // Discussion
  document
    .getElementById("discussionToggle")
    .addEventListener("click", toggleDiscussion);

  // Export
  document.getElementById("exportBtn").addEventListener("click", exportToPDF);
}

// Display available exams
async function displayAvailableExams() {
  const examsList = document.getElementById("examsList");
  examsList.innerHTML = "";

  if (Object.keys(availableExams).length === 0) {
    examsList.innerHTML = "<p>No exams found in data folder</p>";
    return;
  }

  // Create cards for each available exam
  for (const code of Object.keys(availableExams)) {
    const examCard = document.createElement("div");
    examCard.className = "exam-card";

    // Try to get question count
    let questionCount = "Loading...";
    try {
      const response = await fetch(`data/${code}.json`);
      if (response.ok) {
        const data = await response.json();
        questionCount = `${data.questions?.length || 0} questions`;
      } else {
        questionCount = "Click to load";
      }
    } catch (error) {
      questionCount = "Click to load";
    }

    examCard.innerHTML = `
            <div class="exam-code">${code}</div>
            <div class="exam-count">${questionCount}</div>
        `;

    examCard.addEventListener("click", () => {
      document.getElementById("examCode").value = code;
      loadExam(code);
    });

    examsList.appendChild(examCard);
  }
}

// Load exam data
async function loadExam(examCode) {
  if (!availableExams[examCode]) {
    showError(
      `Exam code "${examCode}" not found. Available exams: ${Object.keys(
        availableExams
      ).join(", ")}`
    );
    return;
  }

  showLoading(true);

  try {
    const response = await fetch(`data/${examCode}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load exam data: ${response.status}`);
    }

    const data = await response.json();
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Invalid exam data format");
    }

    currentExam = examCode;
    // Sort questions by question_number numerically with robust comparison
    currentQuestions = data.questions.sort((a, b) => {
      const numA = parseInt(a.question_number, 10);
      const numB = parseInt(b.question_number, 10);

      // Handle invalid numbers
      if (isNaN(numA) && isNaN(numB)) return 0;
      if (isNaN(numA)) return 1;
      if (isNaN(numB)) return -1;

      return numA - numB;
    });
    currentQuestionIndex = 0;

    // Debug: Log first few questions to verify sorting
    console.log(
      "First 10 questions after sorting:",
      currentQuestions.slice(0, 10).map((q) => q.question_number)
    );
    console.log("Total questions loaded:", currentQuestions.length);

    // Update UI
    document.getElementById("availableExams").style.display = "none";
    document.getElementById("navigationSection").style.display = "block";
    document.getElementById("questionSection").style.display = "block";
    document.getElementById("exportBtn").style.display = "flex";
    document.getElementById("homeBtn").style.display = "inline-block";

    displayCurrentQuestion();
    showSuccess(`Loaded ${currentQuestions.length} questions for ${examCode}`);
  } catch (error) {
    showError(`Error loading exam: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// Show/hide loading
function showLoading(show) {
  document.getElementById("loadingSection").style.display = show
    ? "block"
    : "none";
}

// Show error message
function showError(message) {
  const errorEl = document.getElementById("errorMessage");
  errorEl.textContent = message;
  errorEl.style.display = "block";
  document.getElementById("successMessage").style.display = "none";
}

// Show success message
function showSuccess(message) {
  const successEl = document.getElementById("successMessage");
  successEl.textContent = message;
  successEl.style.display = "block";
  document.getElementById("errorMessage").style.display = "none";

  setTimeout(() => {
    successEl.style.display = "none";
  }, 3000);
}

// Navigate to question
function navigateQuestion(direction) {
  if (!currentQuestions.length) return;

  const newIndex = currentQuestionIndex + direction;
  if (newIndex >= 0 && newIndex < currentQuestions.length) {
    currentQuestionIndex = newIndex;
    displayCurrentQuestion();
  }
}

// Navigate to random question
function navigateToRandomQuestion() {
  if (!currentQuestions.length) return;

  const randomIndex = Math.floor(Math.random() * currentQuestions.length);
  currentQuestionIndex = randomIndex;
  displayCurrentQuestion();
}

// Go to home page
function goToHome() {
  // Reset exam state
  currentExam = null;
  currentQuestions = [];
  currentQuestionIndex = 0;
  selectedAnswers.clear();
  isValidated = false;

  // Reset UI
  document.getElementById("examCode").value = "";
  document.getElementById("availableExams").style.display = "block";
  document.getElementById("navigationSection").style.display = "none";
  document.getElementById("questionSection").style.display = "none";
  document.getElementById("exportBtn").style.display = "none";
  document.getElementById("homeBtn").style.display = "none";

  // Hide any messages
  document.getElementById("errorMessage").style.display = "none";
  document.getElementById("successMessage").style.display = "none";

  // Show success message
  showSuccess("Returned to home page");
}

// Jump to specific question
function jumpToQuestion() {
  const questionNumber = parseInt(
    document.getElementById("questionJump").value
  );

  // Find the question by its question_number field
  const questionIndex = currentQuestions.findIndex(
    (q) => parseInt(q.question_number) === questionNumber
  );

  if (questionIndex !== -1) {
    currentQuestionIndex = questionIndex;
    displayCurrentQuestion();
    document.getElementById("questionJump").value = "";
  } else {
    showError(`Question ${questionNumber} not found`);
  }
}

// Display current question
function displayCurrentQuestion() {
  if (!currentQuestions.length) return;

  const question = currentQuestions[currentQuestionIndex];

  // Reset state
  selectedAnswers.clear();
  isValidated = false;

  // Update navigation
  const currentQuestionNumber =
    question.question_number || currentQuestionIndex + 1;
  document.getElementById("questionCounter").textContent = `${
    currentQuestionIndex + 1
  } of ${currentQuestions.length} questions`;
  document.getElementById("prevBtn").disabled = currentQuestionIndex === 0;
  document.getElementById("nextBtn").disabled =
    currentQuestionIndex === currentQuestions.length - 1;

  // Update question
  document.getElementById("questionTitle").textContent = `Question ${
    question.question_number || currentQuestionIndex + 1
  }`;
  document.getElementById("examTopicsLink").href = question.link || "#";
  document.getElementById("questionText").innerHTML = question.question || "";

  // Display answers
  displayAnswers(question);

  // Reset controls
  document.getElementById("validateBtn").style.display = "inline-flex";
  document.getElementById("resetBtn").style.display = "none";

  // Update discussion
  const showDiscussion = settings.showDiscussionDefault;
  const discussionContent = document.getElementById("discussionContent");
  const discussionToggle = document.getElementById("discussionToggle");

  discussionContent.style.display = showDiscussion ? "block" : "none";
  discussionToggle.innerHTML = `<i class="fas fa-comments"></i> ${
    showDiscussion ? "Hide" : "Show"
  } Discussion`;

  if (showDiscussion) {
    displayDiscussion(question);
  }

  updateInstructions();
}

// Display answers
function displayAnswers(question) {
  const answers = question.answers || [];
  const mostVoted = question.most_voted || "";
  const correctAnswers = new Set(mostVoted.split(""));

  const answersList = document.getElementById("answersList");
  answersList.innerHTML = "";

  answers.forEach((answer) => {
    const answerLetter = answer.charAt(0);
    const answerText = answer.substring(3);

    const answerElement = document.createElement("div");
    answerElement.className = "answer-option";
    answerElement.innerHTML = `<span class="answer-letter">${answerLetter}.</span> ${answerText}`;

    answerElement.addEventListener("click", () => {
      if (!isValidated) {
        toggleAnswerSelection(answerLetter, answerElement);
      }
    });

    if (isHighlightEnabled && correctAnswers.has(answerLetter)) {
      answerElement.classList.add("correct-not-selected");
    }

    answersList.appendChild(answerElement);
  });
}

// Toggle answer selection
function toggleAnswerSelection(letter, element) {
  if (selectedAnswers.has(letter)) {
    selectedAnswers.delete(letter);
    element.classList.remove("selected");
  } else {
    selectedAnswers.add(letter);
    element.classList.add("selected");
  }
  updateInstructions();
}

// Update instructions
function updateInstructions() {
  const instructions = document.getElementById("answerInstructions");
  const selectedCount = selectedAnswers.size;

  if (selectedCount === 0) {
    instructions.className = "answer-instructions";
    instructions.innerHTML =
      '<i class="fas fa-info-circle"></i><span>Click on the answers to select them</span>';
  } else {
    instructions.className = "answer-instructions success";
    const selectedLetters = Array.from(selectedAnswers).sort();
    instructions.innerHTML = `<i class="fas fa-check-circle"></i><span>Selected: ${selectedLetters.join(
      ", "
    )}</span>`;
  }
}

// Validate answers
function validateAnswers() {
  if (selectedAnswers.size === 0) {
    showError("Please select at least one answer");
    return;
  }

  const question = currentQuestions[currentQuestionIndex];
  const mostVoted = question.most_voted || "";
  const correctAnswers = new Set(mostVoted.split(""));

  isValidated = true;

  // Update answer elements
  const answerElements = document.querySelectorAll(".answer-option");
  answerElements.forEach((element) => {
    const letter = element
      .querySelector(".answer-letter")
      .textContent.charAt(0);
    const isSelected = selectedAnswers.has(letter);
    const isCorrect = correctAnswers.has(letter);

    element.classList.add("disabled");
    element.classList.remove("selected", "correct-not-selected");

    if (isSelected && isCorrect) {
      element.classList.add("correct");
    } else if (isSelected && !isCorrect) {
      element.classList.add("incorrect");
    } else if (!isSelected && isCorrect) {
      element.classList.add("correct-not-selected");
    }
  });

  // Update controls
  document.getElementById("validateBtn").style.display = "none";
  document.getElementById("resetBtn").style.display = "inline-flex";

  showValidationResults(correctAnswers);
}

// Show validation results
function showValidationResults(correctAnswers) {
  const instructions = document.getElementById("answerInstructions");
  const correctSelected = new Set(
    [...selectedAnswers].filter((x) => correctAnswers.has(x))
  );
  const incorrectSelected = new Set(
    [...selectedAnswers].filter((x) => !correctAnswers.has(x))
  );

  if (
    correctSelected.size === correctAnswers.size &&
    incorrectSelected.size === 0
  ) {
    instructions.className = "answer-instructions success";
    instructions.innerHTML =
      '<i class="fas fa-check-circle"></i><span>Perfect! All correct answers selected.</span>';
  } else if (correctSelected.size > 0) {
    instructions.className = "answer-instructions warning";
    instructions.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>Partially correct: ${correctSelected.size}/${correctAnswers.size}</span>`;
  } else {
    instructions.className = "answer-instructions error";
    instructions.innerHTML =
      '<i class="fas fa-times-circle"></i><span>Incorrect answers selected.</span>';
  }
}

// Reset answers
function resetAnswers() {
  selectedAnswers.clear();
  isValidated = false;

  const answerElements = document.querySelectorAll(".answer-option");
  answerElements.forEach((element) => {
    element.className = "answer-option";
  });

  document.getElementById("validateBtn").style.display = "inline-flex";
  document.getElementById("resetBtn").style.display = "none";

  updateInstructions();
}

// Toggle highlight
function toggleHighlight() {
  isHighlightEnabled = !isHighlightEnabled;
  if (currentQuestions.length > 0) {
    displayCurrentQuestion();
  }
}

// Toggle discussion
function toggleDiscussion() {
  const content = document.getElementById("discussionContent");
  const toggle = document.getElementById("discussionToggle");
  const isVisible = content.style.display === "block";

  if (isVisible) {
    content.style.display = "none";
    toggle.innerHTML = '<i class="fas fa-comments"></i> Show Discussion';
  } else {
    content.style.display = "block";
    toggle.innerHTML = '<i class="fas fa-comments"></i> Hide Discussion';
    displayDiscussion(currentQuestions[currentQuestionIndex]);
  }
}

// Convert URLs to clickable links
function convertUrlsToLinks(text) {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
  return text.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

// Convert text to HTML with line breaks and links
function formatCommentText(text) {
  if (!text) return "";

  // Convert line breaks to <br> tags
  let formattedText = text.replace(/\n/g, "<br>");

  // Convert URLs to clickable links
  formattedText = convertUrlsToLinks(formattedText);

  return formattedText;
}

// Display discussion
function displayDiscussion(question) {
  const comments = question.comments || [];
  const discussionList = document.getElementById("discussionList");

  discussionList.innerHTML = "";

  if (comments.length === 0) {
    discussionList.innerHTML = "<p>No discussion available.</p>";
    return;
  }

  comments.forEach((comment) => {
    const commentElement = document.createElement("div");
    commentElement.className = "discussion-comment";
    commentElement.innerHTML = `
            <div class="comment-header">
                <span>Selected: ${comment.selected_answer || "N/A"}</span>
            </div>
            <div class="comment-text">${formatCommentText(
              comment.content || comment.comment || ""
            )}</div>
        `;
    discussionList.appendChild(commentElement);
  });
}

// Export to PDF using browser print functionality
function exportToPDF() {
  if (!currentQuestions.length) {
    showError("No questions loaded to export");
    return;
  }

  // Create a printable version
  const printWindow = window.open("", "_blank");
  const printDocument = printWindow.document;

  printDocument.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${currentExam} - Questions Export</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .question { margin-bottom: 30px; page-break-inside: avoid; }
                .question-header { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
                .question-text { margin-bottom: 15px; }
                .answers { margin-left: 20px; }
                .answer { margin-bottom: 5px; }
                .correct-answer { background-color: #d4edda; padding: 2px 5px; border-radius: 3px; }
                                 .discussion { margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px; }
                 .comment { margin-bottom: 10px; padding: 8px; background-color: white; border-radius: 3px; }
                 .comment-header { font-weight: bold; font-size: 12px; color: #666; }
                 .comment a { color: #007bff; text-decoration: none; word-break: break-all; }
                 .comment a:hover { text-decoration: underline; }
                @media print {
                    body { margin: 0; }
                    .question { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <h1>Exam Questions - ${currentExam}</h1>
            <p>Total Questions: ${currentQuestions.length}</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <hr>
    `);

  currentQuestions.forEach((question, index) => {
    const questionNumber = question.question_number || index + 1;
    const questionText = question.question || "";
    const answers = question.answers || [];
    const mostVoted = question.most_voted || "";
    const correctAnswers = new Set(mostVoted.split(""));
    const comments = question.comments || [];

    printDocument.write(`
            <div class="question">
                <div class="question-header">Question ${questionNumber}</div>
                <div class="question-text">${questionText}</div>
                <div class="answers">
        `);

    answers.forEach((answer) => {
      const answerLetter = answer.charAt(0);
      const answerText = answer.substring(3);
      const isCorrect = correctAnswers.has(answerLetter);

      printDocument.write(`
                <div class="answer ${isCorrect ? "correct-answer" : ""}">
                    ${answer} ${isCorrect ? "✓" : ""}
                </div>
            `);
    });

    if (mostVoted) {
      printDocument.write(`
                <div style="margin-top: 10px; font-weight: bold; color: #28a745;">
                    Most Voted Answer(s): ${mostVoted}
                </div>
            `);
    }

    if (comments.length > 0) {
      printDocument.write(`
                <div class="discussion">
                    <strong>Discussion:</strong>
            `);

      comments.slice(0, 5).forEach((comment) => {
        printDocument.write(`
                     <div class="comment">
                         <div class="comment-header">Selected: ${
                           comment.selected_answer || "N/A"
                         }</div>
                         <div>${formatCommentText(
                           comment.content || comment.comment || ""
                         )}</div>
                     </div>
                 `);
      });

      printDocument.write("</div>");
    }

    printDocument.write("</div>");
  });

  printDocument.write(`
        </body>
        </html>
    `);

  printDocument.close();

  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print();
  }, 1000);

  showSuccess('Print dialog opened. Choose "Save as PDF" to export.');
}

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if (currentQuestions.length === 0 || e.target.tagName === "INPUT") return;

  switch (e.key) {
    case "ArrowLeft":
      e.preventDefault();
      navigateQuestion(-1);
      break;
    case "ArrowRight":
      e.preventDefault();
      navigateQuestion(1);
      break;
    case "r":
      e.preventDefault();
      navigateToRandomQuestion();
      break;
  }
});
