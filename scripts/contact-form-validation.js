// ------ Contact Form: dual-mode (Mail + WhatsApp) ----------------------------
(function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const mailTab = document.querySelector('[data-mode="mail"]');
  const waTab = document.querySelector('[data-mode="whatsapp"]');
  const pill = document.querySelector(".cf-tab-pill");
  const emailOpt = document.getElementById("cfEmailOpt");
  const contactOpt = document.getElementById("cfContactOpt");
  const subjectBlock = document.getElementById("cfSubjectBlock");
  const submitBtn = document.getElementById("cfSubmitBtn");
  const btnIcon = document.getElementById("cfBtnIcon");
  const btnText = document.getElementById("cfBtnText");
  const toast = document.getElementById("cfToast");
  const toastIcon = document.getElementById("cfToastIcon");
  const toastMsg = document.getElementById("cfToastMsg");
  const toastClose = document.getElementById("cfToastClose");

  // Field refs
  const nameInput = document.getElementById("cf-name");
  const emailInput = document.getElementById("cf-email");
  const contactInput = document.getElementById("cf-contact");
  const subjectInput = document.getElementById("cf-subject");
  const msgInput = document.getElementById("cf-message");

  // Inline error span refs (all fields now have one)
  const nameErr = document.getElementById("cf-name-error");
  const emailErr = document.getElementById("cf-email-error");
  const contactErr = document.getElementById("cf-contact-error");
  const subjectErr = document.getElementById("cf-subject-error");
  const msgErr = document.getElementById("cf-message-error");

  let mode = "mail";
  let switching = false;
  let toastTimer;

  // ------ Independent state preservation ----------------------------

  const state = {
    mail: { name: "", email: "", subject: "", message: "" },
    whatsapp: { name: "", contact: "", message: "" },
  };

  function saveState() {
    if (mode === "mail") {
      state.mail.name = nameInput.value;
      state.mail.email = emailInput.value;
      state.mail.subject = subjectInput.value;
      state.mail.message = msgInput.value;
    } else {
      state.whatsapp.name = nameInput.value;
      state.whatsapp.contact = contactInput.value;
      state.whatsapp.message = msgInput.value;
    }
  }

  function restoreState(newMode) {
    if (newMode === "mail") {
      nameInput.value = state.mail.name;
      emailInput.value = state.mail.email;
      subjectInput.value = state.mail.subject;
      msgInput.value = state.mail.message;
    } else {
      nameInput.value = state.whatsapp.name;
      contactInput.value = state.whatsapp.contact;
      msgInput.value = state.whatsapp.message;
    }
  }

  function clearState(clearedMode) {
    if (clearedMode === "mail") {
      state.mail = { name: "", email: "", subject: "", message: "" };
    } else {
      state.whatsapp = { name: "", contact: "", message: "" };
    }
    if (clearedMode === mode) {
      nameInput.value =
        emailInput.value =
        contactInput.value =
        subjectInput.value =
        msgInput.value =
          "";
    }
  }

  // ------ Toast ----------------------------
  function showToast(type, msg) {
    clearTimeout(toastTimer);
    toastIcon.className =
      type === "success"
        ? "cf-toast-icon fas fa-check-circle"
        : "cf-toast-icon fas fa-exclamation-circle";
    toastMsg.textContent = msg;
    toast.dataset.type = type;
    toast.hidden = false;
    void toast.offsetWidth;
    toast.classList.add("cf-toast--in");
    toastTimer = setTimeout(hideToast, 5000);
  }

  function hideToast() {
    toast.classList.remove("cf-toast--in");
    toast.addEventListener(
      "transitionend",
      () => {
        toast.hidden = true;
      },
      { once: true },
    );
  }

  toastClose.addEventListener("click", hideToast);

  // ------ Tab switching ----------------------------
  function switchTo(newMode) {
    if (newMode === mode || switching) return;
    saveState();
    switching = true;
    mode = newMode;
    const toMail = newMode === "mail";

    mailTab.classList.toggle("cf-tab--active", toMail);
    waTab.classList.toggle("cf-tab--active", !toMail);
    mailTab.setAttribute("aria-selected", toMail);
    waTab.setAttribute("aria-selected", !toMail);
    pill.style.transform = toMail ? "translateX(0%)" : "translateX(100%)";

    emailOpt.classList.toggle("cf-partner-opt--active", toMail);
    contactOpt.classList.toggle("cf-partner-opt--active", !toMail);
    subjectBlock.classList.toggle("cf-subject-block--in", toMail);
    subjectBlock.classList.toggle("cf-subject-block--out", !toMail);

    clearAllErrors();
    restoreState(newMode);
    resetBtn();

    setTimeout(() => {
      switching = false;
    }, 700);
  }

  mailTab.addEventListener("click", () => switchTo("mail"));
  waTab.addEventListener("click", () => switchTo("whatsapp"));

  // ------ Error helpers ----------------------------
  function setFieldError(input, msgEl, message) {
    input.closest(".cf-field").classList.add("cf-error");
    if (msgEl && message) {
      msgEl.textContent = message;
      msgEl.classList.add("cf-field-error--visible");
    }
    // Shake only on submit (caller controls this)
    input.classList.remove("cf-shake");
    void input.offsetWidth;
    input.classList.add("cf-shake");
    input.addEventListener(
      "animationend",
      () => input.classList.remove("cf-shake"),
      { once: true },
    );
  }

  function clearFieldError(input, msgEl) {
    input.closest(".cf-field")?.classList.remove("cf-error");
    if (msgEl) {
      msgEl.textContent = "";
      msgEl.classList.remove("cf-field-error--visible");
    }
  }

  function clearAllErrors() {
    form
      .querySelectorAll(".cf-field")
      .forEach((f) => f.classList.remove("cf-error"));
    [nameErr, emailErr, contactErr, subjectErr, msgErr].forEach((el) => {
      if (el) {
        el.textContent = "";
        el.classList.remove("cf-field-error--visible");
      }
    });
  }

  // ------ Real-time validation ----------------------------
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  emailInput.addEventListener("input", () => {
    const val = emailInput.value;
    if (!val) {
      clearFieldError(emailInput, emailErr);
      return;
    }
    if (!EMAIL_RE.test(val)) {
      const msg = !val.includes("@")
        ? "Missing @ sign"
        : !val.split("@")[1]?.includes(".")
          ? "Missing domain (e.g. gmail.com)"
          : "Enter a valid email address";
      emailInput.closest(".cf-field").classList.add("cf-error");
      emailErr.textContent = msg;
      emailErr.classList.add("cf-field-error--visible");
    } else {
      clearFieldError(emailInput, emailErr);
    }
  });

  const WA_VALID_RE = /^\+?[0-9]*$/;

  contactInput.addEventListener("input", () => {
    const raw = contactInput.value;
    const cleaned = raw
      .replace(/[^0-9+]/g, "") // strip non-digit/non-+
      .replace(/(?!^\+)\+/g, ""); // keep + only at index 0
    if (cleaned !== raw) contactInput.value = cleaned;

    if (!cleaned) {
      clearFieldError(contactInput, contactErr);
      return;
    }

    if (!WA_VALID_RE.test(cleaned)) {
      contactInput.closest(".cf-field").classList.add("cf-error");
      contactErr.textContent = "Only digits and a leading + are allowed";
      contactErr.classList.add("cf-field-error--visible");
    } else {
      clearFieldError(contactInput, contactErr);
    }
  });

  // Generic: clear error once field has content (name, subject, message)
  form.addEventListener("input", (e) => {
    const t = e.target;
    if (t === emailInput || t === contactInput) return;
    if (t.value.trim()) clearFieldError(t, null);
  });

  // ------ Submit-time validation ----------------------------
  function validate() {
    let ok = true;

    if (!nameInput.value.trim()) {
      setFieldError(nameInput, nameErr, "Full name is required");
      ok = false;
    }
    if (!msgInput.value.trim()) {
      setFieldError(msgInput, msgErr, "Message is required");
      ok = false;
    }

    if (mode === "mail") {
      const emailVal = emailInput.value.trim();
      if (!emailVal) {
        setFieldError(emailInput, emailErr, "Email is required");
        ok = false;
      } else if (!EMAIL_RE.test(emailVal)) {
        const msg = !emailVal.includes("@")
          ? "Missing @ sign"
          : !emailVal.split("@")[1]?.includes(".")
            ? "Missing domain (e.g. gmail.com)"
            : "Enter a valid email address";
        setFieldError(emailInput, emailErr, msg);
        ok = false;
      }
      if (!subjectInput.value.trim()) {
        setFieldError(subjectInput, subjectErr, "Subject is required");
        ok = false;
      }
    } else {
      const waVal = contactInput.value.trim();
      if (!waVal) {
        setFieldError(contactInput, contactErr, "WhatsApp number is required");
        ok = false;
      } else if (waVal.length < 7) {
        setFieldError(contactInput, contactErr, "Number too short");
        ok = false;
      } else if (!WA_VALID_RE.test(waVal)) {
        setFieldError(
          contactInput,
          contactErr,
          "Only digits and a leading + are allowed",
        );
        ok = false;
      }
    }

    return ok;
  }

  // ------ Button helpers ----------------------------
  function resetBtn() {
    submitBtn.disabled = false;
    submitBtn.classList.remove("cf-btn--success");
    btnIcon.className = "fas fa-paper-plane";
    btnText.textContent = "Send Message";
  }

  function setBtnLoading() {
    submitBtn.disabled = true;
    btnIcon.className = "fas fa-spinner fa-spin";
    btnText.textContent = "Sending\u2026";
  }

  function setBtnSuccess() {
    submitBtn.disabled = false;
    submitBtn.classList.add("cf-btn--success");
    btnIcon.className = "fas fa-check";
    btnText.textContent = "Sent!";
  }

  // ------ Submit ----------------------------
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!validate()) return;

    const submittedMode = mode;

    if (submittedMode === "whatsapp") {
      const name = nameInput.value.trim();
      const tel = contactInput.value.trim();
      const msg = msgInput.value.trim();
      const text = encodeURIComponent(
        `Hi Ubaid,\n\nMy name is ${name}.\n\n${msg}\n\n\u2014 My WhatsApp: ${tel}`,
      );
      window.open(`https://wa.me/+923360973607?text=${text}`, "_blank");
      clearState("whatsapp");
      clearAllErrors();
      showToast(
        "success",
        "Redirected to WhatsApp! If it didn\u2019t open automatically, please try again.",
      );
      return;
    }

    setBtnLoading();

    const formData = new FormData(form);
    let success = false;
    try {
      const res = await fetch("https://formspree.io/f/maqagzyg", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      success = res.ok;
    } catch (_) {
      success = false;
    }

    await new Promise((r) => setTimeout(r, 3000));

    if (success) {
      setBtnSuccess();
      showToast(
        "success",
        "Message sent successfully. You will receive a reply within 24 hours or possibly longer. We appreciate your patience.",
      );
      setTimeout(() => {
        clearState("mail");
        clearAllErrors();
        resetBtn();
      }, 3000);
    } else {
      resetBtn();
      showToast(
        "error",
        "Something went wrong and your message could not be sent. Please try again or email me directly.",
      );
    }
  });
})();
(function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const mailTab = document.querySelector('[data-mode="mail"]');
  const waTab = document.querySelector('[data-mode="whatsapp"]');
  const pill = document.querySelector(".cf-tab-pill");
  const emailOpt = document.getElementById("cfEmailOpt");
  const contactOpt = document.getElementById("cfContactOpt");
  const subjectBlock = document.getElementById("cfSubjectBlock");
  const submitBtn = document.getElementById("cfSubmitBtn");
  const btnIcon = document.getElementById("cfBtnIcon");
  const btnText = document.getElementById("cfBtnText");
  const toast = document.getElementById("cfToast");
  const toastIcon = document.getElementById("cfToastIcon");
  const toastMsg = document.getElementById("cfToastMsg");
  const toastClose = document.getElementById("cfToastClose");

  // Field refs
  const nameInput = document.getElementById("cf-name");
  const emailInput = document.getElementById("cf-email");
  const contactInput = document.getElementById("cf-contact");
  const subjectInput = document.getElementById("cf-subject");
  const msgInput = document.getElementById("cf-message");

  // Inline error elements
  const emailErr = document.getElementById("cf-email-error");
  const contactErr = document.getElementById("cf-contact-error");

  let mode = "mail";
  let switching = false;
  let toastTimer;

  // ------ Independent state preservation ----------------------------
  // Each form stores its own field values so switching tabs never
  // loses what the user has already typed.
  const state = {
    mail: { name: "", email: "", subject: "", message: "" },
    whatsapp: { name: "", contact: "", message: "" },
  };

  function saveState() {
    if (mode === "mail") {
      state.mail.name = nameInput.value;
      state.mail.email = emailInput.value;
      state.mail.subject = subjectInput.value;
      state.mail.message = msgInput.value;
    } else {
      state.whatsapp.name = nameInput.value;
      state.whatsapp.contact = contactInput.value;
      state.whatsapp.message = msgInput.value;
    }
  }

  function restoreState(newMode) {
    if (newMode === "mail") {
      nameInput.value = state.mail.name;
      emailInput.value = state.mail.email;
      subjectInput.value = state.mail.subject;
      msgInput.value = state.mail.message;
    } else {
      nameInput.value = state.whatsapp.name;
      contactInput.value = state.whatsapp.contact;
      msgInput.value = state.whatsapp.message;
    }
  }

  function clearState(clearedMode) {
    if (clearedMode === "mail") {
      state.mail = { name: "", email: "", subject: "", message: "" };
    } else {
      state.whatsapp = { name: "", contact: "", message: "" };
    }
    // Also blank the visible fields
    if (clearedMode === mode) {
      nameInput.value =
        emailInput.value =
        contactInput.value =
        subjectInput.value =
        msgInput.value =
          "";
    }
  }

  // ------ Toast ----------------------------
  function showToast(type, msg) {
    clearTimeout(toastTimer);
    toastIcon.className =
      type === "success"
        ? "cf-toast-icon fas fa-check-circle"
        : "cf-toast-icon fas fa-exclamation-circle";
    toastMsg.textContent = msg;
    toast.dataset.type = type;
    toast.hidden = false;
    void toast.offsetWidth;
    toast.classList.add("cf-toast--in");
    toastTimer = setTimeout(hideToast, 5000);
  }

  function hideToast() {
    toast.classList.remove("cf-toast--in");
    toast.addEventListener(
      "transitionend",
      () => {
        toast.hidden = true;
      },
      { once: true },
    );
  }

  toastClose.addEventListener("click", hideToast);

  // ------ Tab switching ----------------------------
  function switchTo(newMode) {
    if (newMode === mode || switching) return;
    saveState(); // persist current form before switching
    switching = true;
    mode = newMode;
    const toMail = newMode === "mail";

    mailTab.classList.toggle("cf-tab--active", toMail);
    waTab.classList.toggle("cf-tab--active", !toMail);
    mailTab.setAttribute("aria-selected", toMail);
    waTab.setAttribute("aria-selected", !toMail);
    pill.style.transform = toMail ? "translateX(0%)" : "translateX(100%)";

    emailOpt.classList.toggle("cf-partner-opt--active", toMail);
    contactOpt.classList.toggle("cf-partner-opt--active", !toMail);
    subjectBlock.classList.toggle("cf-subject-block--in", toMail);
    subjectBlock.classList.toggle("cf-subject-block--out", !toMail);

    // Clear any leftover error styles from the previous mode
    clearAllErrors();
    restoreState(newMode); // reload saved values for new mode
    resetBtn();

    setTimeout(() => {
      switching = false;
    }, 700);
  }

  mailTab.addEventListener("click", () => switchTo("mail"));
  waTab.addEventListener("click", () => switchTo("whatsapp"));

  // ------ Error helpers ----------------------------
  function setFieldError(input, msgEl, message) {
    const field = input.closest(".cf-field");
    field.classList.add("cf-error");
    if (msgEl) {
      msgEl.textContent = message;
      msgEl.classList.add("cf-field-error--visible");
    }
    input.classList.remove("cf-shake");
    void input.offsetWidth;
    input.classList.add("cf-shake");
    input.addEventListener(
      "animationend",
      () => input.classList.remove("cf-shake"),
      { once: true },
    );
  }

  function clearFieldError(input, msgEl) {
    input.closest(".cf-field")?.classList.remove("cf-error");
    if (msgEl) {
      msgEl.textContent = "";
      msgEl.classList.remove("cf-field-error--visible");
    }
  }

  function clearAllErrors() {
    form
      .querySelectorAll(".cf-field")
      .forEach((f) => f.classList.remove("cf-error"));
    [emailErr, contactErr].forEach((el) => {
      if (el) {
        el.textContent = "";
        el.classList.remove("cf-field-error--visible");
      }
    });
  }

  // ------ Real-time validation ----------------------------
  // Email: clear error once value is valid; flag immediately on bad input
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  emailInput.addEventListener("input", () => {
    const val = emailInput.value;
    if (!val) {
      clearFieldError(emailInput, emailErr);
      return;
    }
    if (!EMAIL_RE.test(val)) {
      const missing = !val.includes("@")
        ? "Missing @ sign"
        : !val.split("@")[1]?.includes(".")
          ? "Missing domain (e.g. gmail.com)"
          : "Enter a valid email address";
      // Show error inline but DON'T shake on every keystroke
      emailInput.closest(".cf-field").classList.add("cf-error");
      emailErr.textContent = missing;
      emailErr.classList.add("cf-field-error--visible");
    } else {
      clearFieldError(emailInput, emailErr);
    }
  });

  // WhatsApp: block invalid chars in real-time + show error
  const WA_VALID_RE = /^\+?[0-9]*$/;

  contactInput.addEventListener("input", () => {
    const val = contactInput.value;
    if (!val) {
      clearFieldError(contactInput, contactErr);
      return;
    }
    // Strip anything that isn't digits or a leading +
    const cleaned = val
      .replace(/(?!^\+)[^0-9]/g, "")
      .replace(/\+/g, (m, offset) => (offset === 0 ? m : ""));
    if (cleaned !== val) {
      contactInput.value = cleaned; // silently strip invalid chars
    }
    if (!WA_VALID_RE.test(cleaned) || cleaned.indexOf("+") > 0) {
      contactInput.closest(".cf-field").classList.add("cf-error");
      contactErr.textContent = "Only digits and a leading + are allowed";
      contactErr.classList.add("cf-field-error--visible");
    } else {
      clearFieldError(contactInput, contactErr);
    }
  });

  // Generic: clear border error on non-email/wa fields once user types
  form.addEventListener("input", (e) => {
    const t = e.target;
    if (t === emailInput || t === contactInput) return; // handled above
    if (t.value.trim()) {
      clearFieldError(t, null);
    }
  });

  // ------ Submit-time validation ----------------------------
  function validate() {
    let ok = true;

    // Common: name
    if (!nameInput.value.trim()) {
      setFieldError(nameInput, null, "");
      ok = false;
    }

    // Common: message
    if (!msgInput.value.trim()) {
      setFieldError(msgInput, null, "");
      ok = false;
    }

    if (mode === "mail") {
      const emailVal = emailInput.value.trim();
      if (!emailVal) {
        setFieldError(emailInput, emailErr, "Email is required");
        ok = false;
      } else if (!EMAIL_RE.test(emailVal)) {
        const missing = !emailVal.includes("@")
          ? "Missing @ sign"
          : !emailVal.split("@")[1]?.includes(".")
            ? "Missing domain (e.g. gmail.com)"
            : "Enter a valid email address";
        setFieldError(emailInput, emailErr, missing);
        ok = false;
      }
      if (!subjectInput.value.trim()) {
        setFieldError(subjectInput, null, "");
        ok = false;
      }
    } else {
      const waVal = contactInput.value.trim();
      if (!waVal) {
        setFieldError(contactInput, contactErr, "WhatsApp number is required");
        ok = false;
      } else if (!WA_VALID_RE.test(waVal) || waVal.length < 7) {
        setFieldError(
          contactInput,
          contactErr,
          waVal.length < 7
            ? "Number too short"
            : "Only digits and a leading + are allowed",
        );
        ok = false;
      }
    }

    return ok;
  }

  // ------ Button helpers ----------------------------
  function resetBtn() {
    submitBtn.disabled = false;
    submitBtn.classList.remove("cf-btn--success");
    btnIcon.className = "fas fa-paper-plane";
    btnText.textContent = "Send Message";
  }

  function setBtnLoading() {
    submitBtn.disabled = true;
    btnIcon.className = "fas fa-spinner fa-spin";
    btnText.textContent = "Sending\u2026";
  }

  function setBtnSuccess() {
    submitBtn.disabled = false;
    submitBtn.classList.add("cf-btn--success");
    btnIcon.className = "fas fa-check";
    btnText.textContent = "Sent!";
  }

  // ------ Submit ----------------------------
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!validate()) return;

    const submittedMode = mode;

    // ------ WhatsApp path ------
    if (submittedMode === "whatsapp") {
      const name = nameInput.value.trim();
      const tel = contactInput.value.trim();
      const msg = msgInput.value.trim();
      const text = encodeURIComponent(
        `Hi Ubaid,\n\nMy name is ${name}.\n\n${msg}\n\n— My WhatsApp: ${tel}`,
      );
      window.open(`https://wa.me/923360973607?text=${text}`, "_blank");
      clearState("whatsapp");
      clearAllErrors();
      showToast(
        "success",
        "Redirected to WhatsApp! If it didn\u2019t open automatically, please try again.",
      );
      return;
    }

    // ------ Mail path ------
    setBtnLoading();

    const formData = new FormData(form);
    let success = false;
    try {
      const res = await fetch("https://formspree.io/f/maqagzyg", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      success = res.ok;
    } catch (_) {
      success = false;
    }

    await new Promise((r) => setTimeout(r, 3000));

    if (success) {
      setBtnSuccess();
      showToast(
        "success",
        "Message sent successfully. You will receive a reply within 24 hours or possibly longer. We appreciate your patience.",
      );
      setTimeout(() => {
        clearState("mail");
        clearAllErrors();
        resetBtn();
      }, 3000);
    } else {
      resetBtn();
      showToast(
        "error",
        "Something went wrong and your message could not be sent. Please try again or email me directly.",
      );
    }
  });
})();
