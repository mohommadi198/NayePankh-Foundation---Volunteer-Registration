// ============================================
// VOLUNTEER REGISTRATION SYSTEM
// JavaScript Core Functionality
// ============================================

// ============================================
// GLOBAL STATE & CONFIGURATION
// ============================================

const VOLUNTEERS_STORAGE_KEY = 'nayepankh_volunteers';
const COUNTERS_ANIMATED = new Set();

let allVolunteers = [];

// ============================================
// DOM ELEMENT CACHING
// ============================================

const dom = {
    // Navigation
    hamburger: document.getElementById('hamburger'),
    navMenu: document.getElementById('navMenu'),
    navLinks: document.querySelectorAll('.nav-link'),

    // Hero & CTA
    ctaButton: document.getElementById('ctaButton'),

    // Form
    form: document.getElementById('volunteerForm'),
    fullName: document.getElementById('fullName'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    age: document.getElementById('age'),
    city: document.getElementById('city'),
    interest: document.getElementById('interest'),
    motivation: document.getElementById('motivation'),
    consent: document.getElementById('consent'),
    skillCheckboxes: document.querySelectorAll('input[name="skills"]'),
    availabilityRadios: document.querySelectorAll('input[name="availability"]'),

    // Modal
    successModal: document.getElementById('successModal'),
    closeModal: document.getElementById('closeModal'),
    modalMessage: document.getElementById('modalMessage'),
    modalDetails: document.getElementById('modalDetails'),

    // Dashboard
    volunteersGrid: document.getElementById('volunteersGrid'),
    searchInput: document.getElementById('searchInput'),
    skillFilter: document.getElementById('skillFilter'),
    volunteerCount: document.getElementById('volunteerCount'),

    // Stats
    counters: document.querySelectorAll('.counter'),
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load volunteers from localStorage
    loadVolunteersFromStorage();

    // Set up event listeners
    setupEventListeners();

    // Render volunteers dashboard
    renderVolunteers(allVolunteers);

    // Initialize counters animation on scroll
    setupCounterAnimation();

    // Close mobile menu on link click
    setupMobileMenuClose();
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function setupEventListeners() {
    // Navigation hamburger
    dom.hamburger.addEventListener('click', toggleMobileMenu);

    // CTA Button
    dom.ctaButton.addEventListener('click', () => {
        scrollToSection('registration');
    });

    // Form submission
    dom.form.addEventListener('submit', handleFormSubmit);

    // Modal close
    dom.closeModal.addEventListener('click', () => {
        closeSuccessModal();
        scrollToSection('volunteers');
    });

    // Search and filter
    dom.searchInput.addEventListener('input', handleSearch);
    dom.skillFilter.addEventListener('change', handleSkillFilter);

    // Form field validation on blur
    dom.fullName.addEventListener('blur', () => validateField('fullName'));
    dom.email.addEventListener('blur', () => validateField('email'));
    dom.phone.addEventListener('blur', () => validateField('phone'));
    dom.age.addEventListener('blur', () => validateField('age'));
    dom.city.addEventListener('blur', () => validateField('city'));
}

// ============================================
// MOBILE MENU FUNCTIONALITY
// ============================================

function toggleMobileMenu() {
    dom.hamburger.classList.toggle('active');
    dom.navMenu.classList.toggle('active');
}

function setupMobileMenuClose() {
    dom.navLinks.forEach(link => {
        link.addEventListener('click', () => {
            dom.hamburger.classList.remove('active');
            dom.navMenu.classList.remove('active');
        });
    });
}

// ============================================
// SMOOTH SCROLL NAVIGATION
// ============================================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ============================================
// FORM VALIDATION
// ============================================

// Validation rules and error messages
const validationRules = {
    fullName: {
        required: true,
        minLength: 3,
        pattern: /^[a-zA-Z\s]+$/,
        errorMessage: 'Please enter a valid name (letters and spaces only)'
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errorMessage: 'Please enter a valid email address'
    },
    phone: {
        required: true,
        pattern: /^[\d\s+\-()]{10,}$/,
        errorMessage: 'Please enter a valid phone number'
    },
    age: {
        required: true,
        minValue: 16,
        maxValue: 80,
        errorMessage: 'Age must be between 16 and 80'
    },
    city: {
        required: true,
        minLength: 2,
        errorMessage: 'Please enter a valid city name'
    },
    interest: {
        required: true,
        errorMessage: 'Please select an area of interest'
    },
    motivation: {
        required: true,
        minLength: 10,
        errorMessage: 'Please write at least 10 characters about your motivation'
    }
};

/**
 * Validates individual form fields
 */
function validateField(fieldName) {
    const field = dom[fieldName];
    const rule = validationRules[fieldName];
    const errorElement = document.getElementById(`${fieldName}Error`);

    if (!field || !rule) return true;

    let isValid = true;
    let errorMessage = '';

    // Check if required
    if (rule.required && !field.value.trim()) {
        isValid = false;
        errorMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    // Check minimum length
    else if (rule.minLength && field.value.length < rule.minLength) {
        isValid = false;
        errorMessage = rule.errorMessage;
    }
    // Check minimum value (for numbers)
    else if (rule.minValue !== undefined && parseInt(field.value) < rule.minValue) {
        isValid = false;
        errorMessage = rule.errorMessage;
    }
    // Check maximum value (for numbers)
    else if (rule.maxValue !== undefined && parseInt(field.value) > rule.maxValue) {
        isValid = false;
        errorMessage = rule.errorMessage;
    }
    // Check pattern (regex)
    else if (rule.pattern && field.value && !rule.pattern.test(field.value)) {
        isValid = false;
        errorMessage = rule.errorMessage;
    }

    // Update UI based on validation result
    const parentGroup = field.closest('.form-group');
    if (isValid) {
        parentGroup?.classList.remove('error');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    } else {
        parentGroup?.classList.add('error');
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
    }

    return isValid;
}

/**
 * Validates skills selection
 */
function validateSkills() {
    const checkedSkills = Array.from(dom.skillCheckboxes).filter(cb => cb.checked);
    const errorElement = document.getElementById('skillsError');

    if (checkedSkills.length === 0) {
        errorElement.textContent = 'Please select at least one skill';
        errorElement.classList.add('show');
        return false;
    }

    errorElement.textContent = '';
    errorElement.classList.remove('show');
    return true;
}

/**
 * Validates availability selection
 */
function validateAvailability() {
    const selectedAvailability = Array.from(dom.availabilityRadios).some(rb => rb.checked);
    const errorElement = document.getElementById('availabilityError');

    if (!selectedAvailability) {
        errorElement.textContent = 'Please select your availability';
        errorElement.classList.add('show');
        return false;
    }

    errorElement.textContent = '';
    errorElement.classList.remove('show');
    return true;
}

/**
 * Validates consent checkbox
 */
function validateConsent() {
    const errorElement = document.getElementById('consentError');

    if (!dom.consent.checked) {
        errorElement.textContent = 'You must agree to the terms and conditions';
        errorElement.classList.add('show');
        return false;
    }

    errorElement.textContent = '';
    errorElement.classList.remove('show');
    return true;
}

/**
 * Performs full form validation
 */
function validateForm() {
    let isValid = true;

    // Validate all text fields
    Object.keys(validationRules).forEach(fieldName => {
        if (!validateField(fieldName)) {
            isValid = false;
        }
    });

    // Validate skills
    if (!validateSkills()) {
        isValid = false;
    }

    // Validate availability
    if (!validateAvailability()) {
        isValid = false;
    }

    // Validate consent
    if (!validateConsent()) {
        isValid = false;
    }

    return isValid;
}

// ============================================
// FORM SUBMISSION
// ============================================

function handleFormSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
        console.log('Form validation failed');
        return;
    }

    // Collect form data
    const volunteerData = {
        id: Date.now(),
        fullName: dom.fullName.value.trim(),
        email: dom.email.value.trim(),
        phone: dom.phone.value.trim(),
        age: parseInt(dom.age.value),
        city: dom.city.value.trim(),
        skills: Array.from(dom.skillCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value),
        interest: dom.interest.value,
        availability: Array.from(dom.availabilityRadios)
            .find(rb => rb.checked)?.value,
        motivation: dom.motivation.value.trim(),
        registeredAt: new Date().toLocaleString('en-IN')
    };

    // Save to localStorage
    saveVolunteer(volunteerData);

    // Show success modal
    showSuccessModal(volunteerData);

    // Reset form
    dom.form.reset();

    // Clear validation errors
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.textContent = '';
        msg.classList.remove('show');
    });
}

