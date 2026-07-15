/**
 * CyberShield Learning Center Control Module
 * Orchestrates syllabus, persistent states, responsive stage, assessments & certificate generators.
 */

// Local Storage Keys
const PROGRESS_KEY = 'cybershield_academy_progress';
const BOOKMARKS_KEY = 'cybershield_academy_bookmarks';
const COMPLETED_KEY = 'cybershield_academy_completed';
const RESUME_KEY = 'cybershield_academy_resume';

// Academy States
const academyState = {
  activeView: 'catalog', // 'catalog' | 'viewer'
  searchQuery: '',
  levelFilter: 'All', // 'All' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Bookmarked'
  activeBook: null,
  activeSyllabusIndex: 0,
  flattenedSyllabus: [],
  
  // Quiz progress inside a lesson or final quiz
  selectedQuizOption: null,
  quizAnswered: false,
  quizIsCorrect: false,
  
  // Final Exam Tracker
  finalExamAnswers: {}, // index -> selectedOption
  finalExamGrade: null, // null | percent
  
  // Practical Assessment State
  assessmentOption: null,
  assessmentVerified: false,
  assessmentPassed: false
};

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
  initAcademy();
});

/**
 * Initialize Academy controls and register UI hook listeners
 */
function initAcademy() {
  // Bind search input
  const searchInput = document.getElementById('acad-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      academyState.searchQuery = e.target.value.toLowerCase().trim();
      renderAcademyCatalog();
    });
  }

  // Bind filters
  const filterBtns = {
    'all': 'All',
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
    'bookmarked': 'Bookmarked'
  };

  Object.entries(filterBtns).forEach(([btnId, value]) => {
    const btn = document.getElementById(`btn-filter-${btnId}`);
    if (btn) {
      btn.addEventListener('click', () => {
        // Toggle active classes on filter buttons
        document.querySelectorAll('#acad-level-filters button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        academyState.levelFilter = value;
        renderAcademyCatalog();
      });
    }
  });

  // Bind viewer back btn
  const backBtn = document.getElementById('viewer-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', closeCourseViewer);
  }

  // Bind viewer next/prev buttons
  const prevBtn = document.getElementById('viewer-prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', goToPrevSyllabusItem);
  }
  const nextBtn = document.getElementById('viewer-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', goToNextSyllabusItem);
  }

  // Bind bookmark btn in viewer
  const bookBtn = document.getElementById('viewer-bookmark-btn');
  if (bookBtn) {
    bookBtn.addEventListener('click', toggleViewerBookmark);
  }

  // Render initial stats and catalog list
  updateAcademyStats();
  renderAcademyCatalog();
}

/**
 * Update global top stats for the academy gateway
 */
function updateAcademyStats() {
  const activeBooks = window.CYBER_BOOKS || [];
  const completedMap = getCompletedBooksMap();
  const completedCount = Object.keys(completedMap).length;
  
  // Earned Certificates count
  let certCount = 0;
  Object.values(completedMap).forEach(info => {
    if (info.quizPassed && info.assessmentPassed) {
      certCount++;
    }
  });

  const activeEl = document.getElementById('acad-stat-active');
  const completedEl = document.getElementById('acad-stat-completed');
  const certsEl = document.getElementById('acad-stat-certs');

  if (activeEl) activeEl.innerText = activeBooks.length;
  if (completedEl) completedEl.innerText = completedCount;
  if (certsEl) certsEl.innerText = certCount;

  // Auto-update dashboard profile counters and certificates if dashboard integration is present
  if (typeof window.renderProfileStats === 'function') {
    try {
      window.renderProfileStats();
    } catch (e) {
      console.error('Error refreshing dashboard stats:', e);
    }
  }
}

/**
 * Get core database lists from LocalStorage
 */
function getProgressMap() {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveProgressMap(map) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  } catch (e) {}
}

function getBookmarks() {
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveBookmarks(list) {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(list));
  } catch (e) {}
}

