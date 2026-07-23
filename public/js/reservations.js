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

    // 3. Restaurant closed on Mondays and Tuesdays Check
    const closedDay = selectedDate.getDay();
    if (closedDay === 1 || closedDay === 2) { // 1 = Monday, 2 = Tuesday
        clientError = "We are closed on Mondays and Tuesdays. Please select another date.";
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

// =============================================
// PREMIUM FORM COMPONENTS
// Custom date picker, time picker, select dropdowns.
// Uses event delegation — same pattern as the form logic above.
// Writes back to hidden native elements so the submit handler
// and validation work without any changes.
// =============================================

(function () {
    'use strict';

    // ── Constants ──
    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    var WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    var activePanel = null; // Only one panel open at a time

    // ── Calendar state ──
    var calState = { year: 0, month: 0, selected: null };

    // ══════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════

    function closeAllPanels() {
        if (!activePanel) return;
        activePanel.classList.remove('open');
        var trigger = activePanel.querySelector('.prem-select-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        activePanel = null;
    }

    function togglePanel(wrapper) {
        var wasOpen = wrapper.classList.contains('open');
        closeAllPanels();
        if (!wasOpen) {
            wrapper.classList.add('open');
            var trigger = wrapper.querySelector('.prem-select-trigger');
            if (trigger) trigger.setAttribute('aria-expanded', 'true');
            activePanel = wrapper;
        }
    }

    function setDisplay(wrapper, text) {
        var el = wrapper.querySelector('.prem-select-value');
        if (!el) return;
        var placeholder = el.dataset.placeholder || el.getAttribute('data-placeholder');
        if (text && text !== placeholder) {
            el.textContent = text;
            el.classList.remove('is-placeholder');
        } else {
            el.textContent = placeholder || '';
            el.classList.add('is-placeholder');
        }
    }

    function fireInput(el) {
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function dateToStr(d) {
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function formatDateNice(str) {
        var parts = str.split('-');
        var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        return MONTHS[d.getMonth()].substring(0, 3) + ' ' + (+parts[2]) + ', ' + parts[0];
    }

    function formatTime12(h, m) {
        var suffix = (h >= 12 && h < 24) ? 'PM' : 'AM';
        var hour = h % 12;
        if (hour === 0) hour = 12;
        return hour + ':' + pad(m) + ' ' + suffix;
    }

    // ══════════════════════════════════════
    // CUSTOM SELECT (Guests + Type)
    // ══════════════════════════════════════

    function initSelect(wrapper) {
        if (wrapper.dataset.init) return;
        wrapper.dataset.init = '1';

        var sel = wrapper.querySelector('select');
        var dropdown = wrapper.querySelector('.prem-select-dropdown');
        if (!sel || !dropdown) return;

        var html = '';
        var opts = sel.querySelectorAll('option');
        for (var i = 0; i < opts.length; i++) {
            if (opts[i].disabled && opts[i].value === '') continue; // skip placeholder
            html += '<button type="button" class="prem-select-option" role="option" data-value="' +
                opts[i].value + '"><span>' + opts[i].textContent +
                '</span><svg class="prem-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></button>';
        }
        dropdown.innerHTML = html;
    }

    // ══════════════════════════════════════
    // DATEPICKER
    // ══════════════════════════════════════

    function initDatepicker(wrapper) {
        if (wrapper.dataset.init) return;
        wrapper.dataset.init = '1';

        var now = new Date();
        // Start on the current month (tomorrow is the first selectable day)
        calState.year = now.getFullYear();
        calState.month = now.getMonth();

        renderCalendar(wrapper.querySelector('.prem-datepicker-panel'));
    }

    function renderCalendar(panel) {
        if (!panel) return;
        var year = calState.year, month = calState.month, sel = calState.selected;

        var today = new Date();
        today.setHours(0, 0, 0, 0);

        var maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 180);

        var firstDay = new Date(year, month, 1);
        var startDay = firstDay.getDay(); // 0=Sun
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var daysInPrev = new Date(year, month, 0).getDate();

        // Check if we can go prev (don't go before current month)
        var canPrev = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth());

        var h = '<div class="prem-cal-header">' +
            '<button type="button" class="prem-cal-nav prem-cal-prev" aria-label="Previous month"' +
            (canPrev ? '' : ' disabled style="opacity:0.3;pointer-events:none"') + '>' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
            '</button>' +
            '<span class="prem-cal-month-year">' + MONTHS[month] + ' ' + year + '</span>' +
            '<button type="button" class="prem-cal-nav prem-cal-next" aria-label="Next month">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
            '</button></div>';

        h += '<div class="prem-cal-weekdays">';
        for (var w = 0; w < 7; w++) h += '<span>' + WEEKDAYS[w] + '</span>';
        h += '</div><div class="prem-cal-grid">';

        // Build 42 cells (6 rows)
        for (var i = 0; i < 42; i++) {
            var day, dateObj, isOther = false;

            if (i < startDay) {
                day = daysInPrev - startDay + 1 + i;
                dateObj = new Date(year, month - 1, day);
                isOther = true;
            } else if (i - startDay >= daysInMonth) {
                day = i - startDay - daysInMonth + 1;
                dateObj = new Date(year, month + 1, day);
                isOther = true;
            } else {
                day = i - startDay + 1;
                dateObj = new Date(year, month, day);
            }

            var ds = dateToStr(dateObj);
            var cls = 'prem-cal-day';
            var attrs = ' data-date="' + ds + '"';

            if (isOther) cls += ' other-month';

            var isPast = dateObj <= today;
            var isMonday = dateObj.getDay() === 1;
            var isFar = dateObj > maxDate;

            if (isPast || isMonday || isFar) {
                cls += ' disabled';
                attrs += ' aria-disabled="true"';
            }

            if (dateObj.getTime() === today.getTime()) cls += ' today';
            if (sel === ds) { cls += ' selected'; attrs += ' aria-selected="true"'; }

            h += '<button type="button" class="' + cls + '"' + attrs + '>' + day + '</button>';
        }

        h += '</div>';
        panel.innerHTML = h;

        // Hide last row if all cells are other-month
        var grid = panel.querySelector('.prem-cal-grid');
        var cells = grid.children;
        var allOther = true;
        for (var j = 35; j < 42; j++) {
            if (cells[j] && !cells[j].classList.contains('other-month')) { allOther = false; break; }
        }
        if (allOther) {
            for (var k = 35; k < 42; k++) {
                if (cells[k]) cells[k].style.display = 'none';
            }
        }
    }

    // ══════════════════════════════════════
    // TIME PICKER
    // ══════════════════════════════════════

    function initTimepicker(wrapper) {
        if (wrapper.dataset.init) return;
        wrapper.dataset.init = '1';
        renderTimeSlots(wrapper);
    }

    function renderTimeSlots(wrapper) {
        var panel = wrapper.querySelector('.prem-timepicker-panel');
        if (!panel) return;

        var typeEl = document.getElementById('premType');
        var type = typeEl ? typeEl.value : '';

        if (!type) {
            panel.innerHTML = '<div class="prem-time-empty-msg">Please select a reservation type first</div>';
            return;
        }

        var slots = [];
        if (type === 'lounge') {
            // Check selected date to determine which lounge hours apply
            var dateEl = document.getElementById('premDate');
            var selectedDateVal = dateEl ? dateEl.value : '';
            var selectedDay = -1;
            if (selectedDateVal) {
                selectedDay = new Date(selectedDateVal + 'T12:00:00').getDay();
            }

            if (selectedDay === 3 || selectedDay === 4) {
                // Wed/Thu: 8:00 PM to 12 Midnight (20:00–24:00)
                for (var h = 20; h <= 23; h++) {
                    slots.push({ t: pad(h) + ':00', l: formatTime12(h, 0) });
                    slots.push({ t: pad(h) + ':30', l: formatTime12(h, 30) });
                }
            } else if (selectedDay === 5 || selectedDay === 6) {
                // Fri/Sat: 7:00 PM to 2:00 AM (19:00–02:00)
                for (var h = 19; h <= 23; h++) {
                    slots.push({ t: pad(h) + ':00', l: formatTime12(h, 0) });
                    slots.push({ t: pad(h) + ':30', l: formatTime12(h, 30) });
                }
                for (var h2 = 0; h2 <= 1; h2++) {
                    slots.push({ t: pad(h2) + ':00', l: formatTime12(h2, 0) });
                    slots.push({ t: pad(h2) + ':30', l: formatTime12(h2, 30) });
                }
                slots.push({ t: '02:00', l: formatTime12(2, 0) });
            } else {
                // No date selected or non-lounge day — show widest range (Fri/Sat)
                for (var h = 19; h <= 23; h++) {
                    slots.push({ t: pad(h) + ':00', l: formatTime12(h, 0) });
                    slots.push({ t: pad(h) + ':30', l: formatTime12(h, 30) });
                }
                for (var h2 = 0; h2 <= 1; h2++) {
                    slots.push({ t: pad(h2) + ':00', l: formatTime12(h2, 0) });
                    slots.push({ t: pad(h2) + ':30', l: formatTime12(h2, 30) });
                }
                slots.push({ t: '02:00', l: formatTime12(2, 0) });
            }
        } else if (type === 'event') {
            // Event booking window: 9:00 AM to 5:00 PM (09:00–17:00)
            for (var h3 = 9; h3 <= 16; h3++) {
                slots.push({ t: pad(h3) + ':00', l: formatTime12(h3, 0) });
                slots.push({ t: pad(h3) + ':30', l: formatTime12(h3, 30) });
            }
            slots.push({ t: '17:00', l: formatTime12(17, 0) });
        } else {
            // Table (Resto Bar): Sunday 11:00 AM to 12 Midnight (11:00–24:00)
            for (var h3 = 11; h3 <= 23; h3++) {
                slots.push({ t: pad(h3) + ':00', l: formatTime12(h3, 0) });
                slots.push({ t: pad(h3) + ':30', l: formatTime12(h3, 30) });
            }
        }

        var nativeTime = document.getElementById('premTime');
        var current = nativeTime ? nativeTime.value : '';

        var label = type === 'lounge' ? 'Evening &amp; Late Night' : (type === 'event' ? 'Booking Window (9AM-5PM)' : 'Sunday Resto Bar');
        var html = '<div class="prem-time-section-label">' + label + '</div><div class="prem-time-grid">';
        for (var s = 0; s < slots.length; s++) {
            html += '<button type="button" class="prem-time-slot' +
                (slots[s].t === current ? ' selected' : '') +
                '" data-time="' + slots[s].t + '">' + slots[s].l + '</button>';
        }
        html += '</div>';
        panel.innerHTML = html;
    }

    // ══════════════════════════════════════
    // EVENT DELEGATION — Click
    // ══════════════════════════════════════

    document.addEventListener('click', function (e) {

        // ── Trigger button ──
        var trigger = e.target.closest('.prem-select-trigger');
        if (trigger) {
            var wrapper = trigger.closest('.prem-custom-select, .prem-datepicker, .prem-timepicker');
            if (!wrapper) return;

            // Lazy init
            if (wrapper.classList.contains('prem-custom-select')) initSelect(wrapper);
            if (wrapper.classList.contains('prem-datepicker')) initDatepicker(wrapper);
            if (wrapper.classList.contains('prem-timepicker')) {
                initTimepicker(wrapper);
                // Re-render time slots each open in case type changed
                renderTimeSlots(wrapper);
            }

            togglePanel(wrapper);
            return;
        }

        // ── Custom select option ──
        var option = e.target.closest('.prem-select-option');
        if (option) {
            var selWrapper = option.closest('.prem-custom-select');
            if (!selWrapper) return;

            var value = option.dataset.value;
            var text = option.querySelector('span').textContent;
            var nativeSel = selWrapper.querySelector('select');

            // Sync native select
            nativeSel.value = value;
            fireInput(nativeSel);

            // Update display
            setDisplay(selWrapper, text);

            // Update selected state
            var allOpts = selWrapper.querySelectorAll('.prem-select-option');
            for (var i = 0; i < allOpts.length; i++) {
                allOpts[i].classList.remove('selected');
                allOpts[i].removeAttribute('aria-selected');
            }
            option.classList.add('selected');
            option.setAttribute('aria-selected', 'true');

            closeAllPanels();

            // If type changed → regenerate time slots + clear time
            if (nativeSel.id === 'premType') {
                var timeW = document.getElementById('premTimeWrapper');
                if (timeW) {
                    var nt = document.getElementById('premTime');
                    if (nt) { nt.value = ''; fireInput(nt); }
                    setDisplay(timeW, null);
                    renderTimeSlots(timeW);
                }
            }
            return;
        }

        // ── Calendar day ──
        var dayBtn = e.target.closest('.prem-cal-day');
        if (dayBtn && !dayBtn.classList.contains('disabled')) {
            var datepicker = dayBtn.closest('.prem-datepicker');
            if (!datepicker) return;

            var ds = dayBtn.dataset.date;
            calState.selected = ds;

            // Sync native input
            var nativeDate = datepicker.querySelector('input[type="date"]');
            if (nativeDate) { nativeDate.value = ds; fireInput(nativeDate); }

            // Update display
            setDisplay(datepicker, formatDateNice(ds));

            // Re-render to show selected state
            renderCalendar(datepicker.querySelector('.prem-datepicker-panel'));

            closeAllPanels();
            return;
        }

        // ── Calendar month navigation ──
        var nav = e.target.closest('.prem-cal-nav');
        if (nav && !nav.disabled) {
            var calPanel = nav.closest('.prem-datepicker-panel');
            if (!calPanel) return;

            if (nav.classList.contains('prem-cal-prev')) {
                calState.month--;
                if (calState.month < 0) { calState.month = 11; calState.year--; }
            } else {
                calState.month++;
                if (calState.month > 11) { calState.month = 0; calState.year++; }
            }

            renderCalendar(calPanel);
            return;
        }

        // ── Time slot ──
        var timeSlot = e.target.closest('.prem-time-slot');
        if (timeSlot) {
            var timeW2 = timeSlot.closest('.prem-timepicker');
            if (!timeW2) return;

            var time = timeSlot.dataset.time;

            // Sync native input
            var nativeTime = timeW2.querySelector('input[type="time"]');
            if (nativeTime) { nativeTime.value = time; fireInput(nativeTime); }

            // Update display
            setDisplay(timeW2, timeSlot.textContent);

            // Update selected state
            var allSlots = timeW2.querySelectorAll('.prem-time-slot');
            for (var s = 0; s < allSlots.length; s++) allSlots[s].classList.remove('selected');
            timeSlot.classList.add('selected');

            closeAllPanels();
            return;
        }

        // ── Click outside → close ──
        if (activePanel && !e.target.closest('.prem-custom-select, .prem-datepicker, .prem-timepicker')) {
            closeAllPanels();
        }
    });

    // ── Escape key → close ──
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && activePanel) {
            closeAllPanels();
        }
    });

    // ── Form reset → clear all custom UI ──
    document.addEventListener('reset', function (e) {
        if (!e.target || e.target.id !== 'premiumReservationForm') return;

        // setTimeout so native reset completes first
        setTimeout(function () {
            var wrappers = document.querySelectorAll('.prem-custom-select, .prem-datepicker, .prem-timepicker');
            for (var i = 0; i < wrappers.length; i++) {
                setDisplay(wrappers[i], null);
                // Clear selected states in dropdowns
                var selected = wrappers[i].querySelectorAll('.selected');
                for (var j = 0; j < selected.length; j++) selected[j].classList.remove('selected');
            }

            // Reset calendar state
            calState.selected = null;
            var calPanel = document.querySelector('.prem-datepicker-panel');
            if (calPanel) renderCalendar(calPanel);

            // Clear time slots
            var tw = document.getElementById('premTimeWrapper');
            if (tw) renderTimeSlots(tw);
        }, 0);
    });

})();
