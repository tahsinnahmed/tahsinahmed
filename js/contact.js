(function () {
    'use strict';

    /* ==== CONFIG ========================================== */
    var FORM_ENDPOINT = 'https://formsubmit.co/ajax/tahsin.ahmed@g.bracu.ac.bd';
    /* ====================================================== */

    /* ==== REGEX ===========================================
       RFC 5322-ish practical pattern.
       Rules enforced:
         • local part: letters, digits, . _ % + - (no leading/trailing dot, no double dots)
         • exactly one @
         • domain: labels separated by dots, each starting/ending with alphanumeric/hyphen
         • TLD: 2–24 letters
         • total length ≤ 254, local part ≤ 64
       Rejects things like: "a@b", "a@b.c", "a..b@x.com", "a@-x.com", "a@x-.com"
    ====================================================== */
    var EMAIL_REGEX = /^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

    /* Extra explicit guards the regex above already handles,
       but kept for clarity & defence-in-depth. */
    function isValidEmail(value) {
        if (!value) return false;
        var v = value.trim();
        if (v.length > 254) return false;
        if (v.indexOf('..') !== -1) return false;          // no consecutive dots
        if (/^[.]|[.]@|@[.]|[.]$/.test(v)) return false;    // no leading/trailing dot in local part
        return EMAIL_REGEX.test(v);
    }

    /* ==== ELEMENTS ======================================== */
    var form      = document.getElementById('contactForm');
    var submitBtn = document.getElementById('submit');
    var emailEl   = document.getElementById('email');

    /* ==== INLINE ERROR HELPER ============================= */
    function setFieldError(input, message) {
        if (!input) return;
        var group = input.closest('.form-group') || input.parentNode;

        // Remove existing error state
        group.classList.remove('has-error');
        var old = group.querySelector('.field-error');
        if (old) old.remove();

        if (!message) {
            input.setCustomValidity('');
            return;
        }

        group.classList.add('has-error');
        input.setCustomValidity(message);

        var err = document.createElement('small');
        err.className = 'field-error';
        err.textContent = message;
        group.appendChild(err);
    }

    /* ==== LIVE EMAIL VALIDATION =========================== */
    if (emailEl) {
        emailEl.addEventListener('input', function () {
            var v = emailEl.value.trim();
            if (!v) { setFieldError(emailEl, ''); return; }
            if (!isValidEmail(v)) {
                setFieldError(emailEl, 'Please enter a valid email address (e.g. name@example.com).');
            } else {
                setFieldError(emailEl, '');
            }
        });
        emailEl.addEventListener('blur', function () {
            var v = emailEl.value.trim();
            if (v && !isValidEmail(v)) {
                setFieldError(emailEl, 'Please enter a valid email address (e.g. name@example.com).');
            } else {
                setFieldError(emailEl, '');
            }
        });
    }

    /* ==== FORM SUBMIT (AJAX — no reload, no redirect) ===== */
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            /* ---- 1. Required-field check ---- */
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            /* ---- 2. Explicit email-format check ---- */
            var rawEmail = emailEl ? emailEl.value.trim() : '';
            if (!isValidEmail(rawEmail)) {
                setFieldError(emailEl, 'Please enter a valid email address (e.g. name@example.com).');
                if (emailEl) emailEl.focus();
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Invalid email',
                        text: 'Please enter a valid email address (e.g. name@example.com).',
                        icon: 'warning',
                        confirmButtonColor: '#00006d'
                    });
                }
                return;
            }

            /* ---- 3. Build payload ---- */
            var formData = new FormData(form);
            var payload  = {};
            formData.forEach(function (value, key) {
                if (key === '_honey' && !value) return;
                payload[key] = value;
            });
            payload.email = rawEmail; // ensure trimmed value is sent

            /* ---- 4. Lock button ---- */
            var originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Sending&nbsp;&nbsp;<i class="fa fa-spinner fa-spin"></i>';
            }

            /* ---- 5. Send ---- */
            fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(function (data) {
                // FormSubmit always returns HTTP 200; the real result is in data.success
                var ok = data && (data.success === true || data.success === 'true');
                if (!ok) {
                    var serverMsg = (data && data.message) ? data.message : 'Unknown error';
                    throw new Error(serverMsg);
                }

                /* ---- SUCCESS ---- */
                form.reset();
                setFieldError(emailEl, '');

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Thank you!',
                        text: "Thank you for reaching out. I am currently tied up but will get back to you as soon as possible. I appreciate your patience.",
                        icon: 'success',
                        confirmButtonColor: '#00006d'
                    });
                } else {
                    alert('Thank you! Your message has been sent.');
                }
            })
            .catch(function (err) {
                console.error('Contact form error:', err);

                var raw = (err && err.message) ? err.message : 'Unknown error.';
                var friendly = raw;

                if (/could not authenticate/i.test(raw)) {
                    friendly = 'The contact form is temporarily unable to deliver messages ' +
                               '(SMTP authentication failed at the mail provider). ' +
                               'Please email me directly at tahsin.ahmed@g.bracu.ac.bd.';
                } else if (/activation|verify|confirm/i.test(raw)) {
                    friendly = 'This email address has not been verified with the form service yet. ' +
                               'Please email me directly at tahsin.ahmed@g.bracu.ac.bd.';
                } else if (/HTTP 4|HTTP 5/.test(raw)) {
                    friendly = 'The message service rejected the request. ' +
                               'Please try again later, or email me directly at tahsin.ahmed@g.bracu.ac.bd.';
                } else if (/Failed to fetch|NetworkError|Load failed/i.test(raw)) {
                    friendly = 'Network error. Please check your internet connection and try again.';
                }

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Message not sent',
                        text: friendly,
                        icon: 'error',
                        confirmButtonColor: '#00006d'
                    });
                } else {
                    alert(friendly);
                }
            })
            .finally(function () {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHTML;
                }
            });
        });
    }

    /* ==== OPTIONAL FILE-INPUT PREVIEW ===== */
    var fileInput  = document.getElementById('file');
    var fileChosen = document.getElementById('file-chosen');
    if (fileInput && fileChosen) {
        fileInput.addEventListener('change', function (event) {
            var fileName = event.target.files[0] ? event.target.files[0].name : 'No file chosen';
            fileChosen.textContent = fileName;
        });
    }
})();