// ============================================
// LOCAL STORAGE MANAGEMENT
// ============================================

/**
 * Saves a new volunteer to localStorage and updates state
 */
function saveVolunteer(volunteerData) {
    allVolunteers.push(volunteerData);
    localStorage.setItem(VOLUNTEERS_STORAGE_KEY, JSON.stringify(allVolunteers));
}

/**
 * Loads all volunteers from localStorage
 */
function loadVolunteersFromStorage() {
    try {
        const stored = localStorage.getItem(VOLUNTEERS_STORAGE_KEY);
        allVolunteers = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading volunteers from storage:', error);
        allVolunteers = [];
    }
}

// ============================================
// SUCCESS MODAL
// ============================================

function showSuccessModal(volunteerData) {
    // Update modal content
    dom.modalMessage.textContent = `Welcome aboard, ${volunteerData.fullName}! Your registration is complete.`;

    // Create details HTML
    const detailsHTML = `
        <p><strong>Email:</strong> ${volunteerData.email}</p>
        <p><strong>Area of Interest:</strong> ${volunteerData.interest}</p>
        <p><strong>Skills:</strong> ${volunteerData.skills.join(', ')}</p>
    `;
    dom.modalDetails.innerHTML = detailsHTML;

    // Show modal with animation
    dom.successModal.classList.remove('hidden');

    // Update volunteer count
    updateVolunteerCount();
}

