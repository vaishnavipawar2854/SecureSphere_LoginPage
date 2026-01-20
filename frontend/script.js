/**
 * SecureSphere - Main JavaScript
 * Frontend authentication and UX enhancements
 */

// ===========================
// CONFIGURATION
// ===========================

// Use production backend URL if on production, otherwise use localhost
const API_URL = window.location.hostname === 'secure-sphere-login-page.vercel.app' 
    ? 'https://secure-sphere-login-page-ueo2.vercel.app/api/auth'
    : 'http://localhost:5000/api/auth';

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Validate email format
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Show error message in form field
 */
function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

/**
 * Clear all error messages
 */
function clearErrors(...elements) {
    elements.forEach(el => {
        if (el) el.classList.remove('show');
    });
}

/**
 * Create and show loading overlay
 */
function showLoading(message = 'Processing...') {
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p class="loading-message">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    overlay.querySelector('.loading-message').textContent = message;
    overlay.classList.add('active');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

/**
 * Set button loading state
 */
function setButtonLoading(button, loading, loadingText = 'Processing...') {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `<span class="spinner"></span>${loadingText}`;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || button.textContent;
    }
}

/**
 * Add ripple effect to button
 */
function createRipple(event, button) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// ===========================
// TOAST NOTIFICATIONS
// ===========================

class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    show(type, title, message, duration = 4000) {
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ'}</span>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <span class="toast-close">×</span>
        `;

        this.container.appendChild(toast);

        // Close button handler
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.remove(toast);
        });

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => this.remove(toast), duration);
        }

        return toast;
    }

    remove(toast) {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 400);
    }

    success(title, message, duration) {
        return this.show('success', title, message, duration);
    }

    error(title, message, duration) {
        return this.show('error', title, message, duration);
    }

    info(title, message, duration) {
        return this.show('info', title, message, duration);
    }
}

// Initialize toast manager
const toast = new ToastManager();

// ===========================
// PASSWORD TOGGLE
// ===========================

function initPasswordToggle() {
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input && input.type === 'password') {
                input.type = 'text';
                this.textContent = '👁️';
            } else if (input) {
                input.type = 'password';
                this.textContent = '👁️‍🗨️';
            }
        });
    });
}

// ===========================
// LIVE FORM VALIDATION
// ===========================

function setupLiveValidation(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        // Validate on blur
        input.addEventListener('blur', function() {
            validateField(this);
        });

        // Clear error on input
        input.addEventListener('input', function() {
            const errorElement = document.getElementById(this.id + 'Error');
            if (errorElement) {
                errorElement.classList.remove('show');
            }
            this.style.borderColor = '';
        });
    });
}

function validateField(input) {
    const errorElement = document.getElementById(input.id + 'Error');
    if (!errorElement) return true;

    const value = input.value.trim();
    let isValid = true;
    let message = '';

    // Empty check
    if (!value && input.hasAttribute('required')) {
        isValid = false;
        message = `${input.placeholder || 'This field'} is required`;
    }
    // Email validation
    else if (input.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        message = 'Please enter a valid email address';
    }
    // Password length
    else if (input.type === 'password' && value && value.length < 6) {
        isValid = false;
        message = 'Password must be at least 6 characters';
    }
    // Name length
    else if (input.id === 'name' && value && value.length < 2) {
        isValid = false;
        message = 'Name must be at least 2 characters';
    }

    if (!isValid) {
        showError(errorElement, message);
        input.style.borderColor = '#ef4444';
    } else {
        errorElement.classList.remove('show');
        input.style.borderColor = '';
    }

    return isValid;
}

// ===========================
// AUTHENTICATION CHECK
// ===========================

async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const response = await fetch(`${API_URL}/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            return true;
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return false;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}

async function redirectIfAuthenticated() {
    if (await checkAuthStatus()) {
        window.location.href = 'dashboard.html';
    }
}

async function requireAuthentication() {
    if (!(await checkAuthStatus())) {
        window.location.href = 'index.html';
    }
}

// ===========================
// LOGIN PAGE
// ===========================

function initLoginPage() {
    // Check if already logged in
    redirectIfAuthenticated();

    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const submitButton = loginForm.querySelector('.btn-primary');

    // Setup live validation
    setupLiveValidation('loginForm');

    // Initialize password toggle
    initPasswordToggle();

    // Add ripple effect to button
    submitButton.addEventListener('click', function(e) {
        if (!this.disabled) {
            createRipple(e, this);
        }
    });

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors(emailError, passwordError);

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Frontend validation
        let isValid = true;

        if (!email) {
            showError(emailError, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError(emailError, 'Please enter a valid email');
            isValid = false;
        }

        if (!password) {
            showError(passwordError, 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            showError(passwordError, 'Password must be at least 6 characters');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state
        setButtonLoading(submitButton, true, 'Logging in...');

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Login successful
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Show success
                submitButton.innerHTML = '✓ Success!';
                submitButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                
                toast.success('Success!', 'Login successful. Redirecting...', 2000);
                
                // Redirect after animation (use replace to prevent back navigation)
                setTimeout(() => {
                    window.location.replace('dashboard.html');
                }, 1000);
            } else {
                // Login failed
                showError(passwordError, data.message || 'Login failed. Please try again.');
                toast.error('Login Failed', data.message || 'Invalid credentials');
                setButtonLoading(submitButton, false);
            }
        } catch (error) {
            console.error('Login error:', error);
            showError(passwordError, 'Network error. Please check your connection.');
            toast.error('Error', 'Network error. Please try again.');
            setButtonLoading(submitButton, false);
        }
    });
}

