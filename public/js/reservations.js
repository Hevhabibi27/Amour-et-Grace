// public/js/reservations.js

// === Reservation Form Logic ===
// Replaces the old setTimeout fake with a real fetch() to POST /api/reservations.
// Aligned with:
//   - api/reservations/index.js (expects: name, email, phone, guest_count, date, time, type, message, captcha_token)
//   - api/_lib/validate.js (type-dependent hours, restaurant closed Mondays)
//   - api/_lib/captcha.js (Cloudflare Turnstile token)

document.addEventListener('submit', async function (e) {
    if (!e.target || e.target.id !== 'premiumReservationForm') return;
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.prem-submit-btn');
    const messageDiv = form.querySelector('#form-message');
    const originalBtnText = submitBtn.textContent;

    // ── 1. Client-side validation (UX only — backend re-validates everything) ──
    let isValid = true;

    // Reset previous error states
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.classList.remove('error');
    });

    // Check required fields
    form.querySelectorAll('input[required], select[required]').forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        }
    });

    if (!isValid) return;

    // ── 2. Double-submit guard ──
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    messageDiv.className = 'form-message hidden';

    // ── 3. Collect form data (field names match backend exactly) ──
    const formData = {
        name: form.querySelector('#premFullName').value.trim(),
        email: form.querySelector('#premEmail').value.trim(),
        phone: form.querySelector('#premPhone').value.trim(),
        guest_count: form.querySelector('#premGuests').value,
        date: form.querySelector('#premDate').value,
        time: form.querySelector('#premTime').value,
        type: form.querySelector('#premType').value,
        message: form.querySelector('#premSpecialRequest')?.value?.trim() || '',
        captcha_token: form.querySelector('[name="cf-turnstile-response"]')?.value || '',
    };

    // ── 3.5 Advanced Client-Side Validation ──
    // Stops bad requests instantly before waking up Vercel serverless function
    let clientError = null;

    // 1. Guest count check
    if (parseInt(formData.guest_count, 10) > 20) {
        clientError = "Guest count cannot exceed 20.";
    }

    // 2. Future Date Check (Simple local check)
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day comparison
    if (selectedDate <= today) {
        clientError = "Reservation date must be in the future (same-day bookings are not available).";
    }

    // 3. Restaurant closed on Mondays Check
    if (selectedDate.getDay() === 1) { // 1 = Monday
        clientError = "We are closed on Mondays. Please select another date.";
    }

    // If client validation fails, show error instantly and abort
    if (clientError) {
        messageDiv.textContent = clientError;
        messageDiv.className = 'form-message error';
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        return;
    }

    // ── 4. Call the API ──
    try {
        const res = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (res.ok) {
            // ── Success (Show Modal) ──
            form.reset();
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            messageDiv.className = 'form-message hidden'; // Hide inline message

            // Show Modal
            const modal = document.getElementById('res-success-modal');
            if (modal) {
                modal.classList.remove('hidden');
            }

            // Advance progress indicator to step 2
            const steps = document.querySelectorAll('.step-circle');
            if (steps.length >= 2) {
                steps[0].classList.remove('active');
                steps[1].classList.add('active');
                steps[1].style.backgroundColor = 'transparent';
                steps[1].style.color = '#000';
            }

            // Reset Turnstile widget for potential next submission
            if (window.turnstile) turnstile.reset();

        } else {
            // ── Backend returned an error (400, 409, 429, 500) ──
            const errorMsg = data.error || 'An error occurred. Please try again.';
            messageDiv.textContent = errorMsg;
            messageDiv.className = 'form-message error';
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;

            // Reset Turnstile so user can re-submit
            if (window.turnstile) turnstile.reset();
        }

    } catch (err) {
        // ── Network error (no internet, server unreachable) ──
        messageDiv.textContent = 'A network error occurred. Please check your connection.';
        messageDiv.className = 'form-message error';
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        if (window.turnstile) turnstile.reset();
    }
});

// Remove error class on input (preserved from original)
document.addEventListener('input', function (e) {
    if (e.target && e.target.closest('#premiumReservationForm')) {
        if (e.target.value.trim()) {
            e.target.classList.remove('error');
        }
    }
});


// === FAQ Accordion Logic === (preserved from original — no changes)
document.addEventListener('click', function (e) {
    const questionBtn = e.target.closest('.faq-question');
    if (!questionBtn) return;

    const currentItem = questionBtn.closest('.faq-item');
    const currentAnswer = currentItem.querySelector('.faq-answer');
    const isCurrentlyActive = currentItem.classList.contains('active');

    // Close all open items within the same accordion container
    const accordionContainer = currentItem.closest('.faq-accordion');
    const allItems = accordionContainer.querySelectorAll('.faq-item');

    allItems.forEach(item => {
        item.classList.remove('active');
        const answer = item.querySelector('.faq-answer');
        if (answer) {
            answer.style.maxHeight = null;
        }
    });

    // If the clicked item was NOT active, open it
    if (!isCurrentlyActive) {
        currentItem.classList.add('active');
        currentAnswer.style.maxHeight = currentAnswer.scrollHeight + "px";
    }
});

// === Success Modal Close Logic ===
document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'res-modal-close') {
        const modal = document.getElementById('res-success-modal');
        if (modal) {
            modal.classList.add('hidden');

            // Reset progress indicator back to step 1
            const steps = document.querySelectorAll('.step-circle');
            if (steps.length >= 2) {
                steps[1].classList.remove('active');
                steps[0].classList.add('active');
                steps[1].style.backgroundColor = '';
                steps[1].style.color = '';
            }
        }
    }
});