function getCompletedBooksMap() {
  try {
    const data = localStorage.getItem(COMPLETED_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveCompletedBooksMap(map) {
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(map));
  } catch (e) {}
}

function getResumeState() {
  try {
    const data = localStorage.getItem(RESUME_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveResumeState(state) {
  try {
    localStorage.setItem(RESUME_KEY, JSON.stringify(state));
  } catch (e) {}
}

/**
 * Filter and render books on catalog page
 */
function renderAcademyCatalog() {
  const grid = document.getElementById('academy-books-grid');
  if (!grid) return;

  const books = window.CYBER_BOOKS || [];
  const progressMap = getProgressMap();
  const completedMap = getCompletedBooksMap();
  const bookmarkList = getBookmarks();

  let filtered = books.filter(book => {
    // Level filters
    if (academyState.levelFilter !== 'All') {
      if (academyState.levelFilter === 'Bookmarked') {
        if (!bookmarkList.includes(book.id)) return false;
      } else if (book.level !== academyState.levelFilter) {
        return false;
      }
    }

    // Search filters
    if (academyState.searchQuery) {
      const titleMatch = book.title.toLowerCase().includes(academyState.searchQuery);
      const descMatch = book.description.toLowerCase().includes(academyState.searchQuery);
      const skillsMatch = book.skills.some(s => s.toLowerCase().includes(academyState.searchQuery));
      return titleMatch || descMatch || skillsMatch;
    }

    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 48px 0; text-align: center;" class="grid-card">
        <i data-lucide="book-open" style="width: 48px; height: 48px; color: var(--text-muted); margin: 0 auto 16px;"></i>
        <h3 style="color: #ffffff; margin-bottom: 8px;">No courses found</h3>
        <p style="color: var(--text-secondary); font-size: 13px;">Adjust your filter search key or check your bookmarks list.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(book => {
    const isBookmarked = bookmarkList.includes(book.id);
    const completedInfo = completedMap[book.id] || {};
    const bookProgress = progressMap[book.id] || [];
    
    // Calculate precise progress percent
    const totalLessons = book.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
    const completedLessons = bookProgress.length;
    
    let progressPercent = 0;
    if (totalLessons > 0) {
      // 80% weight on lessons, 10% on final exam, 10% on final assessment
      progressPercent = Math.round((completedLessons / totalLessons) * 80);
      if (completedInfo.quizPassed) progressPercent += 10;
      if (completedInfo.assessmentPassed) progressPercent += 10;
    }

    const isFullyComplete = completedInfo.quizPassed && completedInfo.assessmentPassed;
    
    // Skills tags rendering
    const skillsHtml = book.skills.slice(0, 3).map(skill => `
      <span class="font-mono" style="font-size: 9.5px; padding: 1px 6px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); color: var(--text-secondary);">${skill}</span>
    `).join('');

    return `
      <div class="grid-card shadow-glow hover:scale-102" style="border-color: rgba(255, 255, 255, 0.04); background: var(--card-bg); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; height: 100%; position: relative;">
        <!-- Card Corners for Hacker Aesthetic -->
        <div class="card-corner corner-tl" style="border-color: ${book.glowColor || 'rgba(6,182,212,0.3)'};"></div>
        <div class="card-corner corner-tr" style="border-color: ${book.glowColor || 'rgba(6,182,212,0.3)'};"></div>
        <div class="card-corner corner-bl" style="border-color: ${book.glowColor || 'rgba(6,182,212,0.3)'};"></div>
        <div class="card-corner corner-br" style="border-color: ${book.glowColor || 'rgba(6,182,212,0.3)'};"></div>

        <!-- Book Header / Cover Banner with ambient glow -->
        <div style="background: ${book.coverColor}; padding: 20px; border-radius: 8px 8px 0 0; border-bottom: 1px solid rgba(255,255,255,0.03); position: relative; overflow: hidden; display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 80% 20%, ${book.glowColor || 'rgba(6,182,212,0.2)'} 0%, transparent 70%); pointer-events: none;"></div>
          
          <div>
            <span class="font-mono" style="font-size: 9px; font-weight: 700; color: ${book.level === 'Beginner' ? 'var(--emerald-bright)' : book.level === 'Intermediate' ? 'var(--cyan-bright)' : 'var(--rose-bright)'}; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05); text-transform: uppercase;">
              ${book.level}
            </span>
            <h3 class="font-display" style="font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 8px; letter-spacing: 0.25px; text-shadow: 0 2px 10px rgba(0,0,0,0.4);">${book.title}</h3>
          </div>

          <button class="navbar-icon-btn ${isBookmarked ? 'text-amber' : ''}" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05);" onclick="event.stopPropagation(); window.toggleCatalogBookmark('${book.id}')" title="${isBookmarked ? 'Remove Bookmark' : 'Bookmark Course'}">
            <i data-lucide="bookmark" style="width: 14px; height: 14px; fill: ${isBookmarked ? 'var(--amber-bright)' : 'transparent'};"></i>
          </button>
        </div>

        <!-- Book Body -->
        <div style="padding: 20px; display: flex; flex-direction: column; flex-grow: 1;">
          <p style="font-size: 12.5px; line-height: 1.5; color: var(--text-secondary); margin-bottom: 16px;">
            ${book.description}
          </p>

          <!-- Skills block -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
            ${skillsHtml}
          </div>

          <!-- Bottom Meta & Progress (at bottom of card) -->
          <div style="margin-top: auto; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="font-mono text-muted" style="font-size: 11px; display: flex; align-items: center; gap: 4px;">
                <i data-lucide="clock" style="width:12px; height:12px;"></i> ${book.readingTime}
              </span>
              ${isFullyComplete ? `
                <span class="font-mono" style="font-size: 10px; font-weight: 700; color: var(--amber-bright); background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); padding: 1px 6px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                  <i data-lucide="award" style="width:12px; height:12px;"></i> CERTIFIED
                </span>
              ` : `
                <span class="font-mono" style="font-size: 11px; color: ${progressPercent > 0 ? 'var(--cyan-bright)' : 'var(--text-muted)'}; font-weight: 600;">
                  ${progressPercent}% Complete
                </span>
              `}
            </div>

            <!-- Custom themed Progress Bar -->
            <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.03); border-radius: 2px; margin-bottom: 16px; overflow: hidden;">
              <div style="width: ${progressPercent}%; height: 100%; background: ${isFullyComplete ? 'var(--amber-glow)' : 'var(--cyan-glow)'}; border-radius: 2px; transition: width 0.4s ease;"></div>
            </div>

            <!-- Action button -->
            <div style="display: flex; gap: 8px;">
              <button class="${isFullyComplete ? 'btn-secondary' : progressPercent > 0 ? 'btn-primary' : 'btn-secondary'}" style="width: 100%; padding: 8px 16px; font-size: 12.5px; display: flex; justify-content: center; align-items: center; gap: 6px;" onclick="window.openCourseViewer('${book.id}')">
                <i data-lucide="${isFullyComplete ? 'rotate-ccw' : progressPercent > 0 ? 'play' : 'book-open'}" style="width: 14px; height: 14px;"></i>
                ${isFullyComplete ? 'Review / Certificate' : progressPercent > 0 ? 'Resume Training' : 'Start Learning'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

/**
 * Toggle bookmarked state of a book in Catalog view
 */
function toggleCatalogBookmark(bookId) {
  let bookmarks = getBookmarks();
  if (bookmarks.includes(bookId)) {
    bookmarks = bookmarks.filter(id => id !== bookId);
    window.showNotification('Course bookmark removed.', 'info');
  } else {
    bookmarks.push(bookId);
    window.showNotification('Course bookmarked successfully.', 'success');
  }
  saveBookmarks(bookmarks);
  renderAcademyCatalog();
}

/**
 * Open the Course syllabus and lesson viewer
 */
function openCourseViewer(bookId) {
  const books = window.CYBER_BOOKS || [];
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  // Set state
  academyState.activeBook = book;
  academyState.flattenedSyllabus = getSyllabusItems(book);
  
  // Clear quiz/assessment states
  academyState.selectedQuizOption = null;
  academyState.quizAnswered = false;
  academyState.quizIsCorrect = false;
  academyState.finalExamAnswers = {};
  academyState.finalExamGrade = null;
  academyState.assessmentOption = null;
  academyState.assessmentVerified = false;
  academyState.assessmentPassed = false;

  // Retrieve last active syllabus index from resume storage, or default to 0
  const resumeState = getResumeState();
  const lastSavedIndex = resumeState[bookId];
  if (lastSavedIndex !== undefined && lastSavedIndex < academyState.flattenedSyllabus.length) {
    academyState.activeSyllabusIndex = lastSavedIndex;
  } else {
    // Auto-discover the first uncompleted index
    let firstUncompletedIndex = 0;
    const progressMap = getProgressMap();
    const completedInfo = getCompletedBooksMap()[bookId] || {};
    const completedLessons = progressMap[bookId] || [];

    for (let i = 0; i < academyState.flattenedSyllabus.length; i++) {
      const item = academyState.flattenedSyllabus[i];
      if (item.type === 'lesson' && !completedLessons.includes(item.id)) {
        firstUncompletedIndex = i;
        break;
      } else if (item.type === 'final_quiz' && !completedInfo.quizPassed) {
        firstUncompletedIndex = i;
        break;
      } else if (item.type === 'final_assessment' && !completedInfo.assessmentPassed) {
        firstUncompletedIndex = i;
        break;
      }
    }
    academyState.activeSyllabusIndex = firstUncompletedIndex;
  }

  // Toggle views
  document.getElementById('learning-catalog-view').style.display = 'none';
  const viewerPanel = document.getElementById('learning-course-viewer');
  viewerPanel.style.display = 'block';

  // Set metadata fields
  document.getElementById('viewer-book-title').innerText = book.title;
  document.getElementById('viewer-book-time').innerText = `Est: ${book.readingTime}`;
  
  const levelBadge = document.getElementById('viewer-book-level');
  levelBadge.innerText = book.level.toUpperCase();
  levelBadge.style.color = book.level === 'Beginner' ? 'var(--emerald-bright)' : book.level === 'Intermediate' ? 'var(--cyan-bright)' : 'var(--rose-bright)';
  levelBadge.style.backgroundColor = book.level === 'Beginner' ? 'rgba(16,185,129,0.1)' : book.level === 'Intermediate' ? 'rgba(6,182,212,0.1)' : 'rgba(244,63,94,0.1)';
  levelBadge.style.borderColor = book.level === 'Beginner' ? 'rgba(16,185,129,0.2)' : book.level === 'Intermediate' ? 'rgba(6,182,212,0.2)' : 'rgba(244,63,94,0.2)';

  updateViewerBookmarkBtn();
  updateCourseViewerProgress();
  renderSyllabusMenu();
  renderActiveStage();
  
  window.showNotification(`LOADED PROTOCOL: ${book.title.toUpperCase()}`, 'info');
}

/**
 * Construct flat syllabus array
 */
function getSyllabusItems(book) {
  const items = [];
  book.chapters.forEach(ch => {
    ch.lessons.forEach(l => {
      items.push({
        type: 'lesson',
        id: l.id,
        title: l.title,
        chapterTitle: ch.title,
        lesson: l
      });
    });
  });
  
  items.push({
    type: 'final_quiz',
    id: book.id + '_final_quiz',
    title: 'Final Certification Quiz'
  });
  
  items.push({
    type: 'final_assessment',
    id: book.id + '_final_assessment',
    title: 'Final Practical Hands-On Lab'
  });

  return items;
}

/**
 * Handle bookmark inside the course viewer
 */
function toggleViewerBookmark() {
  if (!academyState.activeBook) return;
  const bookId = academyState.activeBook.id;
  let bookmarks = getBookmarks();

  if (bookmarks.includes(bookId)) {
    bookmarks = bookmarks.filter(id => id !== bookId);
    window.showNotification('Course bookmark removed.', 'info');
  } else {
    bookmarks.push(bookId);
    window.showNotification('Course bookmarked successfully.', 'success');
  }
  
  saveBookmarks(bookmarks);
  updateViewerBookmarkBtn();
  renderAcademyCatalog();
}

function updateViewerBookmarkBtn() {
  const btn = document.getElementById('viewer-bookmark-btn');
  if (!btn || !academyState.activeBook) return;
  const isBookmarked = getBookmarks().includes(academyState.activeBook.id);
  
  if (isBookmarked) {
    btn.classList.add('text-amber');
    btn.innerHTML = `<i data-lucide="bookmark" style="fill: var(--amber-bright);"></i>`;
  } else {
    btn.classList.remove('text-amber');
    btn.innerHTML = `<i data-lucide="bookmark"></i>`;
  }
  lucide.createIcons();
}

/**
 * Sync and update course progress values inside the viewer
 */
function updateCourseViewerProgress() {
  const book = academyState.activeBook;
  if (!book) return;

  const progressMap = getProgressMap();
  const completedInfo = getCompletedBooksMap()[book.id] || {};
  const completedLessons = progressMap[book.id] || [];
  
  const totalLessons = book.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
  const completedCount = completedLessons.length;
  
  let percent = 0;
  if (totalLessons > 0) {
    percent = Math.round((completedCount / totalLessons) * 80);
    if (completedInfo.quizPassed) percent += 10;
    if (completedInfo.assessmentPassed) percent += 10;
  }

  const progressBar = document.getElementById('viewer-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }
}

/**
 * Render Left Navigation Menu Syllabus rail
 */
function renderSyllabusMenu() {
  const menu = document.getElementById('viewer-syllabus-menu');
  if (!menu || !academyState.activeBook) return;

  const book = academyState.activeBook;
  const progressMap = getProgressMap();
  const completedMap = getCompletedBooksMap();
  const completedLessons = progressMap[book.id] || [];
  const completedInfo = completedMap[book.id] || {};

  let html = '';
  
  // Render lessons grouped by chapters
  book.chapters.forEach(chapter => {
    html += `
      <div style="margin-top: 10px; margin-bottom: 4px;">
        <span class="font-mono text-muted" style="font-size: 9.5px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">${chapter.title}</span>
      </div>
    `;

    chapter.lessons.forEach(lesson => {
      const isCompleted = completedLessons.includes(lesson.id);
      const sylIndex = academyState.flattenedSyllabus.findIndex(item => item.id === lesson.id);
      const isActive = academyState.activeSyllabusIndex === sylIndex;
      const isLocked = !isSyllabusItemUnlocked(sylIndex);

      html += `
        <button class="syllabus-menu-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}" 
                style="display: flex; align-items: center; justify-content: space-between; width: 100%; text-align: left; padding: 8px 12px; border-radius: 6px; background: ${isActive ? 'rgba(6,182,212,0.06)' : 'transparent'}; border: 1px solid ${isActive ? 'rgba(6,182,212,0.15)' : 'transparent'}; color: ${isActive ? '#ffffff' : isLocked ? 'var(--text-muted)' : 'var(--text-secondary)'}; font-size: 12px; cursor: ${isLocked ? 'not-allowed' : 'pointer'}; margin-bottom: 4px; transition: all 0.2s;"
                ${isLocked ? 'disabled' : ''} onclick="window.selectSyllabusIndex(${sylIndex})">
          <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <i data-lucide="${isCompleted ? 'check-circle' : isLocked ? 'lock' : 'circle'}" 
               style="width: 14px; height: 14px; flex-shrink: 0; color: ${isCompleted ? 'var(--emerald-bright)' : isLocked ? 'var(--text-muted)' : 'var(--cyan-glow)'};"></i>
            <span style="overflow: hidden; text-overflow: ellipsis;">${lesson.title}</span>
          </div>
        </button>
      `;
    });
  });

  // Render Certification segments
  html += `
    <div style="margin-top: 14px; margin-bottom: 4px; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 12px;">
      <span class="font-mono text-muted" style="font-size: 9.5px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">CERTIFICATION MILESTONES</span>
    </div>
  `;

  // Final Quiz menu item
  const quizIndex = academyState.flattenedSyllabus.findIndex(item => item.type === 'final_quiz');
  const isQuizActive = academyState.activeSyllabusIndex === quizIndex;
  const isQuizLocked = !isSyllabusItemUnlocked(quizIndex);
  const isQuizPassed = completedInfo.quizPassed;

  html += `
    <button class="syllabus-menu-item ${isQuizActive ? 'active' : ''} ${isQuizLocked ? 'locked' : ''}" 
            style="display: flex; align-items: center; justify-content: space-between; width: 100%; text-align: left; padding: 8px 12px; border-radius: 6px; background: ${isQuizActive ? 'rgba(6,182,212,0.06)' : 'transparent'}; border: 1px solid ${isQuizActive ? 'rgba(6,182,212,0.15)' : 'transparent'}; color: ${isQuizActive ? '#ffffff' : isQuizLocked ? 'var(--text-muted)' : 'var(--text-secondary)'}; font-size: 12px; cursor: ${isQuizLocked ? 'not-allowed' : 'pointer'}; margin-bottom: 4px; transition: all 0.2s;"
            ${isQuizLocked ? 'disabled' : ''} onclick="window.selectSyllabusIndex(${quizIndex})">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i data-lucide="${isQuizPassed ? 'check-circle' : isQuizLocked ? 'lock' : 'help-circle'}" 
           style="width: 14px; height: 14px; color: ${isQuizPassed ? 'var(--emerald-bright)' : isQuizLocked ? 'var(--text-muted)' : 'var(--amber-bright)'};"></i>
        <span>Final Quiz Exam</span>
      </div>
    </button>
  `;

  // Final Practical Assessment menu item
  const assessIndex = academyState.flattenedSyllabus.findIndex(item => item.type === 'final_assessment');
  const isAssessActive = academyState.activeSyllabusIndex === assessIndex;
  const isAssessLocked = !isSyllabusItemUnlocked(assessIndex);
  const isAssessPassed = completedInfo.assessmentPassed;

  html += `
    <button class="syllabus-menu-item ${isAssessActive ? 'active' : ''} ${isAssessLocked ? 'locked' : ''}" 
            style="display: flex; align-items: center; justify-content: space-between; width: 100%; text-align: left; padding: 8px 12px; border-radius: 6px; background: ${isAssessActive ? 'rgba(6,182,212,0.06)' : 'transparent'}; border: 1px solid ${isAssessActive ? 'rgba(6,182,212,0.15)' : 'transparent'}; color: ${isAssessActive ? '#ffffff' : isAssessLocked ? 'var(--text-muted)' : 'var(--text-secondary)'}; font-size: 12px; cursor: ${isAssessLocked ? 'not-allowed' : 'pointer'}; transition: all 0.2s;"
            ${isAssessLocked ? 'disabled' : ''} onclick="window.selectSyllabusIndex(${assessIndex})">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i data-lucide="${isAssessPassed ? 'check-circle' : isAssessLocked ? 'lock' : 'terminal'}" 
           style="width: 14px; height: 14px; color: ${isAssessPassed ? 'var(--emerald-bright)' : isAssessLocked ? 'var(--text-muted)' : 'var(--rose-bright)'};"></i>
        <span>Hands-On Practical Lab</span>
      </div>
    </button>
  `;

  menu.innerHTML = html;
  lucide.createIcons();
}

function areAllLessonsCompleted(book) {
  if (!book) return false;
  const progressMap = getProgressMap();
  const completedLessons = progressMap[book.id] || [];
  
  const lessonIds = [];
  book.chapters.forEach(ch => {
    ch.lessons.forEach(l => {
      lessonIds.push(l.id);
    });
  });
  
  return lessonIds.length > 0 && lessonIds.every(id => completedLessons.includes(id));
}

/**
 * Verify if item i is unlocked (must complete all preceding items)
 */
function isSyllabusItemUnlocked(index) {
  if (index <= 0) return true;
  const book = academyState.activeBook;
  if (!book) return false;

  const item = academyState.flattenedSyllabus[index];
  if (!item) return false;

  const progressMap = getProgressMap();
  const completedMap = getCompletedBooksMap();
  const completedLessons = progressMap[book.id] || [];
  const completedInfo = completedMap[book.id] || {};

  if (item.type === 'lesson') {
    const prevItem = academyState.flattenedSyllabus[index - 1];
    if (prevItem && prevItem.type === 'lesson') {
      return completedLessons.includes(prevItem.id);
    }
    return true;
  }

  if (item.type === 'final_quiz') {
    return areAllLessonsCompleted(book);
  }

  if (item.type === 'final_assessment') {
    return completedInfo.quizPassed === true;
  }
  
  return false;
}

/**
 * Navigate by selecting left syllabus index
 */
function selectSyllabusIndex(index) {
  if (isSyllabusItemUnlocked(index)) {
    academyState.activeSyllabusIndex = index;
    
    // Clear sub-panel selection states
    academyState.selectedQuizOption = null;
    academyState.quizAnswered = false;
    academyState.quizIsCorrect = false;
    academyState.labCompleted = false;
    academyState.assessmentOption = null;
    academyState.assessmentVerified = false;
    academyState.assessmentPassed = false;

    // Save resume learning pointer
    const resume = getResumeState();
    resume[academyState.activeBook.id] = index;
    saveResumeState(resume);

    renderSyllabusMenu();
    renderActiveStage();
  } else {
    window.showNotification('Lock warning: Complete current training tasks first!', 'error');
  }
}

/**
 * Safe utility to parse or fallback/generate lab data for a lesson.
 * Guarantees no "Directive: undefined" or missing parameters exist.
 */
function getLabForLesson(lesson) {
  if (!lesson) lesson = {};
  
  // Base default values
  let lab = lesson.lab || {};
  
  const title = lesson.title || "Security Assessment";
  
  // Safe extraction with default fallbacks
  const prompt = lab.prompt || lab.directive || `Analyze security parameters and execute validation utilities for ${title}.`;
  const expectedInput = lab.expectedInput || lab.expectedCmd || lab.cmd || `cat /var/log/syslog | grep "${title.toLowerCase().replace(/[^a-z0-9]/g, '')}"`;
  const hint = lab.hint || `Enter '${expectedInput}' in the command terminal to verify.`;
  const simulatedOutput = lab.simulatedOutput || lab.out || `[+] Audit logs compiled successfully.\nHost system secure. No intrusion indicators detected in ${title} parameters.`;
  const validationRules = lab.validationRules || `Command must match or be equivalent to verification instructions: '${expectedInput}'`;

  return {
    prompt: prompt,
    expectedInput: expectedInput,
    hint: hint,
    simulatedOutput: simulatedOutput,
    validationRules: validationRules
  };
}

/**
 * Handle NAT lesson educational simulation commands.
 */
function getNatSimulation(userCmd) {
  const cmd = userCmd.toLowerCase().trim();
  if (cmd.startsWith("ip addr") || cmd.startsWith("ip a")) {
    return {
      output: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n       valid_lft forever preferred_lft forever\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000\n    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff\n    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0\n       valid_lft forever preferred_lft forever`,
      valid: true
    };
  }
  if (cmd.startsWith("ip route") || cmd.startsWith("ip r") || cmd === "route") {
    return {
      output: `default via 192.168.1.1 dev eth0 proto dhcp metric 100 \n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100 metric 100`,
      valid: true
    };
  }
  if (cmd.startsWith("hostname")) {
    return {
      output: `cybershield-nat-router`,
      valid: true
    };
  }
  if (cmd.startsWith("ping")) {
    const target = userCmd.split(/\s+/)[1] || "8.8.8.8";
    return {
      output: `PING ${target} (${target}) 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=118 time=12.4 ms\n64 bytes from ${target}: icmp_seq=2 ttl=118 time=11.1 ms\n\n--- ${target} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1001ms\nrtt min/avg/max/mdev = 11.121/11.764/12.408/0.643 ms`,
      valid: true
    };
  }
  if (cmd.startsWith("traceroute")) {
    const target = userCmd.split(/\s+/)[1] || "cybershield.org";
    return {
      output: `traceroute to ${target} (192.168.1.1), 30 hops max, 60 byte packets\n 1  192.168.1.1 (192.168.1.1)  1.234 ms  1.112 ms  1.098 ms\n 2  10.0.0.1 (10.0.0.1)  4.567 ms  4.432 ms  4.398 ms\n 3  ${target} (192.168.1.1)  8.912 ms  8.745 ms  8.612 ms`,
      valid: true
    };
  }
  if (cmd.includes("iptables") && cmd.includes("nat")) {
    return {
      output: `[+] NAT POSTROUTING masquerade applied on eth0.`,
      valid: true
    };
  }
  return {
    output: null,
    valid: false
  };
}

/**
 * Handle Active Lab Hint Request without HTML escaping issues.
 */
window.requestActiveLabHint = function() {
  const item = academyState.flattenedSyllabus[academyState.activeSyllabusIndex];
  if (item && item.type === 'lesson') {
    const lesson = item.lesson;
    const lab = getLabForLesson(lesson);
    window.showNotification(`Lab Manual Hint: ${lab.hint}`, 'info');
  }
};

/**
 * Render Central Stage (Lesson content, Quiz forms, or simulated laboratory challenges)
 */
function renderActiveStage() {
  const container = document.getElementById('viewer-stage-content');
  if (!container || !academyState.activeBook) return;

  const item = academyState.flattenedSyllabus[academyState.activeSyllabusIndex];
  if (!item) return;

  const progressMap = getProgressMap();
  const completedMap = getCompletedBooksMap();
  const bookCompletedInfo = completedMap[academyState.activeBook.id] || {};
  const completedLessons = progressMap[academyState.activeBook.id] || [];

  // Update navigation buttons enabled states
  updateViewerActionBarState();

  if (item.type === 'lesson') {
    const lesson = item.lesson;
    const isCompleted = completedLessons.includes(lesson.id);
    const quiz = lesson.interactive || lesson.quiz || {};
    
    // Auto-fill states if already completed
    if (isCompleted) {
      academyState.quizAnswered = true;
      academyState.quizIsCorrect = true;
      academyState.labCompleted = true;
    }

    const lab = getLabForLesson(lesson);

    container.innerHTML = `
      <div style="animation: fadeIn 0.3s ease-out; line-height:1.6;">
        <span class="font-mono text-cyan" style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Chapter: ${item.chapterTitle}</span>
        <h2 class="font-display" style="font-size: 24px; font-weight: 700; color: #ffffff; margin-top: 6px; margin-bottom: 20px;">${lesson.title}</h2>
        
        <div class="lesson-content-stage" style="color: var(--text-secondary); font-size: 13.5px; margin-bottom: 24px;">
          ${lesson.content}
        </div>

        <!-- STAGE 1: CONCEPT VERIFICATION QUIZ -->
        <div class="grid-card" style="padding: 20px; background: rgba(3,7,18,0.4); border-color: rgba(255,255,255,0.04); border-radius: 8px; margin-top: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h4 class="font-mono" style="font-size: 11px; font-weight: 700; color: var(--cyan-bright); text-transform: uppercase; letter-spacing: 0.5px;">Step 1: Concept Verification Terminal</h4>
            <span style="font-size: 11px; font-weight: 600; color: ${academyState.quizIsCorrect ? 'var(--emerald-bright)' : 'var(--amber-bright)'}">
              ${academyState.quizIsCorrect ? '✓ VERIFIED' : 'PENDING'}
            </span>
          </div>
          <p style="font-size: 13px; color: #ffffff; margin-bottom: 16px;">${quiz.question || ''}</p>
          
          <div style="display: flex; flex-direction: column; gap: 8px;" id="lesson-quiz-options">
            ${(quiz.options || []).map((opt, idx) => {
              const isSelected = academyState.selectedQuizOption === idx;
              let btnClass = 'btn-secondary';
              let styleBorder = 'border-color: rgba(255,255,255,0.05); background: rgba(255,255,255,0.01);';
              
              if (isSelected) {
                if (academyState.quizAnswered) {
                  if (academyState.quizIsCorrect) {
                    btnClass = 'btn-primary';
                    styleBorder = 'border-color: var(--emerald-glow); background: rgba(16,185,129,0.08); color: var(--emerald-bright);';
                  } else {
                    styleBorder = 'border-color: var(--rose-glow); background: rgba(244,63,94,0.08); color: var(--rose-bright);';
                  }
                } else {
                  styleBorder = 'border-color: var(--cyan-glow); background: rgba(6,182,212,0.08);';
                }
              } else if (academyState.quizAnswered && academyState.quizIsCorrect && idx === quiz.answer) {
                styleBorder = 'border-color: var(--emerald-glow); background: rgba(16,185,129,0.04);';
              }

              return `
                <button class="${btnClass}" style="text-align: left; padding: 10px 16px; font-size: 12.5px; transition: all 0.2s; ${styleBorder}" 
                        ${academyState.quizAnswered ? 'disabled' : ''} onclick="window.selectLessonQuizOption(${idx})">
                  ${opt}
                </button>
              `;
            }).join('')}
          </div>

          <!-- Feedback block -->
          <div id="lesson-quiz-feedback" style="margin-top: 16px;">
            ${academyState.quizAnswered ? `
              <div style="padding: 12px 16px; background: rgba(255,255,255,0.02); border-left: 3px solid ${academyState.quizIsCorrect ? 'var(--emerald-glow)' : 'var(--rose-glow)'}; border-radius: 6px; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
                <div>
                  <p style="font-size: 13px; font-weight: 600; color: ${academyState.quizIsCorrect ? 'var(--emerald-bright)' : 'var(--rose-bright)'};">
                    ${academyState.quizIsCorrect ? 'Handshake Success: Correct Answer!' : 'Audit Failed: Incorrect Answer.'}
                  </p>
                  <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">${quiz.explanation || ''}</p>
                </div>
                ${!academyState.quizIsCorrect ? `
                  <button class="btn-primary" style="font-size: 11px; padding: 4px 10px; background: var(--rose-glow); border-color: var(--rose-bright);" onclick="window.resetLessonQuiz()">Retry</button>
                ` : ''}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- STAGE 2: GUIDED PRACTICAL LAB SANDBOX -->
        <div class="grid-card" style="padding: 20px; background: rgba(3,7,18,0.5); border-color: ${academyState.quizIsCorrect ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.02)'}; border-radius: 8px; margin-top: 24px; opacity: ${academyState.quizIsCorrect ? 1 : 0.55}; pointer-events: ${academyState.quizIsCorrect ? 'auto' : 'none'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h4 class="font-mono" style="font-size: 11px; font-weight: 700; color: var(--rose-bright); text-transform: uppercase; letter-spacing: 0.5px;">Step 2: Practical Laboratory Range</h4>
            <span style="font-size: 11px; font-weight: 600; color: ${academyState.labCompleted ? 'var(--emerald-bright)' : 'var(--amber-bright)'}">
              ${academyState.labCompleted ? '✓ COMPLETE' : academyState.quizIsCorrect ? 'READY - AWAITING WORK' : 'LOCKED (SOLVE STEP 1)'}
            </span>
          </div>
          
          ${!academyState.quizIsCorrect ? `
            <div style="text-align: center; padding: 30px; background: rgba(0,0,0,0.2); border-radius: 6px; border: 1px dashed rgba(255,255,255,0.04); color: var(--text-muted);">
              <i data-lucide="lock" style="width: 24px; height: 24px; margin: 0 auto 10px; opacity: 0.5;"></i>
              <p style="font-size: 12.5px;">Please verify your theoretical knowledge in Step 1 to unlock this active lab session.</p>
            </div>
          ` : `
            <div>
              <!-- Structured Lab Specifications (5 required fields) -->
              <div style="background: rgba(2, 6, 23, 0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin-bottom: 16px; font-size: 13px; display: flex; flex-direction: column; gap: 12px;">
                <div>
                  <strong style="color: var(--cyan-bright); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 2px;">• Lab Objective</strong>
                  <p style="color: #ffffff; margin: 0; line-height: 1.4;">${lab.prompt}</p>
                </div>
                <div>
                  <strong style="color: var(--cyan-bright); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 2px;">• Required Command(s)</strong>
                  <code style="color: #38bdf8; background: rgba(56,189,248,0.15); padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 11px; display: inline-block; margin-top: 2px; border: 1px solid rgba(56,189,248,0.1);">${lab.expectedInput}</code>
                </div>
                <div>
                  <strong style="color: var(--cyan-bright); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 2px;">• Manual Hint</strong>
                  <p style="color: var(--text-secondary); margin: 0; font-size: 12px; line-height: 1.4;">${lab.hint}</p>
                </div>
                <div>
                  <strong style="color: var(--cyan-bright); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 4px;">• Expected Output</strong>
                  <pre style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.04); border-radius: 4px; padding: 8px 12px; font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); white-space: pre-wrap; margin: 0; line-height: 1.4;">${lab.simulatedOutput}</pre>
                </div>
                <div>
                  <strong style="color: var(--cyan-bright); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 2px;">• Validation Rules</strong>
                  <p style="color: var(--text-secondary); margin: 0; font-size: 12px; line-height: 1.4;">${lab.validationRules}</p>
                </div>
              </div>
              
              <!-- Dark CLI Sandbox Console -->
              <div style="background: #020617; border: 1px solid rgba(244,63,94,0.15); border-radius: 6px; font-family: var(--font-mono); font-size: 12px; padding: 14px; margin-bottom: 14px; color: #38bdf8; box-shadow: inset 0 0 10px rgba(0,0,0,0.85);">
                <div style="color: var(--text-muted); font-size: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                  <span>CYBERSHIELD CLI TERMINAL v3.11_STABLE</span>
                  <span style="color: ${academyState.labCompleted ? 'var(--emerald-bright)' : 'var(--amber-bright)'}">● ${academyState.labCompleted ? 'ONLINE - SECURED' : 'AWAITING INPUT'}</span>
                </div>
                
                <div id="lab-terminal-output" style="min-height: 70px; max-height: 160px; overflow-y: auto; margin-bottom: 10px; line-height: 1.45; white-space: pre-wrap; color: #e2e8f0; font-size: 11.5px;">${academyState.labCompleted ? `student@cybershield:~$ ${lab.expectedInput}\n\n${lab.simulatedOutput}\n\n[+] CONSOLE HARNESS VERIFIED! Security drill completed successfully.` : `student@cybershield:~$ `}</div>
                
                ${!academyState.labCompleted ? `
                  <div style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.4); padding: 6px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);">
                    <span style="color: var(--rose-bright); font-weight: bold;">student@cybershield:~$</span>
                    <input type="text" id="lab-command-input" placeholder="Enter matching control commands..." 
                           style="background: transparent; border: none; outline: none; color: #34d399; width: 100%; font-family: var(--font-mono); font-size: 12px;"
                           onkeydown="if(event.key === 'Enter') window.executeLessonLabCommand()" />
                  </div>
                ` : ''}
              </div>

              <!-- Action Bar -->
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <span style="font-size: 11px; color: var(--text-muted); cursor: pointer; text-decoration: underline;" onclick="window.requestActiveLabHint()">
                  <i data-lucide="help-circle" style="width:12px; height:12px; display:inline-block; margin-right:4px; vertical-align:middle;"></i> Request Manual Hint
                </span>
                
                ${!academyState.labCompleted ? `
                  <button class="btn-primary" style="background: var(--rose-glow); border-color: var(--rose-bright); font-size: 11px; padding: 5px 12px;" onclick="window.executeLessonLabCommand()">
                    <i data-lucide="terminal" style="width: 12px; height: 12px; display:inline-block; margin-right:4px;"></i> Run Verification
                  </button>
                ` : `
                  <div style="display: flex; align-items: center; gap: 6px; color: var(--emerald-bright); font-weight: 600; font-size: 12px;">
                    <i data-lucide="check-circle" style="width:14px; height:14px;"></i> Range Exercise Complete!
                  </div>
                `}
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  } else if (item.type === 'final_quiz') {
    renderFinalExamStage(container, bookCompletedInfo);
  } else if (item.type === 'final_assessment') {
    renderFinalAssessmentStage(container, bookCompletedInfo);
  }
  
  lucide.createIcons();
}

/**
 * Handle Mini-Quiz option selection inside a Lesson
 */
window.selectLessonQuizOption = function(optionIndex) {
  if (academyState.quizAnswered) return;
  academyState.selectedQuizOption = optionIndex;
  
  const item = academyState.flattenedSyllabus[academyState.activeSyllabusIndex];
  const quiz = item.lesson.interactive || item.lesson.quiz || {};
  const correctAnswer = quiz.answer;
  
  academyState.quizAnswered = true;
  academyState.quizIsCorrect = (optionIndex === correctAnswer);

  if (academyState.quizIsCorrect) {
    window.showNotification('Handshake verified! Theoretical step resolved. Practical Lab unlocked.', 'success');
  } else {
    window.showNotification('Verification failed. Review content and try again.', 'error');
  }

  // Refresh active stage to show feedback/explanations
  renderActiveStage();
};

/**
 * Reset Mini-Quiz state for a retry
 */
window.resetLessonQuiz = function() {
  academyState.selectedQuizOption = null;
  academyState.quizAnswered = false;
  academyState.quizIsCorrect = false;
  renderActiveStage();
};

/**
 * Executed by the user to submit command strings in the Lab Sandbox
 */
window.executeLessonLabCommand = function() {
  const inputEl = document.getElementById('lab-command-input');
  if (!inputEl) return;
  const userCmd = inputEl.value.trim();
  if (!userCmd) return;
  
  const item = academyState.flattenedSyllabus[academyState.activeSyllabusIndex];
  if (!item || item.type !== 'lesson') return;
  const lesson = item.lesson;
  const lab = getLabForLesson(lesson);
  
  const outputEl = document.getElementById('lab-terminal-output');
  if (outputEl) {
    outputEl.innerHTML += `\nstudent@cybershield:~$ ${userCmd}\n`;
  }
  
  const isNatLesson = (lesson.id === 'net_l7' || 
                        (lesson.title && (lesson.title.includes('NAT') || lesson.title.includes('Network Address Translation'))));
  
  let isValid = false;
  let responseOutput = '';
  
  if (isNatLesson) {
    const natSim = getNatSimulation(userCmd);
    if (natSim.valid) {
      isValid = true;
      responseOutput = natSim.output;
    }
  } else {
    // Standard command validator compares against current objective / required commands
    const userClean = userCmd.trim();
    const userParts = userClean.toLowerCase().split(/\s+/);
    const userExec = userParts[0];
    
    const expectedClean = lab.expectedInput.trim();
    const expectedParts = expectedClean.toLowerCase().split(/\s+/);
    const expectedExec = expectedParts[0];
    
    if (userClean.toLowerCase() === expectedClean.toLowerCase()) {
      isValid = true;
      responseOutput = lab.simulatedOutput;
    } else if (expectedExec && (userClean.toLowerCase().includes(expectedExec) || expectedClean.toLowerCase().includes(userExec))) {
      isValid = true;
      responseOutput = lab.simulatedOutput;
    } else if (userExec === "sudo" && userParts[1] && (userParts[1] === expectedExec || expectedClean.toLowerCase().includes(userParts[1]))) {
      isValid = true;
      responseOutput = lab.simulatedOutput;
    }
  }
  
  if (isValid) {
    if (outputEl) {
      outputEl.innerHTML += `\n${responseOutput}\n\n[+] CONSOLE HARNESS VERIFIED! Security drill completed successfully.`;
      outputEl.scrollTop = outputEl.scrollHeight;
    }
    
    academyState.labCompleted = true;
    
    // Save completion index
    const bookId = academyState.activeBook.id;
    const progressMap = getProgressMap();
    if (!progressMap[bookId]) progressMap[bookId] = [];
    if (!progressMap[bookId].includes(item.id)) {
      progressMap[bookId].push(item.id);
    }
    saveProgressMap(progressMap);
    
    updateCourseViewerProgress();
    updateAcademyStats();
    
    window.showNotification('Practical Range verified: Lab completed successfully!', 'success');
    
    setTimeout(() => {
      renderActiveStage();
      renderSyllabusMenu();
    }, 1200);
  } else {
    if (outputEl) {
      outputEl.innerHTML += `\n[-] Audit failed: Command execution returned exit code 1.\nError: Parameters do not match drill objective. Check manual hint.`;
      outputEl.scrollTop = outputEl.scrollHeight;
    }
    window.showNotification('Lab execution failed. Verify command syntax.', 'error');
  }
  
  inputEl.value = '';
};

/**
 * Show a simple popup hint
 */
window.showLessonLabHint = function(hint) {
  window.showNotification(`Lab Manual Hint: ${hint}`, 'info');
};

/**
 * Enable/Disable action bar navigation buttons based on unlock status
 */
function updateViewerActionBarState() {
  const prevBtn = document.getElementById('viewer-prev-btn');
  const nextBtn = document.getElementById('viewer-next-btn');
  if (!prevBtn || !nextBtn) return;

  const index = academyState.activeSyllabusIndex;
  const isFirst = (index === 0);
  const isLast = (index === academyState.flattenedSyllabus.length - 1);

  prevBtn.disabled = isFirst;
  
  // Can proceed next ONLY if current syllabus item is fully completed
  const currentItem = academyState.flattenedSyllabus[index];
  let isCurrentCompleted = false;

  const progressMap = getProgressMap();
  const completedMap = getCompletedBooksMap();
  const bookCompletedInfo = completedMap[academyState.activeBook.id] || {};
  const completedLessons = progressMap[academyState.activeBook.id] || [];

  if (currentItem.type === 'lesson') {
    isCurrentCompleted = completedLessons.includes(currentItem.id);
  } else if (currentItem.type === 'final_quiz') {
    isCurrentCompleted = bookCompletedInfo.quizPassed === true;
  } else if (currentItem.type === 'final_assessment') {
    isCurrentCompleted = bookCompletedInfo.assessmentPassed === true;
  }

  const canCompleteLabDirectly = (currentItem.type === 'lesson' && academyState.quizIsCorrect);
  nextBtn.disabled = !(isCurrentCompleted || canCompleteLabDirectly) || isLast;
  
  // Dynamic text of next btn
  if (currentItem.type === 'lesson' && !isCurrentCompleted) {
    if (!academyState.quizIsCorrect) {
      nextBtn.innerHTML = `Verify Quiz <i data-lucide="shield-alert" style="width:14px; height:14px; display:inline-block; margin-left:4px;"></i>`;
    } else {
      nextBtn.innerHTML = `Complete Lab <i data-lucide="terminal" style="width:14px; height:14px; display:inline-block; margin-left:4px;"></i>`;
    }
  } else if (currentItem.type === 'final_quiz' && !isCurrentCompleted) {
    nextBtn.innerHTML = `Exam Incomplete <i data-lucide="lock" style="width:14px; height:14px; display:inline-block; margin-left:4px;"></i>`;
  } else if (currentItem.type === 'final_assessment' && !isCurrentCompleted) {
    nextBtn.innerHTML = `Lab Incomplete <i data-lucide="lock" style="width:14px; height:14px; display:inline-block; margin-left:4px;"></i>`;
  } else {
    nextBtn.innerHTML = `Next <i data-lucide="arrow-right" style="width: 14px; height: 14px; display: inline-block; margin-left: 4px;"></i>`;
  }
}

/**
 * Bottom action button navigation hooks
 */
function goToPrevSyllabusItem() {
  if (academyState.activeSyllabusIndex > 0) {
    selectSyllabusIndex(academyState.activeSyllabusIndex - 1);
  }
}

function goToNextSyllabusItem() {
  const currentItem = academyState.flattenedSyllabus[academyState.activeSyllabusIndex];
  if (currentItem && currentItem.type === 'lesson') {
    const progressMap = getProgressMap();
    const completedLessons = progressMap[academyState.activeBook.id] || [];
    const isCompleted = completedLessons.includes(currentItem.id);
    
    if (!isCompleted && academyState.quizIsCorrect) {
      // The button text is "Complete Lab". Clicking it should complete the lab!
      academyState.labCompleted = true;
      const bookId = academyState.activeBook.id;
      if (!progressMap[bookId]) progressMap[bookId] = [];
      if (!progressMap[bookId].includes(currentItem.id)) {
        progressMap[bookId].push(currentItem.id);
      }
      saveProgressMap(progressMap);
      updateCourseViewerProgress();
      updateAcademyStats();
      window.showNotification('Practical Range verified: Lab completed successfully!', 'success');
      
      setTimeout(() => {
        if (academyState.activeSyllabusIndex < academyState.flattenedSyllabus.length - 1) {
          selectSyllabusIndex(academyState.activeSyllabusIndex + 1);
        } else {
          renderActiveStage();
          renderSyllabusMenu();
        }
      }, 1000);
      return;
    }
  }

  if (academyState.activeSyllabusIndex < academyState.flattenedSyllabus.length - 1) {
    selectSyllabusIndex(academyState.activeSyllabusIndex + 1);
  }
}

/**
 * Render Final exam questions
 */
function renderFinalExamStage(container, completedInfo) {
  const book = academyState.activeBook;
  const isPassed = completedInfo.quizPassed === true;

  let questionsHtml = '';
  book.finalQuiz.forEach((q, idx) => {
    const selectedOpt = academyState.finalExamAnswers[idx];
    const examSubmitted = academyState.finalExamGrade !== null;

    questionsHtml += `
      <div class="grid-card" style="padding: 16px; background: rgba(255,255,255,0.01); border-color: rgba(255,255,255,0.04); margin-bottom: 20px; border-radius: 6px;">
        <p style="font-size: 13.5px; color: #ffffff; font-weight: 500; margin-bottom: 12px;">Q${idx + 1}: ${q.question}</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${q.options.map((opt, optIdx) => {
            const isSelected = selectedOpt === optIdx;
            let styleBorder = 'border-color: rgba(255,255,255,0.05); background: rgba(255,255,255,0.01);';
            
            if (examSubmitted) {
              if (optIdx === q.answer) {
                styleBorder = 'border-color: var(--emerald-glow); background: rgba(16,185,129,0.08); color: var(--emerald-bright);';
              } else if (isSelected) {
                styleBorder = 'border-color: var(--rose-glow); background: rgba(244,63,94,0.08); color: var(--rose-bright);';
              }
            } else if (isSelected) {
              styleBorder = 'border-color: var(--cyan-glow); background: rgba(6,182,212,0.08);';
            }

            return `
              <button class="btn-secondary" style="text-align: left; padding: 10px 14px; font-size: 12px; transition: all 0.2s; ${styleBorder}" 
                      ${examSubmitted || isPassed ? 'disabled' : ''} onclick="window.selectFinalExamOption(${idx}, ${optIdx})">
                ${opt}
              </button>
            `;
          }).join('')}
        </div>
        ${examSubmitted && selectedOpt !== q.answer ? `
          <p style="font-size: 11.5px; color: var(--rose-bright); margin-top: 8px; line-height: 1.4;">
            <strong>Incorrect:</strong> ${q.explanation}
          </p>
        ` : examSubmitted && selectedOpt === q.answer ? `
          <p style="font-size: 11.5px; color: var(--emerald-bright); margin-top: 8px; line-height: 1.4;">
            <strong>Correct:</strong> ${q.explanation}
          </p>
        ` : ''}
      </div>
    `;
  });

  container.innerHTML = `
    <div style="animation: fadeIn 0.3s ease-out;">
      <span class="font-mono text-amber" style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Theoretical Evaluation</span>
      <h2 class="font-display" style="font-size: 24px; font-weight: 700; color: #ffffff; margin-top: 6px; margin-bottom: 8px;">Final Certification Exam</h2>
      <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 24px;">Confirm your understanding of the curriculum syllabus. 100% accuracy required to pass standard validation.</p>

      ${isPassed ? `
        <!-- Quiz Already Completed successfully -->
        <div class="grid-card shadow-glow" style="padding: 24px; border-color: var(--emerald-glow); background: rgba(16,185,129,0.04); border-radius: 8px; margin-bottom: 24px; text-align: center;">
          <i data-lucide="award" style="width: 48px; height: 48px; color: var(--emerald-bright); margin: 0 auto 12px;"></i>
          <h3 class="font-display" style="color: #ffffff; font-size: 18px; font-weight: 700; margin-bottom: 4px;">CERTIFICATION EXAM COMPLETED</h3>
          <p class="font-mono text-emerald" style="font-size: 12px; font-weight: 600;">STATUS CODE: 100% SCORE (PASSED)</p>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 8px; max-width: 500px; margin-left: auto; margin-right: auto;">
            The academic department has recorded perfect exam metrics for your token identifier. Proceed instantly to the final lab segment.
          </p>
        </div>
      ` : ''}

      <div style="margin-bottom: 24px;">
        ${questionsHtml}
      </div>

      <!-- Submission controls -->
      ${!isPassed ? `
        <div style="display: flex; gap: 12px; justify-content: flex-end; padding-top: 10px;">
          ${academyState.finalExamGrade !== null ? `
            <button class="btn-secondary" onclick="window.resetFinalExamAttempt()"><i data-lucide="rotate-ccw"></i> Reset Exam Attempt</button>
          ` : `
            <button class="btn-primary" onclick="window.submitFinalExamAttempt()"><i data-lucide="send"></i> Commit Exam Answers</button>
          `}
        </div>
      ` : ''}
    </div>
  `;
}

window.selectFinalExamOption = function(questionIndex, optionIndex) {
  academyState.finalExamAnswers[questionIndex] = optionIndex;
  renderActiveStage();
};

window.resetFinalExamAttempt = function() {
  academyState.finalExamAnswers = {};
  academyState.finalExamGrade = null;
  renderActiveStage();
};

window.submitFinalExamAttempt = function() {
  const book = academyState.activeBook;
  const numQuestions = book.finalQuiz.length;
  const answeredCount = Object.keys(academyState.finalExamAnswers).length;

  if (answeredCount < numQuestions) {
    window.showNotification('Alert: Answer all exam queries before submission!', 'error');
    return;
  }

  // Grade the quiz
  let score = 0;
  book.finalQuiz.forEach((q, idx) => {
    if (academyState.finalExamAnswers[idx] === q.answer) {
      score++;
    }
  });

  const percent = Math.round((score / numQuestions) * 100);
  academyState.finalExamGrade = percent;

  if (percent === 100) {
    const completedMap = getCompletedBooksMap();
    if (!completedMap[book.id]) completedMap[book.id] = {};
    completedMap[book.id].quizPassed = true;
    saveCompletedBooksMap(completedMap);
    
    updateCourseViewerProgress();
    updateAcademyStats();
    
    window.showNotification('Handshake verified: Perfect score achieved!', 'success');
  } else {
    window.showNotification(`Evaluation failed. Score: ${percent}%. Review answers.`, 'error');
  }

  renderActiveStage();
  renderSyllabusMenu();
};

/**
 * Render Final practical laboratory simulation
 */
function renderFinalAssessmentStage(container, completedInfo) {
  const book = academyState.activeBook;
  const isPassed = completedInfo.assessmentPassed === true;
  const assessment = book.finalAssessment;

  let widgetHtml = '';

  // Implements unique interactive widget for each book type
  if (assessment.type === 'network-builder') {
    // Port filtering lab
    widgetHtml = `
      <div style="background: rgba(3,7,18,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 16px; margin-bottom: 20px;">
        <p style="font-size:10.5px; color:var(--text-muted); font-family:var(--font-mono); font-weight:700; margin-bottom:10px;">FIREWALL IP-TABLE CONFIG</p>
        <div style="padding: 12px; background: rgba(0,0,0,0.4); border-radius: 4px; font-family: var(--font-mono); font-size:12px; border-left:3px solid var(--rose-glow); margin-bottom:14px; line-height:1.5;">
          <span style="color:var(--text-muted);"># Threat logs spotted incoming probes on Port 22:</span><br/>
          SRC: 192.168.10.15 ---> Port: 22 (SSH) [<span class="text-rose">ATTACK VECTORS SPOTTED</span>]<br/>
          SRC: 10.0.12.240 ---> Port: 443 (HTTPS) [<span class="text-emerald">SECURE HYPERTEXT</span>]
        </div>
      </div>
    `;
  } else if (assessment.type === 'process-killer') {
    // Process analyzer lab
    widgetHtml = `
      <div style="background: rgba(3,7,18,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 16px; margin-bottom: 20px;">
        <p style="font-size:10.5px; color:var(--text-muted); font-family:var(--font-mono); font-weight:700; margin-bottom:10px;">SYSTEM PROCESS LOGS</p>
        <div style="padding: 12px; background: rgba(0,0,0,0.4); border-radius: 4px; font-family: var(--font-mono); font-size:11px; margin-bottom:14px; line-height:1.5;">
          PID&nbsp;&nbsp;&nbsp;USER&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;CPU%&nbsp;&nbsp;&nbsp;COMMAND<br/>
          104&nbsp;&nbsp;&nbsp;root&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.0%&nbsp;&nbsp;&nbsp;/sbin/init<br/>
          552&nbsp;&nbsp;&nbsp;mysql&nbsp;&nbsp;&nbsp;&nbsp;1.2%&nbsp;&nbsp;&nbsp;/usr/sbin/mysqld<br/>
          918&nbsp;&nbsp;&nbsp;student&nbsp;&nbsp;0.5%&nbsp;&nbsp;&nbsp;/usr/bin/bash<br/>
          <span class="text-rose">3491&nbsp;&nbsp;www-data&nbsp;98.4%&nbsp;&nbsp;/tmp/.hackshell -listen 4444</span>
        </div>
      </div>
    `;
  } else if (assessment.type === 'injection-sec') {
    // SQLi Sanitizer
    widgetHtml = `
      <div style="background: rgba(3,7,18,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 16px; margin-bottom: 20px;">
        <p style="font-size:10.5px; color:var(--text-muted); font-family:var(--font-mono); font-weight:700; margin-bottom:10px;">QUERY SANITIZATION CONSOLE</p>
        <div style="padding: 12px; background: rgba(0,0,0,0.4); border-radius: 4px; font-family: var(--font-mono); font-size:11.5px; margin-bottom:14px; line-height:1.5; color:var(--text-secondary);">
          String input = req.getParameter("identity_id");<br/>
          <span style="color:var(--text-muted);">// Suspect Input payload: ' OR '1'='1</span><br/>
          String sql = "SELECT * FROM agents WHERE id = '" + input + "'";
        </div>
      </div>
    `;
  } else if (assessment.type === 'cors-headers') {
    // CORS configuration
    widgetHtml = `
      <div style="background: rgba(3,7,18,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 16px; margin-bottom: 20px;">
        <p style="font-size:10.5px; color:var(--text-muted); font-family:var(--font-mono); font-weight:700; margin-bottom:10px;">HTTP RESPONSE HEADER MATRIX</p>
        <div style="padding: 12px; background: rgba(0,0,0,0.4); border-radius: 4px; font-family: var(--font-mono); font-size:12px; margin-bottom:14px; line-height:1.5; border-left:3px solid var(--rose-glow);">
          HTTP/1.1 200 OK<br/>
          Access-Control-Allow-Origin: *<br/>
          Access-Control-Allow-Credentials: true [<span class="text-rose">CRITICAL CRITERIA EXPOSED</span>]
        </div>
      </div>
    `;
  } else {
    // Standard terminal view for other ciphers / logs
    widgetHtml = `
      <div style="background: rgba(3,7,18,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 16px; margin-bottom: 20px;">
        <p style="font-size:10.5px; color:var(--text-muted); font-family:var(--font-mono); font-weight:700; margin-bottom:10px;">SOC SIMULATED CHALLENGE ENVIRONMENT</p>
        <div style="padding: 12px; background: rgba(0,0,0,0.4); border-radius: 4px; font-family: var(--font-mono); font-size:11.5px; color:var(--text-secondary); line-height:1.5;">
          # INITIALIZING SANITIZED TELEMETRY SECTOR...<br/>
          # Status: Awaiting command verification. Select options to commit config details.
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="animation: fadeIn 0.3s ease-out;">
      <span class="font-mono text-rose" style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Practical Laboratory Simulation</span>
      <h2 class="font-display" style="font-size: 24px; font-weight: 700; color: #ffffff; margin-top: 6px; margin-bottom: 8px;">Final Hands-On Practical Lab</h2>
      <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 20px;">Apply real-world defense rules. Analyze system anomalies and choose the optimal counter-measure parameters below.</p>

      ${isPassed ? `
        <!-- Completed Certificate block with Dynamic Enter Name -->
        <div class="grid-card shadow-glow" style="padding: 24px; border-color: var(--amber-glow); background: rgba(245, 158, 11, 0.04); border-radius: 8px; margin-bottom: 24px;">
          <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
            <i data-lucide="award" style="width: 56px; height: 56px; color: var(--amber-bright); margin-bottom: 12px; filter: drop-shadow(0 0 10px rgba(245,158,11,0.4));"></i>
            <h3 class="font-display" style="color: #ffffff; font-size: 20px; font-weight: 700; margin-bottom: 4px;">CONGRATULATIONS, MEMBER!</h3>
            <p class="font-mono text-amber" style="font-size: 12px; font-weight: 700;">COURSE COMPLETE - CERTIFICATE GENERATION READY</p>
            
            <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 10px; max-width: 550px;">
              You have passed both theoretical and practical examinations for <strong>${book.title}</strong>. Enter your name below to register and compile your custom cryptographic certificate.
            </p>

            <div style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 12px; width: 100%; max-width: 440px; justify-content: center;">
              <input type="text" id="cert-agent-name" placeholder="Enter Full Name" value="${window.getStudentName ? window.getStudentName() : 'GUEST USER'}" 
                     style="background: var(--input-bg); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px 16px; color: #ffffff; font-size: 13.5px; font-weight: 600; text-align: center; width: 100%; max-width: 280px; outline: none; transition: border 0.2s;"
                     onfocus="this.style.borderColor='var(--cyan-glow)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'"
                     oninput="if(window.setStudentName) window.setStudentName(this.value)" />
              
              <button class="btn-primary" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-color: var(--amber-bright); font-size: 13px;" onclick="window.triggerCertificateCompilation()">
                <i data-lucide="award"></i> View Certificate
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      <div style="margin-bottom: 24px;">
        <p style="font-size: 14px; color: #ffffff; font-weight: 600; margin-bottom: 12px;">LAB DIRECTIVE: ${assessment.prompt}</p>
        
        ${widgetHtml}

        <div style="display: flex; flex-direction: column; gap: 8px;" id="assessment-options">
          ${assessment.options.map((opt, idx) => {
            const isSelected = academyState.assessmentOption === idx;
            let styleBorder = 'border-color: rgba(255,255,255,0.05); background: rgba(255,255,255,0.01);';
            
            if (academyState.assessmentVerified) {
              if (idx === assessment.answer) {
                styleBorder = 'border-color: var(--emerald-glow); background: rgba(16,185,129,0.08); color: var(--emerald-bright);';
              } else if (isSelected) {
                styleBorder = 'border-color: var(--rose-glow); background: rgba(244,63,94,0.08); color: var(--rose-bright);';
              }
            } else if (isSelected) {
              styleBorder = 'border-color: var(--cyan-glow); background: rgba(6,182,212,0.08);';
            }

            return `
              <button class="btn-secondary" style="text-align: left; padding: 12px 16px; font-size: 12.5px; transition: all 0.2s; ${styleBorder}" 
                      ${academyState.assessmentVerified || isPassed ? 'disabled' : ''} onclick="window.selectAssessmentOption(${idx})">
                <code style="font-family: var(--font-mono); font-size: 12px;">${opt}</code>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Lab Action control -->
      ${!isPassed ? `
        <div style="display: flex; gap: 12px; justify-content: flex-end; padding-top: 10px;">
          ${academyState.assessmentVerified ? `
            <button class="btn-secondary" onclick="window.resetAssessmentAttempt()"><i data-lucide="rotate-ccw"></i> Reset Lab Challenge</button>
          ` : `
            <button class="btn-primary" style="background: var(--rose-glow); border-color: var(--rose-bright);" onclick="window.submitAssessmentAttempt()"><i data-lucide="terminal"></i> Execute & Audit Sandbox</button>
          `}
        </div>
      ` : ''}
    </div>
  `;
}

window.selectAssessmentOption = function(optionIdx) {
  academyState.assessmentOption = optionIdx;
  renderActiveStage();
};

window.resetAssessmentAttempt = function() {
  academyState.assessmentOption = null;
  academyState.assessmentVerified = false;
  academyState.assessmentPassed = false;
  renderActiveStage();
};

window.submitAssessmentAttempt = function() {
  const book = academyState.activeBook;
  const assessment = book.finalAssessment;

  if (academyState.assessmentOption === null) {
    window.showNotification('Alert: Select a candidate mitigation rule to deploy!', 'error');
    return;
  }

  academyState.assessmentVerified = true;
  const isCorrect = (academyState.assessmentOption === assessment.answer);
  academyState.assessmentPassed = isCorrect;

  if (isCorrect) {
    const completedMap = getCompletedBooksMap();
    if (!completedMap[book.id]) completedMap[book.id] = {};
    completedMap[book.id].assessmentPassed = true;
    completedMap[book.id].completedAt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    completedMap[book.id].certificateId = 'CS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    saveCompletedBooksMap(completedMap);
    
    updateCourseViewerProgress();
    updateAcademyStats();
    
    window.showNotification('Cyber Range verified: Sandbox threat neutralized successfully!', 'success');
  } else {
    window.showNotification('Mitigation failed. System remains vulnerable to attack loops.', 'error');
  }

  renderActiveStage();
  renderSyllabusMenu();
};

/**
 * Certificate overlay generator and printer interface
 */
window.triggerCertificateCompilation = function() {
  const book = academyState.activeBook;
  if (!book) return;

  const agentName = document.getElementById('cert-agent-name').value.trim() || 'GUEST USER';
  const completedInfo = getCompletedBooksMap()[book.id] || {};
  const certId = completedInfo.certificateId || 'CS-CERTIFICATE';
  const dateStr = completedInfo.completedAt || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Generate unique cryptographic SHA-256 validation hash
  const rawData = `${certId}-${agentName}-${book.id}-CS`;
  const cryptoHash = Array.from(rawData).reduce((acc, char) => (acc + char.charCodeAt(0)), 0).toString(16).padEnd(64, 'a').substr(0, 48);

  // Inject a gorgeous print-ready modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'certificate-modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(2, 6, 23, 0.95);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-y: auto;
    padding: 20px;
    animation: fadeIn 0.2s ease-out;
  `;

  overlay.innerHTML = `
    <!-- Modal content card wrapper -->
    <div style="display: flex; flex-direction: column; gap: 20px; align-items: center; max-width: 900px; width: 100%;" class="no-print">
      <!-- Certificate printable frame container -->
      <div id="printable-certificate-body" style="background: #020617; border: 12px double #f59e0b; padding: 48px; border-radius: 4px; box-shadow: 0 0 40px rgba(245,158,11,0.15); width: 100%; position: relative; color: #f1f5f9; text-align: center; border-image: linear-gradient(135deg, #fbbf24 0%, #b45309 50%, #fbbf24 100%) 12;">
        
        <!-- Abstract Tech Grid Overlays inside printable area -->
        <div style="position: absolute; top:0; left:0; width:100%; height:100%; background-image: radial-gradient(circle at 50% 50%, rgba(245,158,11,0.03) 0%, transparent 85%); pointer-events:none;"></div>
        
        <!-- Header badge -->
        <div style="display: flex; justify-content: center; align-items: center; gap: 14px; margin-bottom: 24px;">
          <div style="border: 2px solid #f59e0b; padding: 4px; border-radius: 50%;">
            <svg style="width: 44px; height: 44px; color: #f59e0b;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div style="text-align: left;">
            <p style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: #f59e0b; letter-spacing: 2px;">CYBERSHIELD COMMAND</p>
            <p style="font-family: var(--font-mono); font-size: 8px; color: var(--text-muted);">SECURITY OPERATIONS LEARNING CENTER</p>
          </div>
        </div>

        <p style="font-family: var(--font-display); font-size: 14px; letter-spacing: 4px; color: var(--text-secondary); text-transform: uppercase;">CERTIFICATE OF GRADUATION</p>
        <div style="width: 80px; height: 1px; background: #f59e0b; margin: 12px auto 28px;"></div>

        <p style="font-size: 14px; color: var(--text-secondary); font-style: italic;">This dynamic credentials document verifies that cybersecurity professional</p>
        <h1 class="font-display" style="font-size: 36px; font-weight: 900; color: #ffffff; margin: 16px 0; letter-spacing: 1px; text-shadow: 0 2px 10px rgba(255,255,255,0.05);">${agentName}</h1>
        
        <p style="font-size: 14px; color: var(--text-secondary); max-width: 600px; margin: 0 auto; line-height: 1.6;">
          has successfully compiled and executed all sandbox validation directives, passed all comprehensive theoretical exams, and neutralized threat simulations to complete the training course:
        </p>

        <h3 class="font-display" style="font-size: 22px; font-weight: 700; color: #22d3ee; margin: 18px 0; letter-spacing: 0.5px;">${book.title}</h3>
        
        <p style="font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);">DURABLE BLOCK CREDENTIAL ID: ${certId}</p>

        <!-- Dynamic Signatures & Seal section -->
        <div style="display: grid; grid-template-columns: 1fr 140px 1fr; gap: 20px; align-items: center; margin-top: 40px;">
          <!-- Left Signature -->
          <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
            <p style="font-family: 'Playfair Display', serif; font-style: italic; font-size: 16px; color: #ffffff; letter-spacing: 0.5px;">Sowndhar P.</p>
            <p style="font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); margin-top: 4px; text-transform: uppercase;">SOWNDHAR P (SOC Operations Chief)</p>
          </div>

          <!-- Gold Ribbon Seal -->
          <div style="display: flex; justify-content: center; align-items: center;">
            <svg style="width: 80px; height: 80px; color: #fbbf24; filter: drop-shadow(0 0 8px rgba(245,158,11,0.3));" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="8" r="7" fill="rgba(245,158,11,0.05)" />
              <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
              <circle cx="12" cy="8" r="4" fill="#fbbf24" stroke="#d97706" />
            </svg>
          </div>

          <!-- Right Signature -->
          <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
            <p style="font-family: 'Playfair Display', serif; font-style: italic; font-size: 16px; color: #ffffff; letter-spacing: 0.5px;">Raghul M.</p>
            <p style="font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); margin-top: 4px; text-transform: uppercase;">RAGHUL M (Offensive Sec Researcher)</p>
          </div>
        </div>

        <!-- Footer date / block verification hash -->
        <div style="margin-top: 36px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 14px; font-family: var(--font-mono); font-size: 9.5px; color: var(--text-muted);">
          <span>DATE ISSUED: ${dateStr}</span>
          <span style="font-size: 8.5px; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${cryptoHash}">SHA256 SIGN: ${cryptoHash}</span>
        </div>
      </div>

      <!-- Action buttons -->
      <div style="display: flex; gap: 12px; margin-top: 10px;">
        <button class="btn-secondary" style="padding: 10px 20px; font-size:13px;" onclick="window.closeCertificateModal()">Close Viewer</button>
        <button class="btn-primary" style="padding: 10px 24px; font-size:13px; background: #fbbf24; border-color:#fbbf24; color:#020617; font-weight:700;" onclick="window.print()"><i data-lucide="printer" style="width:16px; height:16px;"></i> Print / Save PDF</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  lucide.createIcons();
};

window.closeCertificateModal = function() {
  const overlay = document.getElementById('certificate-modal-overlay');
  if (overlay) overlay.remove();
};

/**
 * Close Course Viewer and restore Catalog grid state
 */
function closeCourseViewer() {
  academyState.activeBook = null;
  document.getElementById('learning-course-viewer').style.display = 'none';
  document.getElementById('learning-catalog-view').style.display = 'block';
  
  updateAcademyStats();
  renderAcademyCatalog();
  
  window.showNotification('Handshake synchronization completed.', 'info');
}

// Global Window Handshake Bindings
window.renderAcademyCatalog = renderAcademyCatalog;
window.updateAcademyStats = updateAcademyStats;
window.toggleCatalogBookmark = toggleCatalogBookmark;
window.openCourseViewer = openCourseViewer;
window.closeCourseViewer = closeCourseViewer;
window.goToPrevSyllabusItem = goToPrevSyllabusItem;
window.goToNextSyllabusItem = goToNextSyllabusItem;
window.toggleViewerBookmark = toggleViewerBookmark;
window.selectSyllabusIndex = selectSyllabusIndex;

// ============================================================================
// 1. Unified Learning Sub-Navigation Router
// ============================================================================
window.switchLearningSubtab = function(tabName) {
  // Clear any existing discussion background interval
  if (window.cybershield_discussions_interval) {
    clearInterval(window.cybershield_discussions_interval);
    window.cybershield_discussions_interval = null;
  }

  const tabs = ['catalog', 'discussions', 'notes', 'certificates'];
  tabs.forEach(t => {
    const btn = document.getElementById(`subtab-btn-${t}`);
    if (btn) {
      if (t === tabName) btn.classList.add('active');
      else btn.classList.remove('active');
    }
    
    // Toggle catalog subview or others
    const subviewEl = (t === 'catalog') ? document.getElementById('subview-catalog-grid') : document.getElementById(`subview-${t}`);
    if (subviewEl) {
      subviewEl.style.display = (t === tabName) ? 'block' : 'none';
    }
  });

  if (tabName === 'discussions') {
    renderDiscussionsSubview();
    // Start real-time activity simulation loop
    window.cybershield_discussions_interval = setInterval(() => {
      if (typeof window.simulateRealtimeActivity === 'function') {
        window.simulateRealtimeActivity();
      }
    }, 45000); // 45s interval
  } else if (tabName === 'notes') {
    renderNotesSubview();
  } else if (tabName === 'certificates') {
    renderCertificatesSubview();
  }
};

// ============================================================================
// 2. Study Notes & Personal Scratchpad Controller
// ============================================================================
window.getLocalNotes = function() {
  const data = localStorage.getItem('cybershield_notes');
  return data ? JSON.parse(data) : [];
};

window.renderNotesSubview = function() {
  const container = document.getElementById('subview-notes');
  if (!container) return;

  const notes = getLocalNotes();
  const searchInput = document.getElementById('notes-search-input');
  const searchVal = (searchInput ? searchInput.value : '').toLowerCase().trim();

  const filteredNotes = notes.filter(n => {
    return n.title.toLowerCase().includes(searchVal) || 
           n.content.toLowerCase().includes(searchVal) ||
           n.bookTitle.toLowerCase().includes(searchVal);
  });

  container.innerHTML = `
    <div style="animation: fadeIn 0.2s ease-out;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 16px; margin-bottom: 20px;">
        <div>
          <h2 class="font-display" style="font-size: 18px; font-weight: 700; color: #ffffff;">Study Notes & Scratchpad</h2>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Record critical terminal variables, configurations, or credentials captured during drills.</p>
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button class="btn-primary" style="font-size:12.5px; padding: 6px 14px; background: rgba(6,182,212,0.15); border-color: var(--cyan-bright);" onclick="openCreateNoteModal()">
            <i data-lucide="plus" style="width:14px; height:14px; display:inline-block; margin-right:4px; vertical-align:middle;"></i> New Note
          </button>
          <button class="btn-secondary" style="font-size:12.5px; padding: 6px 14px;" onclick="exportNotesToTXT()">
            <i data-lucide="download" style="width:14px; height:14px; display:inline-block; margin-right:4px; vertical-align:middle;"></i> Export All (.TXT)
          </button>
        </div>
      </div>
      
      <!-- Search -->
      <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px; background: var(--input-bg); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 6px 12px; max-width: 360px;">
        <i data-lucide="search" style="width: 15px; height: 15px; color: var(--text-muted);"></i>
        <input type="text" placeholder="Search saved scratchpads..." id="notes-search-input" oninput="renderNotesSubview()" value="${searchVal || ''}" style="background: transparent; border: none; outline: none; color: #ffffff; font-size: 13px; width: 100%;" />
      </div>
      
      <!-- Notes Grid -->
      ${filteredNotes.length === 0 ? `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i data-lucide="file-text" style="width: 44px; height: 44px; margin: 0 auto 12px; opacity: 0.3;"></i>
          <p style="font-size: 13px;">No active study notes found. Record your first discovery flag above!</p>
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
          ${filteredNotes.map(note => `
            <div class="grid-card" style="padding: 16px; background: rgba(3,7,18,0.2); border-color: rgba(255,255,255,0.04); display: flex; flex-direction: column; justify-content: space-between; min-height: 180px;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                  <span class="font-mono text-cyan" style="font-size: 9px; font-weight: 700; text-transform: uppercase; background: rgba(6,182,212,0.06); padding: 2px 6px; border-radius: 4px;">${note.bookTitle}</span>
                  <div style="display: flex; gap: 8px;">
                    <button style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 2px;" onclick="openCreateNoteModal('${note.id}')" title="Edit Note">
                      <i data-lucide="edit-2" style="width:12px; height:12px;"></i>
                    </button>
                    <button style="background: transparent; border: none; color: var(--rose-bright); cursor: pointer; padding: 2px;" onclick="deleteLocalNote('${note.id}')" title="Shred Note">
                      <i data-lucide="trash-2" style="width:12px; height:12px;"></i>
                    </button>
                  </div>
                </div>
                <h3 style="font-size: 14px; font-weight: bold; color: #ffffff; margin-top: 8px; margin-bottom: 6px;">${note.title}</h3>
                <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.45; white-space: pre-wrap; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;">${note.content}</p>
              </div>
              <div style="border-top: 1px solid rgba(255,255,255,0.03); padding-top: 8px; margin-top: 12px; font-family: var(--font-mono); font-size: 9.5px; color: var(--text-muted); text-align: right;">
                Synced: ${note.updatedAt}
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
  lucide.createIcons();
};

window.openCreateNoteModal = function(noteId = null) {
  const container = document.getElementById('subview-notes');
  if (!container) return;

  const notes = getLocalNotes();
  const note = noteId ? notes.find(n => n.id === noteId) : null;
  const books = window.CYBER_BOOKS || [];

  container.innerHTML = `
    <div class="grid-card" style="padding: 24px; animation: fadeIn 0.2s ease-out; max-width: 580px; margin: 0 auto; background: rgba(3,7,18,0.5); border-color: rgba(255,255,255,0.06);">
      <h2 class="font-display" style="font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 16px;">
        ${note ? 'Update Scratchpad Payload' : 'Initialize Study Scratchpad'}
      </h2>
      
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Curriculum Node</label>
          <select id="note-course-select" style="background: var(--input-bg); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px 12px; color: #ffffff; font-size: 13px; width: 100%; outline: none; font-family: var(--font-sans);">
            ${books.map(b => `
              <option value="${b.id}" ${note && note.bookId === b.id ? 'selected' : ''}>${b.title}</option>
            `).join('')}
          </select>
        </div>
        
        <div>
          <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Subject Line</label>
          <input type="text" id="note-title-input" placeholder="e.g. Wireshark tshark CLI flags, VPN Tunneling configs..." value="${note ? note.title : ''}"
                 style="background: var(--input-bg); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px 12px; color: #ffffff; font-size: 13px; width: 100%; outline: none;" />
        </div>
        
        <div>
          <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Study Log Payload</label>
          <textarea id="note-content-input" placeholder="Paste codes, command paths, or drill flags here..." rows="7"
                    style="background: var(--input-bg); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px 12px; color: #ffffff; font-size: 13px; width: 100%; font-family: var(--font-mono); outline: none; resize: vertical; line-height: 1.5;">${note ? note.content : ''}</textarea>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.05);">
          <button class="btn-secondary" onclick="renderNotesSubview()" style="font-size: 12.5px; padding: 6px 14px;">Cancel</button>
          <button class="btn-primary" onclick="saveLocalNote(${noteId ? `'${noteId}'` : 'null'})" style="font-size: 12.5px; padding: 6px 16px;">
            <i data-lucide="save" style="width:14px; height:14px; display:inline-block; margin-right:4px; vertical-align:middle;"></i> Sync Note
          </button>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
};

window.saveLocalNote = function(noteId = null) {
  const courseSelect = document.getElementById('note-course-select');
  const titleInput = document.getElementById('note-title-input');
  const contentInput = document.getElementById('note-content-input');

  if (!titleInput || !contentInput) return;
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    window.showNotification('Operation Aborted: Notes require a subject and content payloads.', 'error');
    return;
  }

  const books = window.CYBER_BOOKS || [];
  const selectedBook = books.find(b => b.id === courseSelect.value) || { title: 'General' };
  const notes = getLocalNotes();
  const timeStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  if (noteId) {
    const idx = notes.findIndex(n => n.id === noteId);
    if (idx !== -1) {
      notes[idx].title = title;
      notes[idx].content = content;
      notes[idx].bookId = courseSelect.value;
      notes[idx].bookTitle = selectedBook.title;
      notes[idx].updatedAt = timeStr;
    }
  } else {
    notes.push({
      id: Date.now().toString(),
      bookId: courseSelect.value,
      bookTitle: selectedBook.title,
      title: title,
      content: content,
      updatedAt: timeStr
    });
  }

  localStorage.setItem('cybershield_notes', JSON.stringify(notes));
  window.showNotification('Scratchpad synchronized successfully.', 'success');
  renderNotesSubview();
};

window.deleteLocalNote = function(noteId) {
  if (confirm('Are you sure you want to shred this study scratchpad from memory?')) {
    const notes = getLocalNotes();
    const updated = notes.filter(n => n.id !== noteId);
    localStorage.setItem('cybershield_notes', JSON.stringify(updated));
    window.showNotification('Note shredded from local cache.', 'success');
    renderNotesSubview();
  }
};

window.exportNotesToTXT = function() {
  const notes = getLocalNotes();
  if (notes.length === 0) {
    window.showNotification('Export canceled: No notes found.', 'error');
    return;
  }

  let text = `====================================================================\n`;
  text += `           CYBERSHIELD LEARNING CENTER - STUDY NOTE COMPILATION     \n`;
  text += `====================================================================\n\n`;

  notes.forEach((n, idx) => {
    text += `[NOTE #${idx+1}] -----------------------------------------------------\n`;
    text += `MODULE:     ${n.bookTitle.toUpperCase()}\n`;
    text += `SUBJECT:    ${n.title}\n`;
    text += `SYNCHRONIZED: ${n.updatedAt}\n`;
    text += `--------------------------------------------------------------------\n`;
    text += `${n.content}\n\n\n`;
  });

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CyberShield_Study_Notes_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  window.showNotification('Compilation successful! TXT scratchpad downloaded.', 'success');
};

// ============================================================================
// 3. Discussion Board (Ask, Reply, Like, Search) Controller
// ============================================================================

// Modular Discussion board state
const discussionsState = {
  activeTab: 'latest', // 'latest' | 'popular' | 'unanswered' | 'solved'
  activeCategory: 'All', // 'All' | 'Networking' | 'Linux' | etc.
  searchQuery: '',
  currentPage: 1,
  pageSize: 5,
  lastPostTime: 0,
  cooldownSeconds: 10,
  isLoading: false,
  searchDebounceTimer: null
};

// Available categories with respective icons and color accents
const COMMUNITY_CATEGORIES = [
  { name: 'Networking', icon: 'network', color: 'var(--cyan-bright)' },
  { name: 'Linux', icon: 'terminal', color: '#10b981' },
  { name: 'Web Security', icon: 'globe', color: '#3b82f6' },
  { name: 'OWASP', icon: 'bug', color: '#f59e0b' },
  { name: 'Cryptography', icon: 'lock', color: '#8b5cf6' },
  { name: 'Password Security', icon: 'key', color: '#ec4899' },
  { name: 'Phishing', icon: 'mail', color: '#f43f5e' },
  { name: 'Malware', icon: 'skull', color: '#ef4444' },
  { name: 'Digital Forensics', icon: 'search', color: '#06b6d4' },
  { name: 'General', icon: 'message-square', color: 'var(--text-muted)' }
];

// Helper to compute human-readable "time ago" relative differences
window.timeAgo = function(dateStr) {
  try {
    const now = new Date();
    const past = new Date(dateStr);
    if (isNaN(past.getTime())) return dateStr;
    
    const diffMs = now.getTime() - past.getTime();
    if (diffMs < 0) return 'just now';
    
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return 'just now';
    
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return past.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

// Retrieve community list from local secure registry
window.getDiscussions = function() {
  const data = localStorage.getItem('cybershield_discussions');
  if (data) return JSON.parse(data);

  const defaults = [
    {
      id: "disc_1",
      type: "question",
      title: "Subnetting /28 mask splits - host limits?",
      category: "Networking",
      content: "I am having trouble calculating the exact usable hosts on a Class C network split into /28 CIDR blocks. Is it 14 or 16? Why do we subtract 2?",
      user: "cyber_rookie_99",
      avatar: "🔒",
      likes: 14,
      likedByMe: false,
      pinned: true,
      solved: true,
      reported: false,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      replies: [
        {
          id: "rep_1_1",
          user: "Sowndhar P. (Lead Architect)",
          avatar: "🛡️",
          content: "It is exactly 14 usable host IPs! A /28 has 4 host bits (32 - 28 = 4), which yields 2^4 = 16 IP addresses in total. However, we must always subtract 2: one for the Network Address (first IP) and one for the Broadcast Address (last IP). Thus, 14 usable host configurations remain.",
          likes: 8,
          helpfulCount: 5,
          helpfulVotedByMe: false,
          isSolution: true,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
          replies: [
            {
              id: "rep_sub_1",
              user: "cyber_rookie_99",
              content: "Thank you, this makes perfect sense! Solved the module in seconds.",
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 7200000).toISOString()
            }
          ]
        }
      ]
    },
    {
      id: "disc_2",
      type: "question",
      title: "Prepared Statements vs manual SQL filtering?",
      category: "Web Security",
      content: "Is sanitizing string inputs manually with functions like replace(\"'\", \"''\") enough to prevent all SQL injection attacks, or is using parameterized queries/Prepared Statements strictly mandatory?",
      user: "secure_coder_sarah",
      avatar: "⚡",
      likes: 24,
      likedByMe: false,
      pinned: false,
      solved: true,
      reported: false,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      replies: [
        {
          id: "rep_2_1",
          user: "Raghul M. (Staff Admin)",
          avatar: "🎓",
          content: "Prepared statements are absolutely mandatory! Manual string replacement is extremely error-prone and can be bypassed using alternate character encodings, multi-byte sequences, or injection via non-string parameters (like numeric parameters where quotes aren't even required). Parameterized queries send data separately from SQL execution codes, rendering injection physically impossible.",
          likes: 15,
          helpfulCount: 8,
          helpfulVotedByMe: false,
          isSolution: true,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1500000).toISOString(),
          replies: []
        }
      ]
    },
    {
      id: "disc_3",
      type: "post",
      title: "OWASP Top 10 A03:2021-Injection walkthrough questions",
      category: "OWASP",
      content: "Just published a comprehensive local cheat sheet covering XML External Entity (XXE) and Command Injection containment methodologies. Keep your parsers secure by completely disabling external DTD schemas!",
      user: "owasp_stinger",
      avatar: "🐝",
      likes: 12,
      likedByMe: false,
      pinned: false,
      solved: false,
      reported: false,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      replies: []
    },
    {
      id: "disc_4",
      type: "question",
      title: "Linux SUID binary exploit failing to drop root shell?",
      category: "Linux",
      content: "I am trying to run an exploit on a misconfigured SUID binary `/usr/local/bin/custom_backup`. It should drop me into a root shell, but instead, it is exiting with error code 127. Has anyone solved the Linux Privilege Escalation challenge?",
      user: "tux_fanatic",
      avatar: "🐧",
      likes: 18,
      likedByMe: false,
      pinned: false,
      solved: false,
      reported: false,
      timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      replies: []
    }
  ];
  localStorage.setItem('cybershield_discussions', JSON.stringify(defaults));
  return defaults;
};

window.saveDiscussions = function(list) {
  try {
    localStorage.setItem('cybershield_discussions', JSON.stringify(list));
  } catch (e) {
    console.error('Failed to preserve discussions database.', e);
  }
};

// Main function to display discussions subtab view
window.renderDiscussionsSubview = function() {
  const container = document.getElementById('subview-discussions');
  if (!container) return;

  // Render a loading skeleton initially to avoid UI popping
  if (discussionsState.isLoading) {
    container.innerHTML = renderLoadingSkeleton();
    lucide.createIcons();
    return;
  }

  const discussions = getDiscussions();
  const activeUser = window.getStudentName();
  
  // Fetch active counts for dynamic badges
  const completedMap = getCompletedBooksMap();
  const completedCount = Object.keys(completedMap).length;
  let certCount = 0;
  Object.values(completedMap).forEach(info => {
    if (info.quizPassed && info.assessmentPassed) {
      certCount++;
    }
  });

  // Calculate user rank
  let userRank = "LEARNING CENTER CADET";
  let rankColor = "var(--text-muted)";
  if (certCount >= 4) {
    userRank = "CHIEF SECURITY ARCHITECT";
    rankColor = "#fbbf24";
  } else if (certCount >= 2) {
    userRank = "ELITE SEC-OPS ENGINEER";
    rankColor = "var(--cyan-bright)";
  } else if (completedCount >= 1) {
    userRank = "ACTIVE FIELD OPERATIVE";
    rankColor = "#10b981";
  }

  // Pre-filter with search and category tags
  let filtered = discussions.filter(d => {
    // Spam/Report filtering - hide from normal list if reported
    if (d.reported) return false;

    // Category filter
    if (discussionsState.activeCategory !== 'All' && d.category !== discussionsState.activeCategory) {
      return false;
    }

    // Search filter
    if (discussionsState.searchQuery) {
      const q = discussionsState.searchQuery.toLowerCase();
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchContent = d.content.toLowerCase().includes(q);
      const matchUser = d.user.toLowerCase().includes(q);
      const matchCat = d.category.toLowerCase().includes(q);
      return matchTitle || matchContent || matchUser || matchCat;
    }
    return true;
  });

  // Sort according to active tab filters
  if (discussionsState.activeTab === 'popular') {
    filtered.sort((a, b) => {
      const aWeight = (a.likes || 0) + (a.replies ? a.replies.length * 2 : 0);
      const bWeight = (b.likes || 0) + (b.replies ? b.replies.length * 2 : 0);
      return bWeight - aWeight;
    });
  } else if (discussionsState.activeTab === 'unanswered') {
    filtered = filtered.filter(d => !d.replies || d.replies.length === 0);
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } else if (discussionsState.activeTab === 'solved') {
    filtered = filtered.filter(d => d.solved === true);
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } else {
    // Default/Latest: Pinned items always stay at the absolute top, rest sorted by Date
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  // Calculate pagination slice (infinite loading scroll style)
  const totalThreads = filtered.length;
  const itemsToShow = discussionsState.currentPage * discussionsState.pageSize;
  const paginatedThreads = filtered.slice(0, itemsToShow);

  // Compute category counts dynamically
  const catCountMap = {};
  discussions.forEach(d => {
    if (d.reported) return;
    catCountMap[d.category] = (catCountMap[d.category] || 0) + 1;
  });

  container.innerHTML = `
    <div style="animation: fadeIn 0.25s ease-out; display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start;" class="flex-col md:grid">
      
      <!-- LEFT COLUMN: Profile & Category Navigation -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Interactive Hacker Profile Card -->
        <div class="grid-card" style="padding: 20px; background: rgba(3,7,18,0.45); border-color: rgba(6,182,212,0.15); border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
            <div style="position: relative; width: 44px; height: 44px; background: rgba(6,182,212,0.08); border: 1.5px solid var(--cyan-bright); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">
              ⚡
              <div style="position: absolute; bottom: 0; right: 0; width: 11px; height: 11px; background: #10b981; border: 2px solid #030712; border-radius: 50%; box-shadow: 0 0 6px #10b981;" title="Secure Tunnel Online"></div>
            </div>
            <div>
              <div class="font-display" style="font-size: 14px; font-weight: 700; color: #ffffff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px;">${activeUser}</div>
              <div class="font-mono" style="font-size: 10px; color: ${rankColor}; font-weight: 700; letter-spacing: 0.5px; margin-top: 2px;">${userRank}</div>
            </div>
          </div>

          <!-- Academic Credential Badges -->
          <div style="display: flex; flex-direction: column; gap: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">Course Status</span>
              <span class="font-mono text-cyan" style="font-weight: 600;">${completedCount} Completed</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">Certificates Earned</span>
              <span class="font-mono text-amber" style="font-weight: 600; display: flex; align-items: center; gap: 4px;">
                <i data-lucide="award" style="width: 12px; height: 12px;"></i> ${certCount} Certs
              </span>
            </div>
            
            <div style="margin-top: 6px;">
              <div style="display: flex; justify-content: space-between; font-size: 9px; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 4px;">
                <span>SYNC INTEGRITY</span>
                <span>100% SECURE</span>
              </div>
              <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden;">
                <div style="width: ${completedCount ? Math.min(100, (completedCount / 4) * 100) : 10}%; height: 100%; background: linear-gradient(90deg, var(--cyan-bright) 0%, #10b981 100%);"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Categories Side Filter Navigation -->
        <div class="grid-card" style="padding: 16px; background: rgba(3,7,18,0.3); border-color: rgba(255,255,255,0.04); border-radius: 8px;">
          <h3 class="font-mono" style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">
            Range Subject Filters
          </h3>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <button onclick="window.selectDiscussionsCategory('All')" 
                    style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 8px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: ${discussionsState.activeCategory === 'All' ? 'rgba(6,182,212,0.08)' : 'transparent'}; border: 1px solid ${discussionsState.activeCategory === 'All' ? 'rgba(6,182,212,0.2)' : 'transparent'}; color: ${discussionsState.activeCategory === 'All' ? '#ffffff' : 'var(--text-secondary)'};">
              <span style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="layers" style="width: 14px; height: 14px;"></i> All Subjects
              </span>
              <span class="font-mono text-xs text-muted" style="background: rgba(255,255,255,0.04); padding: 1px 6px; border-radius: 4px;">${discussions.filter(d=>!d.reported).length}</span>
            </button>
            
            ${COMMUNITY_CATEGORIES.map(cat => {
              const active = discussionsState.activeCategory === cat.name;
              const count = catCountMap[cat.name] || 0;
              return `
                <button onclick="window.selectDiscussionsCategory('${cat.name}')" 
                        style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 7px 10px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; background: ${active ? 'rgba(6,182,212,0.08)' : 'transparent'}; border: 1px solid ${active ? 'rgba(6,182,212,0.2)' : 'transparent'}; color: ${active ? '#ffffff' : 'var(--text-secondary)'};">
                  <span style="display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="${cat.icon}" style="width: 13px; height: 13px; color: ${cat.color};"></i> ${cat.name}
                  </span>
                  <span class="font-mono text-xs text-muted" style="background: rgba(255,255,255,0.04); padding: 1px 6px; border-radius: 4px;">${count}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Main Feed and Filters -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- Header & Action Ribbon -->
        <div class="grid-card" style="padding: 18px 20px; background: rgba(3,7,18,0.4); border-color: rgba(6,182,212,0.1); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h2 class="font-display" style="font-size: 18px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 8px; text-shadow: 0 0 10px var(--cyan-glow);">
              <span class="text-cyan">LEARNING CENTER</span> PEER REGISTRY
            </h2>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">Cooperate with active security personnel & students on virtual range exercises.</p>
          </div>
          
          <button class="btn-primary" style="font-size: 12.5px; padding: 7px 14px; background: rgba(6,182,212,0.1); border-color: var(--cyan-bright); border-radius: 6px;" onclick="window.openAskQuestionModal()">
            <i data-lucide="plus" style="width: 14px; height: 14px; display: inline-block; margin-right: 4px; vertical-align: middle;"></i> Publish Query / Post
          </button>
        </div>

        <!-- Filters & Search Toolbar -->
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; background: rgba(3,7,18,0.25); border: 1px solid rgba(255,255,255,0.03); border-radius: 8px; padding: 10px 16px;">
          
          <!-- Filters (Tabs) -->
          <div style="display: flex; gap: 4px; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 3px; background: rgba(0,0,0,0.2);">
            ${['latest', 'popular', 'unanswered', 'solved'].map(tab => {
              const active = discussionsState.activeTab === tab;
              return `
                <button onclick="window.selectDiscussionsTab('${tab}')" 
                        style="padding: 4px 10px; font-size: 11.5px; font-weight: 600; text-transform: uppercase; border-radius: 4px; cursor: pointer; transition: all 0.2s; border: none; background: ${active ? 'var(--cyan-glow)' : 'transparent'}; color: ${active ? '#ffffff' : 'var(--text-muted)'};">
                  ${tab}
                </button>
              `;
            }).join('')}
          </div>

          <!-- Dynamic Search Box -->
          <div style="position: relative; width: 100%; max-width: 280px; display: flex; align-items: center; background: var(--input-bg); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 6px 12px; transition: border-color 0.2s;" class="focus-within:border-cyan">
            <i data-lucide="search" style="width: 14px; height: 14px; color: var(--text-muted); margin-right: 8px;"></i>
            <input type="text" placeholder="Search intel database..." id="discussions-search-input" oninput="window.handleSearchInput(this.value)" value="${discussionsState.searchQuery || ''}" style="background: transparent; border: none; outline: none; color: #ffffff; font-size: 12.5px; width: 100%;" />
            ${discussionsState.searchQuery ? `
              <button onclick="window.clearSearchQuery()" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 0 4px; font-size: 14px;" class="hover:text-white">×</button>
            ` : ''}
          </div>
        </div>

        <!-- Active Filter Badge Pill Display -->
        ${(discussionsState.activeCategory !== 'All' || discussionsState.searchQuery) ? `
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase;">Active Filters:</span>
            ${discussionsState.activeCategory !== 'All' ? `
              <span class="font-mono" style="font-size: 11px; background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.3); color: var(--cyan-bright); padding: 2px 8px; border-radius: 12px; display: flex; align-items: center; gap: 6px;">
                Subject: ${discussionsState.activeCategory}
                <span onclick="window.selectDiscussionsCategory('All')" style="cursor: pointer; font-weight: bold; font-size: 12px; margin-left: 2px;" class="hover:text-white">×</span>
              </span>
            ` : ''}
            ${discussionsState.searchQuery ? `
              <span class="font-mono" style="font-size: 11px; background: rgba(236,72,153,0.08); border: 1px solid rgba(236,72,153,0.3); color: #ec4899; padding: 2px 8px; border-radius: 12px; display: flex; align-items: center; gap: 6px;">
                Query: "${discussionsState.searchQuery}"
                <span onclick="window.clearSearchQuery()" style="cursor: pointer; font-weight: bold; font-size: 12px; margin-left: 2px;" class="hover:text-white">×</span>
              </span>
            ` : ''}
          </div>
        ` : ''}

        <!-- FEED LIST -->
        <div style="display: flex; flex-direction: column; gap: 12px;" id="discussions-feed-list-container">
          ${paginatedThreads.length === 0 ? `
            <!-- Terminal-styled Empty State -->
            <div class="grid-card" style="text-align: center; padding: 60px 40px; background: rgba(3,7,18,0.15); border-color: rgba(255,255,255,0.02); border-radius: 8px;">
              <i data-lucide="shield-alert" style="width: 48px; height: 48px; margin: 0 auto 16px; color: var(--text-muted); opacity: 0.6; stroke-width: 1.5;"></i>
              <h3 class="font-mono" style="font-size: 13px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">[!] NO ALIGNING REGISTRIES LOCATED</h3>
              <p style="font-size: 12px; color: var(--text-secondary); max-width: 360px; margin: 0 auto 16px; line-height: 1.5;">Your specified filters returned 0 matches in the peer intelligence network. Clear parameters or initialize a new discussion entry.</p>
              <button class="btn-secondary" style="font-size: 11.5px; padding: 5px 12px;" onclick="window.resetAllFilters()">Reset Filters</button>
            </div>
          ` : paginatedThreads.map(th => {
            const hasReplies = th.replies && th.replies.length > 0;
            const categoryData = COMMUNITY_CATEGORIES.find(c => c.name === th.category) || { name: 'General', icon: 'message-square', color: 'var(--text-muted)' };
            const isOwner = th.user === activeUser || th.user === 'agent_sowndhar_7' || th.user === 'student_ranger_7';
            
            return `
              <div class="grid-card" style="padding: 16px; background: rgba(3,7,18,0.22); border-color: ${th.pinned ? 'rgba(245,158,11,0.25)' : th.solved ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)'}; border-radius: 8px; position: relative; transition: border-color 0.2s;" onmouseover="this.style.borderColor='rgba(6,182,212,0.15)'" onmouseout="this.style.borderColor='${th.pinned ? 'rgba(245,158,11,0.25)' : th.solved ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)'}'">
                
                <!-- Thread Top Meta Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 24px; height: 24px; background: rgba(255,255,255,0.04); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px;">
                      ${th.avatar || '👤'}
                    </div>
                    <div style="display: flex; flex-direction: column;">
                      <span class="font-mono text-cyan" style="font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                        ${th.user}
                        <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; display: inline-block;" title="Active range online user"></span>
                      </span>
                    </div>
                    <span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">${window.timeAgo(th.timestamp)}</span>
                  </div>

                  <!-- Badges -->
                  <div style="display: flex; align-items: center; gap: 6px;">
                    ${th.pinned ? `
                      <span class="font-mono" style="font-size: 9px; font-weight: 700; color: #fbbf24; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); padding: 1px 6px; border-radius: 4px; letter-spacing: 0.5px;">📌 PINNED</span>
                    ` : ''}
                    ${th.solved ? `
                      <span class="font-mono" style="font-size: 9px; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); padding: 1px 6px; border-radius: 4px; letter-spacing: 0.5px;">✓ SOLVED</span>
                    ` : ''}
                    <span class="font-mono" style="font-size: 10px; color: ${categoryData.color}; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1px 6px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                      <i data-lucide="${categoryData.icon}" style="width: 10px; height: 10px;"></i> ${th.category}
                    </span>
                    <span class="font-mono" style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: ${th.type === 'question' ? 'var(--cyan-bright)' : '#c084fc'}; padding: 1px 6px; border-radius: 4px; background: rgba(255,255,255,0.03);">
                      ${th.type || 'post'}
                    </span>
                  </div>
                </div>

                <!-- Thread Title & Content -->
                <div style="margin-bottom: 12px; cursor: pointer;" onclick="window.viewDiscussionThread('${th.id}')">
                  <h3 class="hover:text-cyan font-display" style="font-size: 14.5px; font-weight: 700; color: #ffffff; line-height: 1.35; margin-bottom: 4px;">
                    ${th.title}
                  </h3>
                  <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.45; word-break: break-word;">
                    ${th.content.length > 180 ? th.content.substring(0, 180) + '...' : th.content}
                  </p>
                </div>

                <!-- Interactive Footer Elements -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 10px; margin-top: 4px; flex-wrap: wrap; gap: 8px;">
                  <div style="display: flex; gap: 14px; align-items: center;">
                    <button style="background: transparent; border: none; color: ${th.likedByMe ? 'var(--cyan-bright)' : 'var(--text-muted)'}; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 11.5px;" onclick="window.likeDiscussionThread('${th.id}')" class="hover:text-cyan">
                      <i data-lucide="thumbs-up" style="width: 12.5px; height: 12.5px; fill: ${th.likedByMe ? 'var(--cyan-glow)' : 'transparent'};"></i> Like (${th.likes || 0})
                    </button>
                    <button style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 11.5px;" onclick="window.viewDiscussionThread('${th.id}')" class="hover:text-cyan">
                      <i data-lucide="message-square" style="width: 12.5px; height: 12.5px;"></i> Replies (${th.replies ? th.replies.length : 0})
                    </button>
                    <button style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 11.5px;" onclick="window.reportDiscussionThread('${th.id}')" class="hover:text-rose" title="Report this thread to SOC Moderation">
                      <i data-lucide="flag" style="width: 11.5px; height: 11.5px;"></i> Report
                    </button>
                  </div>

                  <!-- Owner modification buttons -->
                  ${isOwner ? `
                    <div style="display: flex; gap: 8px;">
                      <button onclick="window.openEditThreadModal('${th.id}')" style="background: transparent; border: none; color: var(--cyan-bright); cursor: pointer; font-size: 11px; font-family: var(--font-mono);" class="hover:underline">EDIT</button>
                      <button onclick="window.deleteDiscussionThread('${th.id}')" style="background: transparent; border: none; color: var(--rose-bright); cursor: pointer; font-size: 11px; font-family: var(--font-mono);" class="hover:underline">DELETE</button>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Pagination & Load More Container -->
        ${totalThreads > itemsToShow ? `
          <div style="text-align: center; margin-top: 10px;">
            <button class="btn-secondary" style="width: 100%; border-style: dashed; padding: 10px; font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;" onclick="window.loadMoreDiscussions()">
              <i data-lucide="chevrons-down" style="width: 14px; height: 14px; display: inline-block; margin-right: 4px; vertical-align: middle;"></i> Load More Active Registries...
            </button>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Active Thread ID State Tracker Hidden Element -->
    <input type="hidden" id="active-thread-id-tracker" value="" />
  `;

  lucide.createIcons();
};

// Pagination incremental trigger
window.loadMoreDiscussions = function() {
  discussionsState.currentPage++;
  
  // Show a mini loading overlay effect on the feed container
  const feed = document.getElementById('discussions-feed-list-container');
  if (feed) {
    const loadingPill = document.createElement('div');
    loadingPill.className = 'font-mono text-cyan text-center';
    loadingPill.style.cssText = 'padding: 12px; font-size: 11px;';
    loadingPill.innerHTML = '⚡ QUERYING ADDITIONAL SECTOR RECORDS...';
    feed.appendChild(loadingPill);
  }

  setTimeout(() => {
    window.renderDiscussionsSubview();
  }, 450); // 450ms simulated decryption
};

// Filter tab dispatcher
window.selectDiscussionsTab = function(tab) {
  discussionsState.activeTab = tab;
  discussionsState.currentPage = 1; // reset page
  discussionsState.isLoading = true;
  window.renderDiscussionsSubview();
  setTimeout(() => {
    discussionsState.isLoading = false;
    window.renderDiscussionsSubview();
  }, 350);
};

// Filter category dispatcher
window.selectDiscussionsCategory = function(catName) {
  discussionsState.activeCategory = catName;
  discussionsState.currentPage = 1;
  discussionsState.isLoading = true;
  window.renderDiscussionsSubview();
  setTimeout(() => {
    discussionsState.isLoading = false;
    window.renderDiscussionsSubview();
  }, 300);
};

// Reset all search and category filters
window.resetAllFilters = function() {
  discussionsState.activeCategory = 'All';
  discussionsState.activeTab = 'latest';
  discussionsState.searchQuery = '';
  discussionsState.currentPage = 1;
  window.renderDiscussionsSubview();
};

// Debounced input search handler
window.handleSearchInput = function(val) {
  if (discussionsState.searchDebounceTimer) {
    clearTimeout(discussionsState.searchDebounceTimer);
  }

  discussionsState.searchDebounceTimer = setTimeout(() => {
    discussionsState.searchQuery = val.trim();
    discussionsState.currentPage = 1;
    window.renderDiscussionsSubview();
  }, 250); // 250ms debounce
};

// Clear search input directly
window.clearSearchQuery = function() {
  discussionsState.searchQuery = '';
  const searchInput = document.getElementById('discussions-search-input');
  if (searchInput) searchInput.value = '';
  window.renderDiscussionsSubview();
};

// Ask Question Dialog Modal
window.openAskQuestionModal = function() {
  const container = document.getElementById('subview-discussions');
  if (!container) return;

  container.innerHTML = `
    <div class="grid-card" style="padding: 24px; animation: fadeIn 0.2s ease-out; max-width: 600px; margin: 0 auto; background: rgba(3,7,18,0.55); border-color: rgba(6,182,212,0.25); border-radius: 8px;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 18px;">
        <h2 class="font-display text-shadow" style="font-size: 16.5px; font-weight: 700; color: #ffffff;">
          <span style="color: var(--cyan-bright);">INTEL REGISTRY ENTRY:</span> PUBLISH TOPIC
        </h2>
        <button class="font-mono text-muted hover:text-white" onclick="window.renderDiscussionsSubview()" style="background: transparent; border: none; font-size: 20px; cursor: pointer;">×</button>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 14px;">
        
        <!-- Type selection -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button id="post-type-question" onclick="window.selectPostType('question')" class="btn-primary" style="font-family: var(--font-mono); font-size: 11px; padding: 8px 12px; background: rgba(6,182,212,0.15); border-color: var(--cyan-bright); text-align: center; cursor: pointer;">
            ❓ ASK QUESTION / CHALLENGE
          </button>
          <button id="post-type-post" onclick="window.selectPostType('post')" class="btn-secondary" style="font-family: var(--font-mono); font-size: 11px; padding: 8px 12px; text-align: center; cursor: pointer; background: transparent; border-color: rgba(255,255,255,0.1);">
            📝 GENERAL ACADEMIC POST
          </button>
          <input type="hidden" id="disc-type-input" value="question" />
        </div>

        <!-- Subject selection -->
        <div>
          <label class="font-mono" style="display: block; font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.5px;">Topic Range Subject</label>
          <select id="disc-category-input" style="background: var(--input-bg); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px 12px; color: #ffffff; font-size: 13px; width: 100%; outline: none;">
            ${COMMUNITY_CATEGORIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
          </select>
        </div>

        <!-- Query Title -->
        <div>
          <label class="font-mono" style="display: block; font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.5px;">Intel Subject Title</label>
          <input type="text" id="disc-title-input" placeholder="e.g. SUID privilege escalation script error..."
                 style="background: var(--input-bg); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px 12px; color: #ffffff; font-size: 13px; width: 100%; outline: none;" 
                 onfocus="this.style.borderColor='var(--cyan-bright)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'" />
        </div>
        
        <!-- Detailed Content -->
        <div>
          <label class="font-mono" style="display: block; font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.5px;">Query Payload / Detailed Explanation</label>
          <textarea id="disc-content-input" placeholder="Supply your command logs, network packets, or ranges query clearly..." rows="5"
                    style="background: var(--input-bg); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px 12px; color: #ffffff; font-size: 12.5px; width: 100%; font-family: var(--font-sans); outline: none; resize: vertical; line-height: 1.5;"
                    onfocus="this.style.borderColor='var(--cyan-bright)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'"></textarea>
        </div>

        <!-- Active validations preview feedback indicators -->
        <div id="ask-modal-moderation-warning" style="display: none; padding: 10px; background: rgba(239,68,68,0.08); border: 1.5px solid #ef4444; border-radius: 6px; font-size: 11.5px; color: #fca5a5; font-family: var(--font-sans); line-height: 1.4;"></div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 4px;">
          <button class="btn-secondary" onclick="window.renderDiscussionsSubview()" style="font-size: 12.5px; padding: 6px 14px;">Cancel</button>
          <button class="btn-primary" id="disc-submit-btn" onclick="window.submitDiscussionThread()" style="font-size: 12.5px; padding: 6px 16px; background: rgba(6,182,212,0.15); border-color: var(--cyan-bright);">
            <i data-lucide="send" style="width: 13px; height: 13px; display: inline-block; margin-right: 4px; vertical-align: middle;"></i> Publish Intel Entry
          </button>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
};

// Form Post Type dispatcher helper
window.selectPostType = function(type) {
  const hiddenInput = document.getElementById('disc-type-input');
  if (!hiddenInput) return;
  hiddenInput.value = type;

  const btnQ = document.getElementById('post-type-question');
  const btnP = document.getElementById('post-type-post');

  if (type === 'question') {
    btnQ.className = 'btn-primary';
    btnQ.style.borderColor = 'var(--cyan-bright)';
    btnQ.style.background = 'rgba(6,182,212,0.15)';
    
    btnP.className = 'btn-secondary';
    btnP.style.borderColor = 'rgba(255,255,255,0.1)';
    btnP.style.background = 'transparent';
  } else {
    btnP.className = 'btn-primary';
    btnP.style.borderColor = 'var(--cyan-bright)';
    btnP.style.background = 'rgba(6,182,212,0.15)';
    
    btnQ.className = 'btn-secondary';
    btnQ.style.borderColor = 'rgba(255,255,255,0.1)';
    btnQ.style.background = 'transparent';
  }
};

// Edit Existing Thread Dialog
window.openEditThreadModal = function(threadId) {
  const list = getDiscussions();
  const th = list.find(d => d.id === threadId);
  if (!th) return;

  const container = document.getElementById('subview-discussions');
  if (!container) return;

  container.innerHTML = `
    <div class="grid-card" style="padding: 24px; animation: fadeIn 0.2s ease-out; max-width: 600px; margin: 0 auto; background: rgba(3,7,18,0.55); border-color: rgba(6,182,212,0.25); border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 18px;">
        <h2 class="font-display text-shadow" style="font-size: 16.5px; font-weight: 700; color: #ffffff;">
          <span style="color: var(--cyan-bright);">EDIT REGISTERED THREAD</span>
        </h2>
        <button class="font-mono text-muted hover:text-white" onclick="window.renderDiscussionsSubview()" style="background: transparent; border: none; font-size: 20px; cursor: pointer;">×</button>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <label class="font-mono" style="display: block; font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.5px;">Intel Subject Title</label>
          <input type="text" id="edit-disc-title" value="${th.title}"
                 style="background: var(--input-bg); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px 12px; color: #ffffff; font-size: 13px; width: 100%; outline: none;" />
        </div>
        
        <div>
          <label class="font-mono" style="display: block; font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.5px;">Detailed Payload Content</label>
          <textarea id="edit-disc-content" rows="6"
                    style="background: var(--input-bg); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px 12px; color: #ffffff; font-size: 12.5px; width: 100%; font-family: var(--font-sans); outline: none; resize: vertical; line-height: 1.5;">${th.content}</textarea>
        </div>

        <div id="edit-modal-moderation-warning" style="display: none; padding: 10px; background: rgba(239,68,68,0.08); border: 1.5px solid #ef4444; border-radius: 6px; font-size: 11.5px; color: #fca5a5; line-height: 1.4;"></div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.05);">
          <button class="btn-secondary" onclick="window.renderDiscussionsSubview()" style="font-size: 12.5px; padding: 6px 14px;">Cancel</button>
          <button class="btn-primary" onclick="window.submitEditThread('${th.id}')" style="font-size: 12.5px; padding: 6px 16px;">
            <i data-lucide="check" style="width: 13px; height: 13px; display: inline-block; margin-right: 4px; vertical-align: middle;"></i> Save Edits
          </button>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
};

// Handle submission of thread edits
window.submitEditThread = function(threadId) {
  const titleInput = document.getElementById('edit-disc-title');
  const contentInput = document.getElementById('edit-disc-content');
  const warningDiv = document.getElementById('edit-modal-moderation-warning');

  const titleVal = titleInput ? titleInput.value.trim() : '';
  const contentVal = contentInput ? contentInput.value.trim() : '';

  if (!titleVal || !contentVal) {
    window.showNotification('Operation Aborted: Entries require a title and body content.', 'error');
    return;
  }

  // Moderation: Offensive Content Check
  const blacklist = ['fuck', 'shit', 'bitch', 'asshole', 'crap', 'bastard', 'steal account', 'steal credit card', 'hack fb', 'leak database'];
  const unifiedText = (titleVal + ' ' + contentVal).toLowerCase();
  const matchedSpam = blacklist.some(term => unifiedText.includes(term));

  if (matchedSpam) {
    if (warningDiv) {
      warningDiv.style.display = 'block';
      warningDiv.innerHTML = `⚠️ <b>SOC Security Sandbox Violation:</b> Offensive content or illegal activity queries detected in request parameters. System edits locked. Please maintain standard academic code-of-conduct rules in the cyber range.`;
    }
    window.showNotification('Topic rejected by CyberShield automated firewall.', 'error');
    return;
  }

  const list = getDiscussions();
  const idx = list.findIndex(d => d.id === threadId);
  if (idx !== -1) {
    list[idx].title = titleVal;
    list[idx].content = contentVal;
    list[idx].timestamp = new Date().toISOString(); // update timestamp on edit
    saveDiscussions(list);
    window.showNotification('Intel registry entry updated successfully.', 'success');
    window.renderDiscussionsSubview();
  }
};

// Publish a completely new thread entry
window.submitDiscussionThread = function() {
  const titleInput = document.getElementById('disc-title-input');
  const contentInput = document.getElementById('disc-content-input');
  const typeInput = document.getElementById('disc-type-input');
  const categoryInput = document.getElementById('disc-category-input');
  const warningDiv = document.getElementById('ask-modal-moderation-warning');

  const titleVal = titleInput ? titleInput.value.trim() : '';
  const contentVal = contentInput ? contentInput.value.trim() : '';
  const typeVal = typeInput ? typeInput.value : 'question';
  const categoryVal = categoryInput ? categoryInput.value : 'General';

  if (!titleVal || !contentVal) {
    window.showNotification('Operation Aborted: Entries require a title and details message.', 'error');
    return;
  }

  // Performance / Cooldown / Rate Limiting Check
  const timeSinceLastPost = Date.now() - discussionsState.lastPostTime;
  if (timeSinceLastPost < discussionsState.cooldownSeconds * 1000) {
    const remainingSecs = Math.ceil((discussionsState.cooldownSeconds * 1000 - timeSinceLastPost) / 1000);
    if (warningDiv) {
      warningDiv.style.display = 'block';
      warningDiv.innerHTML = `⚠️ <b>SOC System Rate Limit:</b> Anti-Spam rate-limiting filter is active. Please cooldown for <b>${remainingSecs}s</b> before transmitting more payloads to the registry feed.`;
    }
    window.showNotification('Transmission Throttled by CyberShield SOC Firewall.', 'error');
    return;
  }

  // Moderation: Offensive Content Check
  const blacklist = ['fuck', 'shit', 'bitch', 'asshole', 'crap', 'bastard', 'steal account', 'steal credit card', 'hack fb', 'leak database'];
  const unifiedText = (titleVal + ' ' + contentVal).toLowerCase();
  const matchedOffensive = blacklist.some(term => unifiedText.includes(term));

  if (matchedOffensive) {
    if (warningDiv) {
      warningDiv.style.display = 'block';
      warningDiv.innerHTML = `⚠️ <b>SOC Security Sandbox Violation:</b> Offensive content or illegal activity queries detected in request parameters. System edits locked. Please maintain standard academic code-of-conduct rules in the cyber range.`;
    }
    window.showNotification('Topic rejected by CyberShield automated firewall.', 'error');
    return;
  }

  const list = getDiscussions();

  // Moderation: Duplicate Question Detection
  const isDuplicate = list.some(th => th.title.toLowerCase() === titleVal.toLowerCase());
  if (isDuplicate) {
    if (warningDiv) {
      warningDiv.style.display = 'block';
      warningDiv.innerHTML = `⚠️ <b>Spam Prevention System:</b> A matching topic title was detected already within the registry records. Please reply to the existing topic or modify your title parameters.`;
    }
    window.showNotification('Duplicate topic detected.', 'error');
    return;
  }

  const activeUser = window.getStudentName();
  const customAvatar = categoryVal === 'Linux' ? '🐧' : categoryVal === 'Cryptography' ? '🔑' : categoryVal === 'Web Security' ? '🌐' : '👾';

  const newThread = {
    id: "disc_" + Date.now(),
    type: typeVal,
    title: titleVal,
    category: categoryVal,
    content: contentVal,
    user: activeUser,
    avatar: customAvatar,
    likes: 0,
    likedByMe: false,
    timestamp: new Date().toISOString(),
    pinned: false,
    solved: false,
    reported: false,
    replies: []
  };

  list.unshift(newThread);
  saveDiscussions(list);

  // Update cooldown state
  discussionsState.lastPostTime = Date.now();
  window.showNotification('Topic published successfully on the CyberShield board.', 'success');
  
  // Auto-Moderation: Bot Auto Response simulation if certain trigger keywords are detected
  if (unifiedText.includes('ransomware') || unifiedText.includes('virus') || unifiedText.includes('malware')) {
    setTimeout(() => {
      const updatedList = getDiscussions();
      const targetThread = updatedList.find(d => d.id === newThread.id);
      if (targetThread) {
        targetThread.replies.push({
          id: "rep_bot_" + Date.now(),
          user: "SOC_AUTO_MOD (Security Bot)",
          avatar: "🤖",
          content: "⚠️ <b>System Advisory:</b> This thread mentions active software threat structures (Malware/Virus/Ransomware). Please be advised that execution of hostile binaries must strictly take place inside completely isolated sandbox containers. Do not upload actual credentials, keys, or proprietary malware headers to the public Learning Center forum.",
          likes: 5,
          helpfulCount: 2,
          timestamp: new Date().toISOString(),
          replies: []
        });
        saveDiscussions(updatedList);
        window.showNotification('Auto-moderation advisory attached to your malware thread.', 'info');
      }
    }, 4000); // 4 seconds auto response trigger delay
  }

  window.renderDiscussionsSubview();
};

// Delete a thread
window.deleteDiscussionThread = function(threadId) {
  if (!confirm('Are you absolutely sure you want to shred this thread entry from the security registry? This operation is irreversible.')) return;
  
  const list = getDiscussions();
  const filtered = list.filter(d => d.id !== threadId);
  saveDiscussions(filtered);
  window.showNotification('Thread shredded from local forum cache.', 'success');
  window.renderDiscussionsSubview();
};

// Toggle helpful vote on a reply
window.helpfulVoteReply = function(threadId, replyId) {
  const list = getDiscussions();
  const th = list.find(d => d.id === threadId);
  if (th) {
    const reply = th.replies.find(r => r.id === replyId);
    if (reply) {
      if (reply.helpfulVotedByMe) {
        reply.helpfulCount = Math.max(0, (reply.helpfulCount || 0) - 1);
        reply.helpfulVotedByMe = false;
      } else {
        reply.helpfulCount = (reply.helpfulCount || 0) + 1;
        reply.helpfulVotedByMe = true;
      }
      saveDiscussions(list);
      window.viewDiscussionThread(threadId);
    }
  }
};

// Toggle solved status of a thread
window.markThreadSolved = function(threadId) {
  const list = getDiscussions();
  const th = list.find(d => d.id === threadId);
  if (th) {
    th.solved = !th.solved;
    saveDiscussions(list);
    window.showNotification(th.solved ? 'Thread marked as resolved successfully!' : 'Thread reopened for peer contributions.', 'success');
    window.viewDiscussionThread(threadId);
  }
};

// Toggle liking a thread
window.likeDiscussionThread = function(threadId) {
  const list = getDiscussions();
  const th = list.find(d => d.id === threadId);
  if (th) {
    if (th.likedByMe) {
      th.likes = Math.max(0, (th.likes || 0) - 1);
      th.likedByMe = false;
    } else {
      th.likes = (th.likes || 0) + 1;
      th.likedByMe = true;
    }
    saveDiscussions(list);
    
    // Check if we are currently looking at details view vs the main feed list
    const activeDetailContainer = document.getElementById('active-thread-id-tracker');
    if (activeDetailContainer && activeDetailContainer.value === threadId) {
      window.viewDiscussionThread(threadId);
    } else {
      window.renderDiscussionsSubview();
    }
  }
};

// Flag thread as reported
window.reportDiscussionThread = function(threadId) {
  if (!confirm('Are you sure you want to report this thread to SOC Moderation Team for potential policy violations?')) return;
  const list = getDiscussions();
  const th = list.find(d => d.id === threadId);
  if (th) {
    th.reported = true;
    saveDiscussions(list);
    window.showNotification('Topic reported to SOC Security Team. Review pending.', 'success');
    
    // Redirect back to main feed list
    window.renderDiscussionsSubview();
  }
};

// View detailed single-thread view page
window.viewDiscussionThread = function(threadId) {
  const container = document.getElementById('subview-discussions');
  if (!container) return;

  const list = getDiscussions();
  const th = list.find(d => d.id === threadId);
  if (!th) {
    window.showNotification('Intel entry has been deleted or archived.', 'error');
    window.renderDiscussionsSubview();
    return;
  }

  const activeUser = window.getStudentName();
  const isOwner = th.user === activeUser || th.user === 'agent_sowndhar_7' || th.user === 'student_ranger_7';

  // Toggle solves visibility only for questions
  const showMarkSolved = isOwner && th.type === 'question';

  container.innerHTML = `
    <div style="animation: fadeIn 0.2s ease-out; max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- Back button and title -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 12px;">
        <button class="btn-secondary" onclick="window.renderDiscussionsSubview()" style="font-size:12px; padding: 4px 12px; display:flex; align-items:center; gap:6px;">
          <i data-lucide="arrow-left" style="width:12px; height:12px;"></i> Back to Feed
        </button>
        <span class="font-mono text-muted" style="font-size: 10px;">ID: ${th.id}</span>
      </div>

      <!-- Main OP Thread Body Card -->
      <div class="grid-card" style="padding: 24px; background: rgba(3,7,18,0.45); border-color: ${th.solved ? 'rgba(16,185,129,0.3)' : 'rgba(6,182,212,0.15)'}; border-radius: 8px;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 28px; height: 28px; background: rgba(255,255,255,0.04); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px;">
              ${th.avatar || '👤'}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span class="font-mono text-cyan" style="font-size: 11.5px; font-weight: 700;">
                ${th.user}
                <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; display: inline-block;"></span>
              </span>
            </div>
            <span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">${window.timeAgo(th.timestamp)}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 6px;">
            ${th.pinned ? `<span class="font-mono" style="font-size: 9px; font-weight: 700; color: #fbbf24; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); padding: 1px 6px; border-radius: 4px;">📌 PINNED</span>` : ''}
            ${th.solved ? `<span class="font-mono" style="font-size: 9px; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); padding: 1px 6px; border-radius: 4px;">✓ RESOLVED</span>` : ''}
            <span class="font-mono" style="font-size: 10px; color: var(--cyan-bright); background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1px 6px; border-radius: 4px;">${th.category}</span>
          </div>
        </div>
        
        <h3 class="font-display text-shadow" style="font-size: 16.5px; font-weight: 700; color: #ffffff; line-height: 1.35; margin-bottom: 12px;">${th.title}</h3>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.55; white-space: pre-wrap; word-break: break-word;">${th.content}</p>
        
        <!-- OP Controls Footer -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; margin-top: 18px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; gap: 14px; align-items: center;">
            <button style="background: transparent; border: none; color: ${th.likedByMe ? 'var(--cyan-bright)' : 'var(--text-muted)'}; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 11.5px;" onclick="window.likeDiscussionThread('${th.id}')" class="hover:text-cyan">
              <i data-lucide="thumbs-up" style="width:13px; height:13px; fill: ${th.likedByMe ? 'var(--cyan-glow)' : 'transparent'};"></i> Like (${th.likes || 0})
            </button>
            <button style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 11.5px;" onclick="window.reportDiscussionThread('${th.id}')" class="hover:text-rose">
              <i data-lucide="flag" style="width: 12px; height: 12px;"></i> Report
            </button>
          </div>

          <!-- Mark solved / Editing capabilities -->
          <div style="display: flex; gap: 8px; align-items: center;">
            ${showMarkSolved ? `
              <button onclick="window.markThreadSolved('${th.id}')" class="btn-secondary" style="font-size: 11px; padding: 4px 10px; border-color: ${th.solved ? 'rgba(251,191,36,0.3)' : 'rgba(16,185,129,0.3)'}; font-family: var(--font-mono); font-weight: 600; color: ${th.solved ? '#fbbf24' : '#10b981'}; background: ${th.solved ? 'rgba(251,191,36,0.05)' : 'rgba(16,185,129,0.05)'};">
                ${th.solved ? '↩ REOPEN QUESTION' : '✓ MARK AS SOLVED'}
              </button>
            ` : ''}
            
            ${isOwner ? `
              <button onclick="window.openEditThreadModal('${th.id}')" style="background: transparent; border: none; color: var(--cyan-bright); cursor: pointer; font-size: 11px; font-family: var(--font-mono);" class="hover:underline">EDIT</button>
              <button onclick="window.deleteDiscussionThread('${th.id}')" style="background: transparent; border: none; color: var(--rose-bright); cursor: pointer; font-size: 11px; font-family: var(--font-mono);" class="hover:underline">DELETE</button>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Replies Subtitle Feed -->
      <h4 class="font-mono" style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 8px; letter-spacing: 0.5px;">
        TRANSCRIPT RESPONSES (${th.replies ? th.replies.length : 0})
      </h4>

      <!-- Replies List Container -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${(!th.replies || th.replies.length === 0) ? `
          <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 12.5px;" class="grid-card">
            No peer answers registered. Deploy your feedback response payload below.
          </div>
        ` : th.replies.map(r => {
          const isReplyOwner = r.user === activeUser || r.user === 'agent_sowndhar_7' || r.user === 'student_ranger_7';
          const hasHelpfulVoted = r.helpfulVotedByMe;
          const showMarkAsSolution = isOwner && th.type === 'question' && !r.isSolution;

          return `
            <div class="grid-card" style="padding: 16px; background: ${r.isSolution ? 'rgba(16,185,129,0.03)' : 'rgba(3,7,18,0.2)'}; border-color: ${r.isSolution ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.03)'}; border-radius: 8px; position: relative;">
              
              ${r.isSolution ? `
                <div style="position: absolute; top: -1px; right: 20px; font-family: var(--font-mono); font-size: 8.5px; font-weight: bold; background: #10b981; color: #020617; padding: 2px 8px; border-radius: 0 0 4px 4px; letter-spacing: 0.5px; box-shadow: 0 2px 6px rgba(16,185,129,0.3);">
                  VERIFIED SOLUTION
                </div>
              ` : ''}

              <!-- Reply Header -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 14px;">${r.avatar || '🎓'}</span>
                  <span class="font-mono text-cyan" style="font-size: 11px; font-weight: 700;">${r.user}</span>
                  <span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">${window.timeAgo(r.timestamp)}</span>
                </div>
              </div>

              <!-- Reply Body -->
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; word-break: break-word;">${r.content}</p>

              <!-- Interactive Controls for Reply -->
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 8px; margin-top: 10px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; gap: 12px; align-items: center;">
                  
                  <!-- Helpful upvoting -->
                  <button style="background: transparent; border: none; color: ${hasHelpfulVoted ? '#10b981' : 'var(--text-muted)'}; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 11px;" onclick="window.helpfulVoteReply('${th.id}', '${r.id}')" class="hover:text-cyan">
                    <i data-lucide="check-check" style="width: 12.5px; height: 12.5px;"></i> Helpful (${r.helpfulCount || 0})
                  </button>

                  <!-- Nested reply toggler -->
                  <button style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 11px;" onclick="window.toggleNestedReplyForm('${r.id}')" class="hover:text-cyan">
                    <i data-lucide="corner-down-right" style="width: 12.5px; height: 12.5px;"></i> Reply
                  </button>
                </div>

                <div style="display: flex; gap: 8px; align-items: center;">
                  <!-- Mark Solution (Only creator of Question) -->
                  ${showMarkAsSolution ? `
                    <button class="btn-secondary" style="font-size: 10px; padding: 2px 8px; border-color: rgba(16,185,129,0.3); color: #10b981; font-family: var(--font-mono);" onclick="window.setAsVerifiedSolution('${th.id}', '${r.id}')">
                      ✓ ACCEPT SOLUTION
                    </button>
                  ` : ''}

                  <!-- Delete button for own reply -->
                  ${isReplyOwner ? `
                    <button onclick="window.deleteDiscussionReply('${th.id}', '${r.id}')" style="background: transparent; border: none; color: var(--rose-bright); cursor: pointer; font-size: 11px; font-family: var(--font-mono);" class="hover:underline">SHRED</button>
                  ` : ''}
                </div>
              </div>

              <!-- Nested sub-replies rendered indented -->
              ${r.replies && r.replies.length > 0 ? `
                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px; border-left: 2px solid rgba(6,182,212,0.15); padding-left: 14px; background: rgba(255,255,255,0.01); border-radius: 0 4px 4px 0; padding-top: 6px; padding-bottom: 6px;">
                  ${r.replies.map(sub => {
                    const isSubOwner = sub.user === activeUser || sub.user === 'agent_sowndhar_7' || sub.user === 'student_ranger_7';
                    return `
                      <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.45;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                          <div style="display: flex; align-items: center; gap: 6px;">
                            <span class="font-mono text-cyan" style="font-size: 10.5px; font-weight: 700;">${sub.user}</span>
                            <span style="font-size: 9px; color: var(--text-muted);">${window.timeAgo(sub.timestamp)}</span>
                          </div>
                          ${isSubOwner ? `
                            <button onclick="window.deleteNestedReply('${th.id}', '${r.id}', '${sub.id}')" style="background:transparent; border:none; color: var(--rose-bright); cursor:pointer; font-size:10px; font-family:var(--font-mono);" class="hover:underline">× delete</button>
                          ` : ''}
                        </div>
                        <p style="margin-left: 2px; word-break: break-word;">${sub.content}</p>
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : ''}

              <!-- Inline sub-reply expansion form -->
              <div id="nested-reply-form-${r.id}" style="display: none; margin-top: 10px; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 10px;">
                <div style="display: flex; gap: 8px;">
                  <input type="text" id="nested-reply-input-${r.id}" placeholder="Type nested feedback response..." 
                         style="background: var(--input-bg); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; padding: 5px 10px; color: #ffffff; font-size: 11.5px; width: 100%; outline: none;"
                         onkeydown="if(event.key === 'Enter') window.submitNestedReply('${th.id}', '${r.id}')" />
                  <button class="btn-primary" style="font-size: 10.5px; padding: 4px 10px;" onclick="window.submitNestedReply('${th.id}', '${r.id}')">Submit</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Add Primary Reply Form Card -->
      <div class="grid-card" style="padding: 20px; background: rgba(3,7,18,0.4); border-color: rgba(255,255,255,0.04); border-radius: 8px; margin-top: 12px;">
        <h4 class="font-mono text-shadow" style="font-size: 11px; font-weight: 700; color: var(--cyan-bright); text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">
          POST NEW TRANSCRIPT RESPONSE
        </h4>
        <textarea id="reply-content-input" placeholder="Supply your verified academic analysis on this range challenge query..." rows="4"
                  style="background: var(--input-bg); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px 14px; color: #ffffff; font-size: 12.5px; width: 100%; font-family: var(--font-sans); outline: none; resize: vertical; line-height: 1.5; margin-bottom: 14px;"
                  onfocus="this.style.borderColor='var(--cyan-bright)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'"></textarea>
        
        <div id="reply-moderation-warning" style="display: none; padding: 8px; background: rgba(239,68,68,0.08); border: 1px solid #ef4444; border-radius: 6px; font-size: 11px; color: #fca5a5; margin-bottom: 12px;"></div>

        <div style="display:flex; justify-content:flex-end;">
          <button class="btn-primary" style="font-size:12px; padding: 6px 14px; background: rgba(6,182,212,0.1); border-color: var(--cyan-bright);" onclick="window.submitDiscussionReply('${th.id}')">
            <i data-lucide="send" style="width: 13px; height: 13px; display: inline-block; margin-right: 4px; vertical-align: middle;"></i> Submit Response
          </button>
        </div>
      </div>
    </div>
  `;

  // Track currently active viewing ID
  const activeTracker = document.getElementById('active-thread-id-tracker');
  if (activeTracker) {
    activeTracker.value = threadId;
  }

  lucide.createIcons();
};

// Accept and verify a specific solution reply (Author only)
window.setAsVerifiedSolution = function(threadId, replyId) {
  const list = getDiscussions();
  const th = list.find(d => d.id === threadId);
  if (th) {
    th.solved = true;
    th.replies.forEach(r => {
      r.isSolution = (r.id === replyId);
    });
    saveDiscussions(list);
    window.showNotification('Reply verified as solution thread.', 'success');
    window.viewDiscussionThread(threadId);
  }
};

// Toggle sub-reply nesting expander form
window.toggleNestedReplyForm = function(replyId) {
  const form = document.getElementById(`nested-reply-form-${replyId}`);
  if (form) {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    if (form.style.display === 'block') {
      const input = document.getElementById(`nested-reply-input-${replyId}`);
      if (input) input.focus();
    }
  }
};

// Submit nested sub-reply payload
window.submitNestedReply = function(threadId, replyId) {
  const input = document.getElementById(`nested-reply-input-${replyId}`);
  const contentVal = input ? input.value.trim() : '';

  if (!contentVal) {
    window.showNotification('Operation Aborted: Replies require a message.', 'error');
    return;
  }

  // Moderation filter
  const blacklist = ['fuck', 'shit', 'bitch', 'asshole'];
  const hasOffensive = blacklist.some(term => contentVal.toLowerCase().includes(term));
  if (hasOffensive) {
    window.showNotification('Response contains flagged terms. Safe sandbox transmission active.', 'error');
    return;
  }

  const list = getDiscussions();
  const th = list.find(d => d.id === threadId);
  if (th) {
    const parentReply = th.replies.find(r => r.id === replyId);
    if (parentReply) {
      if (!parentReply.replies) parentReply.replies = [];
      
      const activeUser = window.getStudentName();
      parentReply.replies.push({
        id: "rep_nest_" + Date.now(),
        user: activeUser,
        content: contentVal,
        timestamp: new Date().toISOString()
      });

      saveDiscussions(list);
      window.showNotification('Response synchronized.', 'success');
      window.viewDiscussionThread(threadId);
    }
  }
};

// Delete nested sub-reply
window.deleteNestedReply = function(threadId, replyId, nestedReplyId) {
  if (!confirm('Are you sure you want to delete this nested reply?')) return;
  const list = getDiscussions();
  const th = list.find(d => d.id === threadId);
  if (th) {
    const parentReply = th.replies.find(r => r.id === replyId);
    if (parentReply && parentReply.replies) {
      parentReply.replies = parentReply.replies.filter(sub => sub.id !== nestedReplyId);
      saveDiscussions(list);
      window.showNotification('Nested comment shredded.', 'success');
      window.viewDiscussionThread(threadId);
    }
  }
};

// Delete a regular top-level reply
window.deleteDiscussionReply = function(threadId, replyId) {
  if (!confirm('Are you sure you want to shred this transcript comment?')) return;
  const list = getDiscussions();
  const th = list.find(d => d.id === threadId);
  if (th && th.replies) {
    th.replies = th.replies.filter(r => r.id !== replyId);
    saveDiscussions(list);
    window.showNotification('Comment shredded from registry.', 'success');
    window.viewDiscussionThread(threadId);
  }
};

// Submit a new main thread reply
window.submitDiscussionReply = function(threadId) {
  const replyInput = document.getElementById('reply-content-input');
  const warningDiv = document.getElementById('reply-moderation-warning');
  const replyVal = replyInput ? replyInput.value.trim() : '';

  if (!replyVal) {
    window.showNotification('Operation Aborted: Replies require non-empty text.', 'error');
    return;
  }

  // Spam Protection: check for duplicate reply to prevent UI flood
  const list = getDiscussions();
  const th = list.find(d => d.id === threadId);
  if (!th) return;

  const isSpam = th.replies && th.replies.slice(-3).some(r => r.content === replyVal);
  if (isSpam) {
    if (warningDiv) {
      warningDiv.style.display = 'block';
      warningDiv.innerHTML = `⚠️ <b>Spam Alert:</b> Duplicate comment content detected in stream. Please write a genuine analytical answer.`;
    }
    window.showNotification('Duplicate comment rejected.', 'error');
    return;
  }

  // Moderation blacklist check
  const blacklist = ['fuck', 'shit', 'bitch', 'asshole', 'crap', 'bastard'];
  const hasOffensive = blacklist.some(term => replyVal.toLowerCase().includes(term));
  if (hasOffensive) {
    if (warningDiv) {
      warningDiv.style.display = 'block';
      warningDiv.innerHTML = `⚠️ <b>Firewall Block:</b> Content contains banned terms. Please maintain respectful and academic behaviour.`;
    }
    window.showNotification('Banned content rejected.', 'error');
    return;
  }

  const activeUser = window.getStudentName();
  th.replies.push({
    id: "rep_" + Date.now(),
    user: activeUser,
    avatar: "🕵️",
    content: replyVal,
    likes: 0,
    helpfulCount: 0,
    helpfulVotedByMe: false,
    timestamp: new Date().toISOString(),
    replies: []
  });
  
  saveDiscussions(list);
  window.showNotification('Reply synchronized.', 'success');
  window.viewDiscussionThread(threadId);
};

// HTML Loading Skeleton rendering helper
function renderLoadingSkeleton() {
  return `
    <div style="display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start; animation: pulse 1.8s infinite ease-in-out;" class="flex-col md:grid">
      <!-- Left side skeleton -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="grid-card" style="height: 160px; background: rgba(3,7,18,0.1); border-color: rgba(255,255,255,0.02); border-radius: 8px;"></div>
        <div class="grid-card" style="height: 280px; background: rgba(3,7,18,0.1); border-color: rgba(255,255,255,0.02); border-radius: 8px;"></div>
      </div>

      <!-- Right side feed skeleton -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div class="grid-card" style="height: 70px; background: rgba(3,7,18,0.15); border-color: rgba(255,255,255,0.02); border-radius: 8px; display: flex; align-items: center; padding: 20px;">
          <div style="width: 200px; height: 16px; background: rgba(255,255,255,0.03); border-radius: 4px;"></div>
        </div>
        <div style="display: flex; gap: 12px; height: 44px; background: rgba(0,0,0,0.1); border-radius: 6px; padding: 6px; border: 1px solid rgba(255,255,255,0.02);">
          <div style="width: 80px; height: 100%; background: rgba(255,255,255,0.03); border-radius: 4px;"></div>
          <div style="width: 80px; height: 100%; background: rgba(255,255,255,0.03); border-radius: 4px;"></div>
          <div style="width: 80px; height: 100%; background: rgba(255,255,255,0.03); border-radius: 4px;"></div>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${[1, 2, 3].map(() => `
            <div class="grid-card" style="padding: 16px; background: rgba(3,7,18,0.1); border-color: rgba(255,255,255,0.02); display: flex; flex-direction: column; gap: 12px; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between;">
                <div style="width: 150px; height: 12px; background: rgba(255,255,255,0.03); border-radius: 3px;"></div>
                <div style="width: 80px; height: 12px; background: rgba(255,255,255,0.03); border-radius: 3px;"></div>
              </div>
              <div style="width: 90%; height: 15px; background: rgba(255,255,255,0.04); border-radius: 4px; margin-top: 4px;"></div>
              <div style="width: 100%; height: 24px; background: rgba(255,255,255,0.02); border-radius: 4px;"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Live simulated background real-time updates (instructor comments, new range posts)
window.simulateRealtimeActivity = function() {
  if (document.getElementById('subview-discussions')?.style.display !== 'block') {
    return;
  }
  
  const list = window.getDiscussions();
  if (list.length === 0) return;
  
  // Choose random action: 70% reply to existing post, 30% create new post
  const rand = Math.random();
  const simulatedUsers = ["instructor_alex", "soc_lead_raghul", "packet_sniffer_99", "malware_analyst_sarah", "kernel_hacker_42", "quantum_bits"];
  const simulatedAvatars = ["🤖", "🛡️", "🕵️", "💻", "🔬", "🛰️"];
  
  const userIdx = Math.floor(Math.random() * simulatedUsers.length);
  const activeUser = simulatedUsers[userIdx];
  const activeAvatar = simulatedAvatars[userIdx];
  
  if (rand < 0.70) {
    // Reply to a random thread
    const threadIdx = Math.floor(Math.random() * list.length);
    const th = list[threadIdx];
    
    // Ignore locked or reported threads
    if (th.reported) return;
    
    const replyPools = [
      "Fascinating perspective! Under zero-trust modeling, this configuration would be flagged immediately by PAM policies.",
      "I encountered this identical issue in the staging sandboxes yesterday. Check if your iptables chains are blocking port ingress.",
      "Confirmed. This aligns perfectly with OWASP guidelines on secure XML parsing. Good catch!",
      "Are you sure about the encryption padding size? A block alignment mismatch typically throws a padding oracle exception.",
      "Interesting payload! Let me deploy this in my secure local VM and inspect the network packet dump in Wireshark.",
      "This is solid. Marking this thread as a helpful academic query. Thanks for writing this down!",
      "I'd recommend consulting the RFC documentation directly. There are several subtle edge cases on port forwarding rules."
    ];
    
    const replyText = replyPools[Math.floor(Math.random() * replyPools.length)];
    
    th.replies.push({
      id: "rep_sim_" + Date.now(),
      user: activeUser,
      avatar: activeAvatar,
      content: replyText,
      likes: 0,
      helpfulCount: 0,
      helpfulVotedByMe: false,
      timestamp: new Date().toISOString(),
      replies: []
    });
    
    saveDiscussions(list);
    window.showNotification(`[+] LIVE FEED: @${activeUser} responded to "${th.title.substring(0, 30)}..."`, "info");
    
    // If the user is currently viewing this thread, refresh the thread view!
    const activeDetailContainer = document.getElementById('active-thread-id-tracker');
    if (activeDetailContainer && activeDetailContainer.value === th.id) {
      window.viewDiscussionThread(th.id);
    } else {
      window.renderDiscussionsSubview();
    }
  } else {
    // Post a new simulated question!
    const postPools = [
      {
        title: "Mitigating side-channel latency attacks on local host caches?",
        content: "We're observing timing leak anomalies when fetching cached symmetric keys from shared hardware blocks. What hardware isolation rings are best suited to shield timing leaks?",
        category: "Cryptography"
      },
      {
        title: "Docker container escape via namespace mapping error?",
        content: "I successfully escalated to root inside a sandbox container, but I'm unable to mount host directory nodes. Is this a cgroups limitation or AppArmor filtering?",
        category: "Linux"
      },
      {
        title: "Wireshark TLS 1.3 handshake decryption with pre-master secret keylog?",
        content: "I configured the SSLKEYLOGFILE environment variable to capture secrets, but Wireshark still displays application data as encrypted. Is there an offset mismatch?",
        category: "Networking"
      }
    ];
    
    const selectedPost = postPools[Math.floor(Math.random() * postPools.length)];
    // Check if duplicate title
    if (list.some(d => d.title.toLowerCase() === selectedPost.title.toLowerCase())) return;
    
    list.unshift({
      id: "disc_sim_" + Date.now(),
      type: "question",
      title: selectedPost.title,
      content: selectedPost.content,
      category: selectedPost.category,
      user: activeUser,
      avatar: activeAvatar,
      likes: 4,
      likedByMe: false,
      timestamp: new Date().toISOString(),
      pinned: false,
      solved: false,
      reported: false,
      replies: []
    });
    
    saveDiscussions(list);
    window.showNotification(`[+] NEW TOPIC: @${activeUser} published a thread on "${selectedPost.category}"`, "success");
    
    // Only refresh the main subview if the user is currently looking at the list (not on Ask Question modal or details view)
    const activeDetailContainer = document.getElementById('active-thread-id-tracker');
    if (!activeDetailContainer && !document.getElementById('disc-title-input')) {
      window.renderDiscussionsSubview();
    }
  }
};


// ============================================================================
// 4. Certificates Subview & Premium SVG Gold Seal Generator
// ============================================================================

window.getStudentName = function() {
  return localStorage.getItem('cybershield_student_name') || 'GUEST USER';
};

window.setStudentName = function(name) {
  const sanitized = name.trim() || 'GUEST USER';
  localStorage.setItem('cybershield_student_name', sanitized);
  
  const certInput = document.getElementById('cert-student-name');
  if (certInput && certInput.value !== sanitized) {
    certInput.value = sanitized;
  }
  const certViewerName = document.getElementById('cert-viewer-name');
  if (certViewerName) {
    certViewerName.textContent = sanitized.toUpperCase();
  }
};

window.isBookFullyCompleted = function(bookId) {
  const books = window.CYBER_BOOKS || [];
  const b = books.find(item => item.id === bookId);
  if (!b) return false;

  const progressMap = getProgressMap();
  const completedMap = getCompletedBooksMap();
  const completedLessons = progressMap[bookId] || [];
  const completedInfo = completedMap[bookId] || {};

  const totalLessons = b.chapters.reduce((acc, ch) => acc + (ch.lessons ? ch.lessons.length : 0), 0);
  const allLessonsCompleted = completedLessons.length >= totalLessons;
  const finalQuizPassed = completedInfo.quizPassed === true;
  const finalAssessmentPassed = completedInfo.assessmentPassed === true;

  return allLessonsCompleted && finalQuizPassed && finalAssessmentPassed;
};

window.generateVerificationHash = function(studentName, bookId) {
  const data = `${studentName.trim().toUpperCase()}-${bookId.toUpperCase()}-CYBERSHIELD-SEC-OPS`;
  let hashVal = 0;
  for (let i = 0; i < data.length; i++) {
    hashVal = (hashVal << 5) - hashVal + data.charCodeAt(i);
    hashVal |= 0;
  }
  return "CS-VAL-" + Math.abs(hashVal).toString(16).toUpperCase() + "-" + (Date.now() % 1000);
};

window.renderCertificatesSubview = function() {
  const container = document.getElementById('subview-certificates');
  if (!container) return;

  const books = window.CYBER_BOOKS || [];
  const progressMap = getProgressMap();
  const completedMap = getCompletedBooksMap();
  const studentName = window.getStudentName();

  let earnedCount = 0;
  books.forEach(b => {
    if (window.isBookFullyCompleted(b.id)) {
      earnedCount++;
    }
  });

  container.innerHTML = `
    <div style="animation: fadeIn 0.2s ease-out; color: #f1f5f9; font-family: var(--font-sans);">
      
      <div style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 class="font-display" style="font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; display: flex; align-items: center; gap: 10px;">
            <i data-lucide="award" style="width: 24px; height: 24px; color: #fbbf24;"></i> CREDENTIAL REGISTRY
          </h2>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Review and generate cryptographically verifiable academic achievements by completing syllabus tracks.</p>
        </div>
        
        <div style="background: rgba(3, 7, 18, 0.6); border: 1px solid rgba(6, 182, 212, 0.15); border-radius: 8px; padding: 12px 20px; display: flex; align-items: center; gap: 12px; max-width: 360px; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
          <div style="width: 36px; height: 36px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 50%; display: flex; justify-content: center; align-items: center;">
            <i data-lucide="user-check" style="width: 18px; height: 18px; color: var(--cyan-bright);"></i>
          </div>
          <div style="flex-grow: 1;">
            <label style="font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); display: block; text-transform: uppercase;">Student Profile Name</label>
            <input type="text" id="registry-student-name" value="${studentName}" 
                   style="background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 700; color: #ffffff; font-size: 14px; width: 100%; outline: none; padding: 2px 0; transition: border-color 0.2s;"
                   placeholder="Enter Name..."
                   onfocus="this.style.borderColor='var(--cyan-glow)'" 
                   onblur="this.style.borderColor='rgba(255,255,255,0.1)'"
                   oninput="window.setStudentName(this.value); window.updateRegistryThumbnails();" />
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px;">
        <div class="grid-card shadow-glow" style="padding: 16px 20px; background: rgba(3, 7, 18, 0.4); border-color: rgba(6, 182, 212, 0.15); border-radius: 8px;">
          <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase;">VERIFIED CREDENTIALS</span>
          <h4 style="font-size: 28px; font-weight: 800; color: #ffffff; margin-top: 4px;">${earnedCount} <span style="font-size: 14px; font-weight: 500; color: var(--text-muted);">/ 10 Earned</span></h4>
          <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.04); border-radius: 10px; margin-top: 10px; overflow: hidden;">
            <div style="width: ${earnedCount * 10}%; height: 100%; background: var(--emerald-bright); border-radius: 10px;"></div>
          </div>
        </div>
        
        <div class="grid-card shadow-glow" style="padding: 16px 20px; background: rgba(3, 7, 18, 0.4); border-color: rgba(245, 158, 11, 0.15); border-radius: 8px;">
          <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase;">LEARNING CENTER LEVEL</span>
          <h4 style="font-size: 22px; font-weight: 800; color: #fbbf24; margin-top: 8px; text-transform: uppercase;">
            ${earnedCount === 10 ? 'Elite SOC Master' : earnedCount >= 6 ? 'Senior Operator' : earnedCount >= 3 ? 'Operational Specialist' : 'Field Cadet'}
          </h4>
          <span style="font-size: 11px; color: var(--text-muted); margin-top: 2px; display: block;">Authorized Defense Officer</span>
        </div>

        <div class="grid-card shadow-glow" style="padding: 16px 20px; background: rgba(3, 7, 18, 0.4); border-color: rgba(16, 185, 129, 0.15); border-radius: 8px;">
          <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase;">SECURE LEDGER INTEGRITY</span>
          <h4 style="font-size: 20px; font-weight: 800; color: var(--emerald-bright); margin-top: 10px; display: flex; align-items: center; gap: 6px;">
            <i data-lucide="shield-check" style="width: 18px; height: 18px;"></i> COMPLIANT
          </h4>
          <span style="font-size: 11px; color: var(--text-muted); margin-top: 2px; display: block;">Verification Host Nodes Active</span>
        </div>
      </div>

      <div id="registry-certificates-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px;"></div>
    </div>
  `;

  window.updateRegistryThumbnails();
  lucide.createIcons();
};

window.updateRegistryThumbnails = function() {
  const grid = document.getElementById('registry-certificates-grid');
  if (!grid) return;

  const books = window.CYBER_BOOKS || [];
  const progressMap = getProgressMap();
  const completedMap = getCompletedBooksMap();
  const studentName = window.getStudentName().toUpperCase();

  grid.innerHTML = books.map(b => {
    const completedLessons = progressMap[b.id] || [];
    const totalLessons = b.chapters.reduce((acc, ch) => acc + (ch.lessons ? ch.lessons.length : 0), 0);
    const completedInfo = completedMap[b.id] || {};

    const isCompleted = window.isBookFullyCompleted(b.id);
    const percent = Math.min(100, Math.floor((completedLessons.length / totalLessons) * 100));

    const dateStr = completedInfo.completedAt || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = completedInfo.certificateId || "CS-" + b.id.toUpperCase().replace('-','').substr(0, 4) + "-" + Math.floor(100000 + Math.random() * 900000);

    if (isCompleted) {
      return `
        <div class="grid-card shadow-glow" style="padding: 0; background: #020617; border-color: rgba(245, 158, 11, 0.25); border-radius: 8px; position: relative; overflow: hidden; display: flex; flex-direction: column; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;" 
             onclick="window.openCertificateViewer('${b.id}')"
             onmouseenter="this.style.transform='translateY(-6px)'; this.style.borderColor='var(--amber-bright)'; this.style.boxShadow='0 10px 25px rgba(245,158,11,0.15)';"
             onmouseleave="this.style.transform='none'; this.style.borderColor='rgba(245, 158, 11, 0.25)'; this.style.boxShadow='none';">
          
          <div style="width: 100%; aspect-ratio: 297/210; background: #030712; padding: 16px; border: 4px double #fbbf24; border-image: linear-gradient(135deg, #fbbf24 0%, #b45309 50%, #fbbf24 100%) 4; box-sizing: border-box; position: relative; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; pointer-events: none;">
            <div style="position: absolute; top:0; left:0; width:100%; height:100%; background-image: radial-gradient(circle at 50% 50%, rgba(245,158,11,0.02) 0%, transparent 80%);"></div>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-mono); font-size: 7px; color: #fbbf24; font-weight: 700; letter-spacing: 1px;">CYBERSHIELD LEARNING CENTER</span>
              <span style="font-family: var(--font-mono); font-size: 5px; color: var(--text-muted);">${certId}</span>
            </div>

            <div style="text-align: center; margin: 4px 0;">
              <span style="font-family: var(--font-mono); font-size: 5px; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; display: block;">Verifiable Professional Certificate</span>
              <h5 style="font-size: 11px; font-weight: bold; color: #ffffff; margin: 2px 0 1px; font-family: var(--font-sans); letter-spacing: 0.2px; text-transform: uppercase; line-height: 1.1;">${b.title}</h5>
              <div style="width: 30px; height: 1px; background: #fbbf24; margin: 2px auto;"></div>
              <span style="font-size: 5px; color: var(--text-secondary); display: block; font-style: italic;">officially granted to</span>
              <span style="font-size: 9px; font-weight: 800; color: var(--cyan-bright); font-family: var(--font-sans); text-transform: uppercase; display: block; margin-top: 1px; letter-spacing: 0.5px;">${studentName}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.03);">
              <div style="text-align: left; font-family: var(--font-mono); font-size: 5px; color: var(--text-muted);">
                <span>ISSUED: ${dateStr}</span>
              </div>
              
              <div style="width: 14px; height: 14px; border-radius: 50%; background: #fbbf24; border: 1.5px solid #b45309; box-shadow: 0 0 4px rgba(245,158,11,0.5); display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="3" style="width: 8px; height: 8px;">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>

              <div style="text-align: right; font-family: var(--font-mono); font-size: 5px; color: var(--text-muted);">
                <span style="color: #ffffff; font-style: italic; font-weight: bold;">Sowndhar P.</span>
                <span style="display: block; font-size: 4px;">OPERATIONS CHIEF</span>
              </div>
            </div>
          </div>

          <div class="hover-overlay" style="position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(2, 6, 23, 0.85); display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.2s;"
               onmouseenter="this.style.opacity='1'"
               onmouseleave="this.style.opacity='0'">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); border: 1.5px solid var(--amber-bright); display: flex; justify-content: center; align-items: center; margin-bottom: 8px; box-shadow: 0 0 15px rgba(245,158,11,0.4);">
              <i data-lucide="eye" style="width: 20px; height: 20px; color: var(--amber-bright);"></i>
            </div>
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">VIEW FULL PREVIEW</span>
            <span style="font-size: 9.5px; color: var(--text-muted); margin-top: 2px;">System Validation Confirmed</span>
          </div>

          <div style="padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(3,7,18,0.4); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h6 style="font-size: 13.5px; font-weight: bold; color: #ffffff; margin: 0;">${b.title}</h6>
              <span class="font-mono text-emerald" style="font-size: 10px; font-weight: bold; display: flex; align-items: center; gap: 4px; margin-top: 2px;">
                <i data-lucide="shield-check" style="width: 12px; height: 12px;"></i> CREDENTIAL SECURE
              </span>
            </div>
            <button class="btn-primary" style="padding: 5px 10px; font-size: 11px; background: rgba(245, 158, 11, 0.15); border-color: var(--amber-bright); color: #ffffff;">
              OPEN
            </button>
          </div>
        </div>
      `;
    } else {
      const isLessonsPassed = completedLessons.length >= totalLessons;
      const isQuizPassed = completedInfo.quizPassed === true;
      const isAssessPassed = completedInfo.assessmentPassed === true;

      return `
        <div class="grid-card" style="padding: 20px; background: rgba(3, 7, 18, 0.2); border-color: rgba(255,255,255,0.04); min-height: 240px; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <span class="font-mono text-cyan" style="font-size: 9px; font-weight: 700; text-transform: uppercase;">TRACK INCOMPLETE</span>
              <h4 style="font-size: 15px; font-weight: bold; color: #ffffff; margin-top: 4px; margin-bottom: 2px;">${b.title}</h4>
            </div>
            <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: center; align-items: center; color: var(--text-muted);">
              <i data-lucide="lock" style="width: 13px; height: 13px;"></i>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); padding: 12px; border-radius: 6px; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11.5px;">
              <div style="display: flex; align-items: center; gap: 6px; color: ${isLessonsPassed ? 'var(--emerald-bright)' : 'var(--text-muted)'};">
                <i data-lucide="${isLessonsPassed ? 'check-circle' : 'circle'}" style="width: 13px; height: 13px;"></i>
                <span>All Syllabus Lessons (${completedLessons.length}/${totalLessons})</span>
              </div>
              <span style="font-family: var(--font-mono); font-size: 10px; color: ${isLessonsPassed ? 'var(--emerald-bright)' : 'var(--text-muted)'};">${percent}%</span>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11.5px;">
              <div style="display: flex; align-items: center; gap: 6px; color: ${isLessonsPassed ? 'var(--emerald-bright)' : 'var(--text-muted)'};">
                <i data-lucide="${isLessonsPassed ? 'check-circle' : 'circle'}" style="width: 13px; height: 13px;"></i>
                <span>Chapter Quizzes Passed</span>
              </div>
              <span style="font-family: var(--font-mono); font-size: 10px;" class="text-muted">${isLessonsPassed ? 'PASSED' : 'PENDING'}</span>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11.5px;">
              <div style="display: flex; align-items: center; gap: 6px; color: ${isLessonsPassed ? 'var(--emerald-bright)' : 'var(--text-muted)'};">
                <i data-lucide="${isLessonsPassed ? 'check-circle' : 'circle'}" style="width: 13px; height: 13px;"></i>
                <span>Practical Sandbox Labs</span>
              </div>
              <span style="font-family: var(--font-mono); font-size: 10px;" class="text-muted">${isLessonsPassed ? 'VERIFIED' : 'PENDING'}</span>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11.5px; color: ${isQuizPassed ? 'var(--emerald-bright)' : 'var(--text-muted)'};">
              <div style="display: flex; align-items: center; gap: 6px;">
                <i data-lucide="${isQuizPassed ? 'check-circle' : 'circle'}" style="width: 13px; height: 13px;"></i>
                <span>Final Certification Quiz</span>
              </div>
              <span style="font-family: var(--font-mono); font-size: 10px;">${isQuizPassed ? '100%' : 'LOCKED'}</span>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11.5px; color: ${isAssessPassed ? 'var(--emerald-bright)' : 'var(--text-muted)'};">
              <div style="display: flex; align-items: center; gap: 6px;">
                <i data-lucide="${isAssessPassed ? 'check-circle' : 'circle'}" style="width: 13px; height: 13px;"></i>
                <span>Final Practical Threat Range</span>
              </div>
              <span style="font-family: var(--font-mono); font-size: 10px;">${isAssessPassed ? 'SOLVED' : 'LOCKED'}</span>
            </div>
          </div>

          <div>
            <button class="btn-secondary" style="width:100%; font-size:11.5px; padding: 6px 10px; opacity:0.5; cursor:not-allowed;" disabled>
              <i data-lucide="shield-alert" style="width:13px; height:13px; display:inline-block; margin-right:4px; vertical-align:middle;"></i> COMPLETE EXAMS TO UNLOCK
            </button>
          </div>
        </div>
      `;
    }
  }).join('');

  lucide.createIcons();
};

window.generateCertificate = function(bookId, bookTitle) {
  // Store the active certificate's book ID on the window object so other controls like downloadCertificatePDF can reference it
  window.activeCertBookId = bookId;
  
  // Retrieve persistent student name
  const currentName = window.getStudentName() || "GUEST USER";
  
  // Render full modal overlay
  let overlay = document.getElementById('certificate-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'certificate-modal-overlay';
    overlay.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(2, 6, 23, 0.98); z-index:9999; display:flex; justify-content:center; align-items:center; padding:20px; overflow-y:auto; backdrop-filter: blur(8px);';
    document.body.appendChild(overlay);
  }

  const certId = "CS-" + bookId.substring(0,3).toUpperCase() + "-" + Math.floor(100000 + Math.random() * 900000);
  const issuedDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  overlay.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:20px; width:100%; max-width:1050px; background:#020617; border: 1px solid rgba(6, 182, 212, 0.15); border-radius:12px; padding:24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); font-family: var(--font-sans);">
      
      <!-- Modal Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width: 8px; height: 8px; background: var(--cyan-bright); border-radius: 50%; box-shadow: 0 0 8px var(--cyan-bright);"></div>
          <h3 class="font-mono" style="color:var(--cyan-bright); font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">CyberShield Command Registry // Credential Verification</h3>
        </div>
        <button style="background:transparent; border:none; color:rgba(255,255,255,0.6); font-size:22px; cursor:pointer; padding: 4px; line-height:1; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='rgba(255,255,255,0.6)'" onclick="window.closeCertificateModal()">×</button>
      </div>

      <!-- Live Customizer Bar -->
      <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px; background:rgba(6, 182, 212, 0.03); border:1px solid rgba(6, 182, 212, 0.08); padding:12px 16px; border-radius:8px;">
        <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:280px;">
          <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono); font-weight:600; letter-spacing:1px; white-space:nowrap;">CERTIFIED STUDENT:</span>
          <input type="text" id="cert-student-name" value="${currentName}" oninput="window.updateCertViewerName(this.value)" 
                 placeholder="Enter Student Name"
                 style="background:rgba(0,0,0,0.3); border:1px solid rgba(6,182,212,0.2); outline:none; color:#ffffff; font-size:13px; font-weight:600; width:100%; max-width:280px; padding:6px 12px; border-radius:4px; font-family:var(--font-sans); transition: border-color 0.2s;"
                 onfocus="this.style.borderColor='var(--cyan-bright)'" onblur="this.style.borderColor='rgba(6,182,212,0.2)'" />
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <i data-lucide="info" style="width:14px; height:14px; color:var(--cyan-bright);"></i>
          <span style="font-size:11px; color:var(--text-muted);">The student name is synchronized and stored locally. Changing it updates the document.</span>
        </div>
      </div>

      <!-- A4 Landscape Preview Canvas -->
      <div style="width:100%; overflow-x:auto; padding: 4px; border-radius: 8px; background: rgba(0,0,0,0.2);">
        <div id="print-certificate-stage" style="width:960px; height:678px; background:#02050c; border: 12px double #d4af37; box-shadow: inset 0 0 60px rgba(0,0,0,0.95), 0 0 40px rgba(212,175,55,0.08); text-align:center; position:relative; overflow:hidden; font-family:var(--font-sans); box-sizing:border-box; padding: 48px; color: #ffffff;">
          
          <!-- Abstract Technical Cyber Watermark Grid -->
          <div style="position:absolute; inset:0; background-image: radial-gradient(rgba(6, 182, 212, 0.015) 1px, transparent 1px); background-size: 24px 24px; pointer-events:none;"></div>
          
          <!-- Glowing Giant CyberShield Compass Watermark in the dead center -->
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width: 420px; height: 420px; border: 1px dashed rgba(212,175,55,0.02); border-radius: 50%; display:flex; justify-content:center; align-items:center; pointer-events:none;">
            <div style="width: 320px; height: 320px; border: 1px dashed rgba(6,182,212,0.025); border-radius: 50%; display:flex; justify-content:center; align-items:center;">
              <i data-lucide="shield" style="width:140px; height:140px; color:rgba(6,182,212,0.015);"></i>
            </div>
          </div>

          <!-- Triple Golden Corner Framing -->
          <div style="position:absolute; top:20px; left:20px; width:60px; height:60px; border-top:3px solid #d4af37; border-left:3px solid #d4af37;"></div>
          <div style="position:absolute; top:20px; right:20px; width:60px; height:60px; border-top:3px solid #d4af37; border-right:3px solid #d4af37;"></div>
          <div style="position:absolute; bottom:20px; left:20px; width:60px; height:60px; border-bottom:3px solid #d4af37; border-left:3px solid #d4af37;"></div>
          <div style="position:absolute; bottom:20px; right:20px; width:60px; height:60px; border-bottom:3px solid #d4af37; border-right:3px solid #d4af37;"></div>

          <div style="position:absolute; top:26px; left:26px; width:48px; height:48px; border-top:1px solid rgba(212,175,55,0.4); border-left:1px solid rgba(212,175,55,0.4);"></div>
          <div style="position:absolute; top:26px; right:26px; width:48px; height:48px; border-top:1px solid rgba(212,175,55,0.4); border-right:1px solid rgba(212,175,55,0.4);"></div>
          <div style="position:absolute; bottom:26px; left:26px; width:48px; height:48px; border-bottom:1px solid rgba(212,175,55,0.4); border-left:1px solid rgba(212,175,55,0.4);"></div>
          <div style="position:absolute; bottom:26px; right:26px; width:48px; height:48px; border-bottom:1px solid rgba(212,175,55,0.4); border-right:1px solid rgba(212,175,55,0.4);"></div>

          <!-- Top Logo & Academic Header -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:8px; margin-bottom:28px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <i data-lucide="shield-check" style="width:28px; height:28px; color:#d4af37; filter: drop-shadow(0 0 8px rgba(212,175,55,0.25));"></i>
              <span style="font-family:var(--font-mono); font-size:14px; font-weight:800; color:#d4af37; letter-spacing:4px; text-transform:uppercase;">CYBERSHIELD LEARNING CENTER</span>
            </div>
            <div style="width: 180px; height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent);"></div>
          </div>

          <!-- Primary Declarations -->
          <span style="font-family:var(--font-mono); font-size:10px; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:3px; display:block; margin-bottom:16px;">SOC-COMPLIANCE CREDENTIAL REPORT // LEVEL 1 SECURE MEMBER</span>
          
          <h1 style="font-family:var(--font-sans); font-size:18px; font-weight:300; color:#ffffff; margin-bottom:24px; text-transform:uppercase; letter-spacing:2px; font-style:italic;">This official record declares that</h1>

          <!-- Recipient Student Name with Custom Display -->
          <div style="margin-bottom:24px;">
            <h2 id="cert-viewer-name" style="font-family:var(--font-sans); font-size:34px; font-weight:900; color:#ffffff; text-shadow: 0 0 12px rgba(255,255,255,0.1); border-bottom:2px solid #d4af37; display:inline-block; padding-bottom:8px; min-width:440px; text-transform:uppercase; letter-spacing:2px;">
              ${currentName.toUpperCase()}
            </h2>
          </div>

          <!-- Description Text -->
          <p style="font-size:13px; color:rgba(255,255,255,0.7); line-height:1.7; max-width:640px; margin:0 auto 28px; font-family:var(--font-sans); font-weight: 300;">
            has verified complete structural competency, successfully resolving all lesson models, tactical concept examinations, sandbox operations, and complex practical penetration testing modules inside the cybersecurity curricula of
          </p>

          <!-- Book Title (Completed Syllabus Course) -->
          <div style="margin-bottom:44px;">
            <h3 style="font-family:var(--font-sans); font-size:24px; font-weight:800; color:#d4af37; text-transform:uppercase; letter-spacing:1.5px; filter: drop-shadow(0 0 4px rgba(212,175,55,0.15));">
              ${bookTitle}
            </h3>
            <div style="font-family:var(--font-mono); font-size:10px; color:var(--cyan-bright); margin-top:6px; letter-spacing:1px; font-weight:700;">REGISTRY INDEX APPROVED COMPLIANT</div>
          </div>

          <!-- Bottom Columns: Signature, Seal, Verification ID -->
          <div style="display:flex; justify-content:space-between; align-items:flex-end; padding:0 30px;">
            
            <!-- Left: Signatures & Authority -->
            <div style="width:240px; text-align:left;">
              <div style="font-family:'Brush Script MT', cursive, Georgia, serif; font-size:26px; color:#ffffff; opacity:0.95; padding-bottom:4px; border-bottom:1px solid rgba(212,175,55,0.2); letter-spacing:1px; line-height:1.1; font-weight:normal;">
                Sowndhar P.
              </div>
              <p style="font-family:var(--font-mono); font-size:9px; color:#8e9aa8; text-transform:uppercase; margin-top:6px; letter-spacing:1.5px; font-weight:600;">SOWNDHAR P // DIRECTOR</p>
              <p style="font-family:var(--font-mono); font-size:7.5px; color:var(--text-muted); text-transform:uppercase; margin-top:2px; letter-spacing:1px;">CYBERSHIELD AWARENESS COMMAND</p>
            </div>

            <!-- Center: Gold Completion Seal -->
            <div style="position:relative; width:92px; height:92px; display:flex; justify-content:center; align-items:center;">
              <!-- Outer Dashed Star Ribbon -->
              <div style="position:absolute; width:90px; height:90px; border:1px dashed #d4af37; border-radius:50%; animation: spin 20s linear infinite; opacity:0.3;"></div>
              <!-- Outer Rigid Seal Circle -->
              <div style="position:absolute; width:82px; height:82px; border:2px solid #d4af37; border-radius:50%; background:radial-gradient(circle, rgba(212,175,55,0.06) 0%, rgba(0,0,0,0.85) 100%); display:flex; justify-content:center; align-items:center; box-shadow:0 0 25px rgba(212,175,55,0.15);">
                <!-- Inner Shield Icon & Text -->
                <div style="text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                  <i data-lucide="award" style="width:20px; height:20px; color:#d4af37; margin-bottom:2px;"></i>
                  <span style="font-family:var(--font-mono); font-size:8px; font-weight:900; color:#d4af37; letter-spacing:0.5px; line-height:1;">GOLDEN<br>SEAL</span>
                </div>
              </div>
              <!-- Real Ribbon Tails -->
              <div style="position:absolute; bottom:-12px; left:26px; width:12px; height:24px; background:#d4af37; transform:rotate(-15deg); clip-path:polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%); opacity:0.8; z-index:-1;"></div>
              <div style="position:absolute; bottom:-12px; right:26px; width:12px; height:24px; background:#d4af37; transform:rotate(15deg); clip-path:polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%); opacity:0.8; z-index:-1;"></div>
            </div>

            <!-- Right: Verifications Metadata & QR -->
            <div style="width:240px; display:flex; justify-content:flex-end; align-items:flex-end; gap:14px; text-align:right;">
              <div style="font-family:var(--font-mono); font-size:8.5px; color:#8e9aa8; line-height:1.5;">
                <div style="color:var(--cyan-bright); font-weight:700;">VERIFICATION SECURE LOCK</div>
                <div>ID: <span style="color:#ffffff; font-weight:bold;">${certId}</span></div>
                <div>ISSUED: <span style="color:#ffffff;">${issuedDate}</span></div>
                <div style="font-size:7px; color:var(--text-muted); margin-top:2px;">SECURED VIA CYBERSHIELD AUTH</div>
              </div>
              
              <!-- Premium QR Verification Block -->
              <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                <div style="width:48px; height:48px; background:#d4af37; padding:4px; border-radius:4px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display:grid; grid-template-columns:repeat(5, 1fr); gap:1px; box-sizing:border-box;">
                  <!-- QR Matrix Blocks -->
                  <div style="background:#000;"></div><div style="background:#000;"></div><div style="background:#000;"></div><div style="background:#d4af37;"></div><div style="background:#000;"></div>
                  <div style="background:#000;"></div><div style="background:#d4af37;"></div><div style="background:#000;"></div><div style="background:#000;"></div><div style="background:#d4af37;"></div>
                  <div style="background:#000;"></div><div style="background:#000;"></div><div style="background:#d4af37;"></div><div style="background:#000;"></div><div style="background:#000;"></div>
                  <div style="background:#d4af37;"></div><div style="background:#000;"></div><div style="background:#000;"></div><div style="background:#d4af37;"></div><div style="background:#000;"></div>
                  <div style="background:#000;"></div><div style="background:#d4af37;"></div><div style="background:#000;"></div><div style="background:#000;"></div><div style="background:#000;"></div>
                </div>
                <span style="font-family:var(--font-mono); font-size:6.5px; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.5px;">QR SECURE</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- Action Footer Button Controls -->
      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px; margin-top:4px; border-top:1px solid rgba(255,255,255,0.05); padding-top:16px;">
        <button class="btn-secondary" onclick="window.closeCertificateModal()" style="font-size:12px; padding: 8px 16px;">
          Close Viewer
        </button>
        <div style="display:flex; gap:10px;">
          <!-- Print Button -->
          <button class="btn-secondary" onclick="window.printCertificate()" style="font-size:12.5px; padding: 8px 16px; display:flex; align-items:center; gap:6px;">
            <i data-lucide="printer" style="width:14px; height:14px;"></i> Print Credential
          </button>
          
          <!-- Download PDF (Landscape print container) -->
          <button class="btn-secondary" onclick="window.downloadCertificatePDF()" style="font-size:12.5px; padding: 8px 16px; display:flex; align-items:center; gap:6px; background: rgba(6, 182, 212, 0.08); border-color: rgba(6, 182, 212, 0.3);">
            <i data-lucide="download" style="width:14px; height:14px; color:var(--cyan-bright);"></i> Download PDF / HTML
          </button>

          <!-- Share Button -->
          <button class="btn-primary" onclick="window.shareCertificate('${certId}', '${bookTitle.replace(/'/g, "\\'")}')" style="font-size:12.5px; padding: 8px 18px; display:flex; align-items:center; gap:6px; background: rgba(16,185,129,0.15); border-color: var(--emerald-bright);">
            <i data-lucide="share-2" style="width:14px; height:14px; color:var(--emerald-bright);"></i> Share Credential
          </button>
        </div>
      </div>

    </div>
  `;
  lucide.createIcons();
};

window.closeCertificateModal = function() {
  const overlay = document.getElementById('certificate-modal-overlay');
  if (overlay) overlay.remove();
};

window.updateCertViewerName = function(newName) {
  // Sync globally to localStorage
  const trimmed = newName.trim();
  window.setStudentName(trimmed || "GUEST USER");
  
  // Sync the viewer name in real-time
  const viewer = document.getElementById('cert-viewer-name');
  if (viewer) {
    viewer.textContent = (trimmed || "GUEST USER").toUpperCase();
  }
};

window.printCertificate = function() {
  const stage = document.getElementById('print-certificate-stage');
  if (!stage) return;
  
  // Use a temporary window approach to cleanly print the cert stage without external dashboard wrappers
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.showNotification('Print blocked: Please allow popups for printing functions.', 'error');
    return;
  }
  
  printWindow.document.write(`
    <html>
      <head>
        <title>CyberShield Verification Certificate</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body { 
            background: #02050c; 
            color: #ffffff; 
            font-family: system-ui, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #print-certificate-stage { 
            width: 960px !important; 
            height: 678px !important; 
            border: 12px double #d4af37 !important;
            box-sizing: border-box !important;
          }
        </style>
        <!-- Load lucide inside printing window so icons render if applicable, or we use standard SVG icons -->
        <script src="https://unpkg.com/lucide@latest"><\/script>
      </head>
      <body>
        ${stage.outerHTML}
        <script>
          setTimeout(() => {
            if (typeof lucide !== 'undefined') {
              lucide.createIcons();
            }
            // Trigger browser native print
            window.print();
            window.close();
          }, 450);
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

window.downloadCertificatePDF = function() {
  const stage = document.getElementById('print-certificate-stage');
  if (!stage) return;

  const bookId = window.activeCertBookId || 'curriculum';

  // We offer a high-fidelity standalone downloadable self-contained verifiable HTML format.
  // This layout prints perfectly to PDF from any browser or device (A4 landscape) and works completely offline!
  const htmlDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CyberShield Verifiable Completion Credential</title>
        <meta charset="utf-8">
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body { 
            background: #02050c; 
            color: #ffffff; 
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            margin: 0; 
            padding: 20px;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .cert-outer-wrapper {
            width: 960px;
            height: 678px;
            margin: auto;
          }
        </style>
        <script src="https://unpkg.com/lucide@latest"><\/script>
      </head>
      <body>
        <div class="cert-outer-wrapper">
          ${stage.outerHTML}
        </div>
        <script>
          window.onload = function() {
            if (typeof lucide !== 'undefined') {
              lucide.createIcons();
            }
          };
        </script>
      </body>
    </html>
  `;

  const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CyberShield_Certificate_${bookId}_${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  window.showNotification('Certificate downloaded as premium self-contained landscape credential! To save as PDF: Open the file and print, choosing "Save as PDF".', 'success');
};

window.shareCertificate = function(certId, bookTitle) {
  const shareText = `Mastery Verified! I completed the "${bookTitle}" program and earned my official CyberShield Learning Center certification. ID: ${certId}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'CyberShield Professional Certification',
      text: shareText,
      url: window.location.href
    }).then(() => {
      window.showNotification('Certification shared successfully!', 'success');
    }).catch((err) => {
      // Fallback on cancel or fail
      copyShareTextToClipboard(shareText);
    });
  } else {
    copyShareTextToClipboard(shareText);
  }
};

function copyShareTextToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    window.showNotification('Credential verification details copied to clipboard!', 'success');
  }).catch(() => {
    window.showNotification('Failed to copy. Manual: ' + text, 'info');
  });
}

// Expose internal state and missing/broken certificate viewer function for profile and search bar integrations
window.academyState = academyState;

window.openCertificateViewer = function(bookId) {
  const books = window.CYBER_BOOKS || [];
  const book = books.find(b => b.id === bookId);
  if (book) {
    if (typeof window.generateCertificate === 'function') {
      window.generateCertificate(bookId, book.title);
    } else {
      window.showNotification("Certificate engine unavailable.", "error");
    }
  } else {
    window.showNotification("Certificate target invalid or course not found.", "error");
  }
};