// ===========================
// REGISTER PAGE
// ===========================

function initRegisterPage() {
    // Check if already logged in
    redirectIfAuthenticated();

    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const successMessage = document.getElementById('successMessage');
    const submitButton = registerForm.querySelector('.btn-primary');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    // Setup live validation
    setupLiveValidation('registerForm');

    // Initialize password toggles
    initPasswordToggle();

    // Add ripple effect to button
    submitButton.addEventListener('click', function(e) {
        if (!this.disabled) {
            createRipple(e, this);
        }
    });

    // Live password match validation
    confirmPasswordInput.addEventListener('input', function() {
        if (this.value && passwordInput.value !== this.value) {
            showError(confirmPasswordError, 'Passwords do not match');
        } else {
            confirmPasswordError.classList.remove('show');
        }
    });

    // Handle form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors(nameError, emailError, passwordError, confirmPasswordError);
        successMessage.classList.remove('show');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Frontend validation
        let isValid = true;

        if (!name) {
            showError(nameError, 'Name is required');
            isValid = false;
        } else if (name.length < 2) {
            showError(nameError, 'Name must be at least 2 characters');
            isValid = false;
        }

        if (!email) {
            showError(emailError, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError(emailError, 'Please enter a valid email');
            isValid = false;
        }

        if (!password) {
            showError(passwordError, 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            showError(passwordError, 'Password must be at least 6 characters');
            isValid = false;
        }

        if (!confirmPassword) {
            showError(confirmPasswordError, 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError(confirmPasswordError, 'Passwords do not match');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state
        setButtonLoading(submitButton, true, 'Creating Account...');

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    name, 
                    email, 
                    password,
                    confirmPassword 
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Registration successful
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Show success message
                successMessage.textContent = 'Account created successfully! Redirecting...';
                successMessage.classList.add('show');
                submitButton.innerHTML = '✓ Account Created!';
                submitButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                
                toast.success('Success!', 'Account created successfully!', 2000);
                
                registerForm.reset();

                // Redirect after animation (use replace to prevent back navigation)
                setTimeout(() => {
                    window.location.replace('dashboard.html');
                }, 1500);
            } else {
                // Registration failed
                if (data.message && data.message.includes('Email already registered')) {
                    showError(emailError, data.message);
                } else if (data.errors && data.errors.length > 0) {
                    data.errors.forEach(err => {
                        if (err.param === 'name') showError(nameError, err.msg);
                        if (err.param === 'email') showError(emailError, err.msg);
                        if (err.param === 'password') showError(passwordError, err.msg);
                        if (err.param === 'confirmPassword') showError(confirmPasswordError, err.msg);
                    });
                } else {
                    showError(emailError, data.message || 'Registration failed. Please try again.');
                }
                
                toast.error('Registration Failed', data.message || 'Please check your information');
                setButtonLoading(submitButton, false);
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError(emailError, 'Network error. Please check your connection.');
            toast.error('Error', 'Network error. Please try again.');
            setButtonLoading(submitButton, false);
        }
    });
}

// ===========================
// DASHBOARD PAGE
// ===========================

function initDashboardPage() {
    // Require authentication
    requireAuthentication();

    // Load user profile
    loadUserProfile();

    // Initialize dashboard features
    initDashboardNavigation();
    updateDateTime();
    animateStats();
    
    // Update time every minute
    setInterval(updateDateTime, 60000);

    // Prevent back navigation - add logout confirmation
    history.pushState(null, null, location.href);
    window.onpopstate = function() {
        history.pushState(null, null, location.href);
        if (confirm('Do you want to logout?')) {
            logout();
        }
    };
}

// Dashboard Navigation
function initDashboardNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) {
                switchSection(section);
            }
        });
    });
}

function switchSection(sectionName) {
    // Remove active class from all nav items and sections
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });

    // Add active class to selected nav item and section
    const navItem = document.querySelector(`[data-section="${sectionName}"]`);
    const section = document.getElementById(`${sectionName}-section`);
    
    if (navItem) navItem.classList.add('active');
    if (section) {
        section.classList.add('active');
        section.style.animation = 'slideIn 0.4s ease-out';
    }
}

