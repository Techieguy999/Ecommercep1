/* ============================================================
   DEVTECH FASHION — LOGIN JAVASCRIPT (Credentials Only)
   Author: DevTech Solutions (Purna Sai & Prabhas)
   Version: 1.0.0
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm      = document.getElementById('login-form');
  const emailInput     = document.getElementById('email');
  const passwordInput  = document.getElementById('password');
  const emailError     = document.getElementById('email-error');
  const passwordError  = document.getElementById('password-error');
  const submitBtn      = document.getElementById('login-submit-btn');
  const passwordToggle = document.getElementById('password-toggle');
  
  const eyeOffIcon = passwordToggle.querySelector('.eye-off');
  const eyeOnIcon  = passwordToggle.querySelector('.eye-on');

  // Set current year in footer
  const footerYear = document.getElementById('footer-year');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // ============================================================
  // PASSWORD VISIBILITY TOGGLE
  // ============================================================
  passwordToggle.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    
    if (isPassword) {
      eyeOffIcon.style.display = 'none';
      eyeOnIcon.style.display = 'block';
      passwordToggle.setAttribute('aria-label', 'Hide password');
    } else {
      eyeOffIcon.style.display = 'block';
      eyeOnIcon.style.display = 'none';
      passwordToggle.setAttribute('aria-label', 'Show password');
    }
  });

  // ============================================================
  // FORM VALIDATIONS
  // ============================================================
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(inputEl, errorEl, message) {
    inputEl.classList.add('input-error');
    errorEl.textContent = message;
    errorEl.style.opacity = '1';
  }

  function clearError(inputEl, errorEl) {
    inputEl.classList.remove('input-error');
    errorEl.textContent = '';
    errorEl.style.opacity = '0';
  }

  // Clear errors dynamically on input
  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('input-error')) {
      clearError(emailInput, emailError);
    }
  });

  passwordInput.addEventListener('input', () => {
    if (passwordInput.classList.contains('input-error')) {
      clearError(passwordInput, passwordError);
    }
  });

  // ============================================================
  // EMAIL / PASSWORD LOGIN SUBMIT
  // ============================================================
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let isValid = true;

    // Validate email
    if (!email) {
      showError(emailInput, emailError, 'Email address is required.');
      isValid = false;
    } else if (!validateEmail(email)) {
      showError(emailInput, emailError, 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearError(emailInput, emailError);
    }

    // Validate password
    if (!password) {
      showError(passwordInput, passwordError, 'Password is required.');
      isValid = false;
    } else if (password.length < 8) {
      showError(passwordInput, passwordError, 'Password must be at least 8 characters.');
      isValid = false;
    } else {
      clearError(passwordInput, passwordError);
    }

    if (isValid) {
      const submitTextSpan = submitBtn.querySelector('span');
      submitBtn.disabled = true;
      if (submitTextSpan) submitTextSpan.textContent = 'Verifying account...';

      setTimeout(() => {
        let userRole = 'customer';
        let userName = 'Member User';

        // Check if admin credentials
        if (email === 'admin@devtech.com' && password === 'admin1234') {
          userRole = 'admin';
          userName = 'Admin (Vendor)';
        }

        // Store user session in localStorage
        localStorage.setItem('dtf_user', JSON.stringify({
          email: email,
          name: userName,
          role: userRole
        }));

        if (submitTextSpan) submitTextSpan.textContent = 'Success! Redirecting...';

        setTimeout(() => {
          if (userRole === 'admin') {
            window.location.href = 'admin-dashboard.html';
          } else {
            window.location.href = '../index.html';
          }
        }, 1000);
      }, 1500);
    }
  });
});
