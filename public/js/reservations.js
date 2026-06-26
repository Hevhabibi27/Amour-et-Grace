// public/js/reservations.js

// === Reservation Form Logic ===
// Replaces the old setTimeout fake with a real fetch() to POST /api/reservations.
// Aligned with:
//   - api/reservations/index.js (expects: name, email, phone, guest_count, date, time, type, message, captcha_token)
//   - api/_lib/validate.js (type-dependent hours, lounge closed Tuesdays)
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

    // ── 4. Call the API ──
    try {
        const res = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (res.ok) {
            // ── Success ──
            messageDiv.textContent = 'Thank you! We received your reservation request. A confirmation email will be sent shortly.';
            messageDiv.className = 'form-message success';
            form.reset();

            // Advance progress indicator to step 2
            const steps = document.querySelectorAll('.step-circle');
            if (steps.length >= 2) {
                steps[0].classList.remove('active');
                steps[1].classList.add('active');
                steps[1].style.backgroundColor = 'transparent';
                steps[1].style.color = '#000';
            }

            // Keep button in "sent" state, re-enable after 8s
            submitBtn.textContent = 'Sent ✓';
            setTimeout(() => {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                messageDiv.className = 'form-message hidden';
                // Reset progress indicator back to step 1
                if (steps.length >= 2) {
                    steps[1].classList.remove('active');
                    steps[0].classList.add('active');
                }
            }, 8000);

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