// Update date and time
function updateDateTime() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Animate statistics
function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        if (stat.id === 'statSessions') {
            animateValue(stat, 0, 1247, 1500);
        }
    });
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Toggle sidebar for mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-active');
    }
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isDark = !document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    toast.info('Theme Changed', `Switched to ${isDark ? 'dark' : 'light'} mode`, 2000);
}

// Export data
function exportData() {
    toast.info('Exporting', 'Preparing your data export...', 3000);
    setTimeout(() => {
        toast.success('Export Ready', 'Your data has been exported successfully', 3000);
    }, 2000);
}

// Download report
function downloadReport() {
    toast.info('Generating Report', 'Please wait...', 2000);
    setTimeout(() => {
        toast.success('Report Ready', 'Your report is ready to download', 3000);
    }, 1500);
}

// Edit profile
function editProfile() {
    switchSection('profile');
    toast.info('Edit Mode', 'You can now edit your profile', 2000);
}

async function loadUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
                displayUserProfile(data.user);
                updateActivityTimestamps();
            } else {
                redirectToLogin();
            }
        } else {
            console.log('Authentication failed:', response.status);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            redirectToLogin();
        }
    } catch (error) {
        console.error('Profile load error:', error);
        toast.error('Error', 'Failed to load profile');
        redirectToLogin();
    }
}

function displayUserProfile(user) {
    // Get user initials
    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    
    // Update all avatar instances
    const avatars = ['userAvatar', 'topbarAvatar', 'sidebarAvatar', 'profileAvatar'];
    avatars.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = initials;
    });

    // Update user name instances
    const userNameElement = document.getElementById('userName');
    const sidebarNameElement = document.getElementById('sidebarUserName');
    const firstName = user.name.split(' ')[0];
    
    if (userNameElement) userNameElement.textContent = firstName;
    if (sidebarNameElement) sidebarNameElement.textContent = firstName;

    // Update profile details
    const profileElements = {
        userFullName: user.name,
        profileFullName: user.name,
        userEmail: user.email,
        profileEmail: user.email
    };

    Object.entries(profileElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    // Format and display dates
    if (user.createdAt || user.registeredAt) {
        const regDate = new Date(user.createdAt || user.registeredAt);
        const memberSinceElement = document.getElementById('memberSince');
        if (memberSinceElement) {
            memberSinceElement.textContent = regDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Calculate account age
        const accountAgeElement = document.getElementById('accountAge');
        if (accountAgeElement) {
            const ageInDays = Math.floor((Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24));
            if (ageInDays < 30) {
                accountAgeElement.textContent = `${ageInDays} days`;
            } else if (ageInDays < 365) {
                accountAgeElement.textContent = `${Math.floor(ageInDays / 30)} months`;
            } else {
                accountAgeElement.textContent = `${Math.floor(ageInDays / 365)} years`;
            }
        }
    }

    // Last login
    const lastLoginElement = document.getElementById('lastLogin');
    if (lastLoginElement) {
        if (user.lastLogin) {
            const lastLogin = new Date(user.lastLogin);
            lastLoginElement.textContent = lastLogin.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            lastLoginElement.textContent = 'Just now';
        }
    }

    // Update total logins (simulated for now)
    const totalLoginsElement = document.getElementById('totalLogins');
    if (totalLoginsElement) {
        totalLoginsElement.textContent = Math.floor(Math.random() * 100) + 50;
    }
}

function updateActivityTimestamps() {
    const now = new Date();
    const loginTimeElements = ['loginTime', 'activityLoginTime'];
    
    loginTimeElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = 'Just now';
        }
    });
}

function redirectToLogin() {
    window.location.href = 'index.html';
}

async function logout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }

    const token = localStorage.getItem('token');
    showLoading('Logging out...');

    try {
        await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        toast.success('Logged Out', 'You have been logged out successfully', 2000);

        // Redirect after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error('Logout error:', error);
        // Still clear and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    } finally {
        hideLoading();
    }
}

/**
 * Handle back navigation with logout confirmation
 */
function handleBackNavigation() {
    if (confirm('Do you want to logout?')) {
        logout();
    }
}

function refreshPage() {
    showLoading('Refreshing dashboard...');
    
    // Reload user profile
    loadUserProfile();
    
    // Animate stats again
    setTimeout(() => {
        animateStats();
        hideLoading();
        toast.success('Refreshed', 'Dashboard data updated', 2000);
    }, 800);
}

// ===========================
// PAGE INITIALIZATION
// ===========================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);

    // Initialize appropriate page
    if (page === 'index.html' || page === '') {
        initLoginPage();
    } else if (page === 'register.html') {
        initRegisterPage();
    } else if (page === 'dashboard.html') {
        initDashboardPage();
    }

    // Add smooth page transition
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '1';
    }, 10);
});

// Make functions globally available
window.logout = logout;
window.handleBackNavigation = handleBackNavigation;
window.refreshPage = refreshPage;
window.switchSection = switchSection;
window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.exportData = exportData;
window.downloadReport = downloadReport;
window.editProfile = editProfile;
