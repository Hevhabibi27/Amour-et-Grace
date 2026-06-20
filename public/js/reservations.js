// public/js/reservations.js

// === Reservation Form Logic ===
document.addEventListener('submit', function(e) {
    if (e.target && e.target.id === 'premiumReservationForm') {
        e.preventDefault(); // Prevent actual form submission

        const form = e.target;
        let isValid = true;
        
        // Reset previous errors
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.classList.remove('error');
        });

        // Validate required fields
        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            }
        });

        if (!isValid) {
            return;
        }

        const submitBtn = form.querySelector('.prem-submit-btn');
        const originalBtnText = submitBtn.textContent;
        const messageDiv = form.querySelector('#form-message');

        // Simulate loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        messageDiv.classList.add('hidden');
        messageDiv.className = 'form-message hidden'; // reset classes

        setTimeout(() => {
            // Simulate successful submission
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            
            // Show success message
            messageDiv.textContent = 'Thank you! Your reservation request has been sent. We will contact you shortly to confirm.';
            messageDiv.classList.remove('hidden');
            messageDiv.classList.add('success');

            // Optionally reset form
            form.reset();
            
            // Advance progress indicator to step 2 visually
            const steps = document.querySelectorAll('.step-circle');
            if(steps.length >= 2) {
                steps[0].classList.remove('active');
                steps[1].classList.add('active');
                steps[1].style.backgroundColor = 'transparent';
                steps[1].style.color = '#000';
            }
            
            // Hide message after a few seconds
            setTimeout(() => {
                messageDiv.classList.add('hidden');
            }, 6000);

        }, 1500);
    }
});

// Remove error class on input
document.addEventListener('input', function(e) {
    if (e.target && e.target.closest('#premiumReservationForm')) {
        if (e.target.value.trim()) {
            e.target.classList.remove('error');
        }
    }
});


// === FAQ Accordion Logic ===
document.addEventListener('click', function(e) {
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
