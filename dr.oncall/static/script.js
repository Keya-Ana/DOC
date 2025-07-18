document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle Functionality
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme') || 
                       (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    // Apply the saved theme
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.checked = true;
    }

    // Theme toggle event
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });

    // Toggle between login and signup forms
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    showSignup.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });

    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Password toggle visibility
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

    // Password strength indicator
    const passwordInput = document.getElementById('signup-password');
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        
        // Reset all bars
        strengthBars.forEach(bar => {
            bar.style.backgroundColor = '';
        });
        
        // Update bars based on strength
        for (let i = 0; i < strength.level; i++) {
            strengthBars[i].style.backgroundColor = strength.color;
        }
        
        strengthText.textContent = strength.text;
        strengthText.style.color = strength.color;
    });

    function calculatePasswordStrength(password) {
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        const length = password.length;
        
        let strength = 0;
        
        if (length > 0) strength += 1;
        if (length >= 8) strength += 1;
        if (hasLower && hasUpper) strength += 1;
        if (hasNumber) strength += 1;
        if (hasSpecial) strength += 1;
        
        if (strength <= 2) {
            return {
                level: strength,
                color: 'var(--clr-danger)',
                text: 'Weak'
            };
        } else if (strength <= 4) {
            return {
                level: strength,
                color: 'var(--clr-warning)',
                text: 'Medium'
            };
        } else {
            return {
                level: strength,
                color: 'var(--clr-success)',
                text: 'Strong'
            };
        }
    }

    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Here you would typically send this data to your backend
        console.log('Login attempt with:', { email, password });
        alert('Login functionality would connect to your backend API');
    });

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        
        if (password !== confirm) {
            alert('Passwords do not match!');
            return;
        }
        
        // Here you would typically send this data to your backend
        console.log('Signup attempt with:', { name, email, password });
        alert('Signup functionality would connect to your backend API');
    });
});