function closeSuccessModal() {
    dom.successModal.classList.add('hidden');
}

// Close modal when clicking outside
dom.successModal.addEventListener('click', (e) => {
    if (e.target === dom.successModal) {
        closeSuccessModal();
    }
});

// ============================================
// VOLUNTEER DASHBOARD
// ============================================

/**
 * Renders volunteers based on current filters
 */
function renderVolunteers(volunteersToDisplay) {
    if (volunteersToDisplay.length === 0) {
        dom.volunteersGrid.innerHTML = `
            <div class="empty-state">
                <p>No volunteers registered yet. Be the first one!</p>
            </div>
        `;
        dom.volunteerCount.textContent = '0';
        return;
    }

    // Create volunteer cards HTML
    const volunteerCardsHTML = volunteersToDisplay
        .reverse()
        .map(volunteer => createVolunteerCard(volunteer))
        .join('');

    dom.volunteersGrid.innerHTML = volunteerCardsHTML;
    dom.volunteerCount.textContent = volunteersToDisplay.length;
}

/**
 * Creates HTML for a single volunteer card
 */
function createVolunteerCard(volunteer) {
    const skillTags = volunteer.skills
        .map(skill => `<div class="skill-tag">${skill}</div>`)
        .join('');

    return `
        <div class="volunteer-card">
            <div class="volunteer-header">
                <div class="volunteer-name">${escapeHTML(volunteer.fullName)}</div>
                <div class="volunteer-city">📍 ${escapeHTML(volunteer.city)}</div>
            </div>

            <div class="volunteer-info">
                <div class="info-item">
                    <span class="info-label">Age:</span>
                    <span class="info-value">${volunteer.age} years</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${escapeHTML(volunteer.email)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${escapeHTML(volunteer.phone)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Interest:</span>
                    <span class="info-value">${volunteer.interest}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Available:</span>
                    <span class="info-value">${volunteer.availability}</span>
                </div>
            </div>

            <div class="skills-tags">
                ${skillTags}
            </div>

            <div class="info-item">
                <span class="info-label">Registered:</span>
                <span class="info-value">${volunteer.registeredAt}</span>
            </div>
        </div>
    `;
}

/**
 * Escapes HTML special characters for security
 */
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Updates volunteer count display
 */
function updateVolunteerCount() {
    dom.volunteerCount.textContent = allVolunteers.length;
}

// ============================================
// SEARCH & FILTER FUNCTIONALITY
// ============================================

/**
 * Handles volunteer search by name
 */
function handleSearch() {
    const searchTerm = dom.searchInput.value.toLowerCase().trim();
    const skillFilter = dom.skillFilter.value;

    let filtered = allVolunteers;

    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(volunteer =>
            volunteer.fullName.toLowerCase().includes(searchTerm)
        );
    }

    // Filter by skill
    if (skillFilter) {
        filtered = filtered.filter(volunteer =>
            volunteer.skills.includes(skillFilter)
        );
    }

    renderVolunteers(filtered);
}

/**
 * Handles skill filter change
 */
function handleSkillFilter() {
    handleSearch();
}

// ============================================
// ANIMATED COUNTERS
// ============================================

function setupCounterAnimation() {
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !COUNTERS_ANIMATED.has(entry.target)) {
                COUNTERS_ANIMATED.add(entry.target);
                animateCounter(entry.target);
            }
        });
    }, observerOptions);

    dom.counters.forEach(counter => {
        observer.observe(counter);
    });
}

/**
 * Animates a counter from 0 to its target value
 */
function animateCounter(counterElement) {
    const targetValue = parseInt(counterElement.dataset.target);
    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    function updateCounter() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Use easeOutQuad for smooth animation
        const easedProgress = 1 - Math.pow(1 - progress, 2);
        const currentValue = Math.floor(easedProgress * targetValue);

        counterElement.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }

    updateCounter();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounces function calls for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// ACCESSIBILITY & KEYBOARD NAVIGATION
// ============================================

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !dom.successModal.classList.contains('hidden')) {
        closeSuccessModal();
    }
});

// ============================================
// PAGE LOAD COMPLETED
// ============================================

console.log('Volunteer Registration System initialized successfully');
console.log(`Loaded ${allVolunteers.length} volunteers from storage`);
