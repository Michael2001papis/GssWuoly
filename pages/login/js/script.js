document.addEventListener("DOMContentLoaded", function() {
  if (typeof APP !== "undefined") {
    APP.init();
    APP.updateActivity();
    document.getElementById("themeBtn")?.addEventListener("click", function() {
      const theme = APP.getTheme() === "dark" ? "light" : "dark";
      APP.setTheme(theme);
      this.textContent = theme === "dark" ? "🌙" : "☀️";
    });
    if (APP.getTheme() === "light") {
      const tb = document.getElementById("themeBtn");
      if (tb) tb.textContent = "☀️";
    }
    document.getElementById("settingsBtn")?.addEventListener("click", function() {
      document.getElementById("accessibilityModal")?.classList.toggle("active");
    });
  }
  const pwInput = document.getElementById("signupPassword");
  if (pwInput) {
    pwInput.addEventListener("input", function() {
      const p = this.value;
      let score = 0;
      if (p.length >= 6) score++;
      if (p.length >= 10) score++;
      if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
      if (/\d/.test(p)) score++;
      if (/[^a-zA-Z0-9]/.test(p)) score++;
      const el = document.getElementById("passwordStrength");
      if (el) {
        el.classList.remove("weak","medium","strong");
        const bars = el.querySelectorAll(".strength-bar");
        const text = el.querySelector(".strength-text");
        bars.forEach((b,i)=>{ b.style.background = i < score ? (score<=2?"#ef4444":score<=3?"#f59e0b":"#22c55e") : "transparent"; });
        text.textContent = p.length ? (score<=2?"חלשה":score<=3?"בינונית":"חזקה") : "";
      }
    });
  }
  // אם המשתמש כבר מחובר – מעבר ישיר, בלי טופס
  const loggedUser = typeof AUTH !== "undefined" && AUTH.getLoggedUser ? AUTH.getLoggedUser() : null;
  if (loggedUser) {
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get("return") || "index";
    if (returnTo === "ttt") window.location.href = "../games/tic-tac-toe/index.html";
    else if (returnTo === "snake") window.location.href = "../games/snake/index.html";
    else window.location.href = "../home/index.html";
    return;
  }

  const tabBtns = document.querySelectorAll(".tab-btn");
  const signinForm = document.getElementById("signin-form");
  const signupForm = document.getElementById("signup-form");
  const signinFormEl = signinForm.querySelector("form");
  const signupFormEl = signupForm.querySelector("form");
  const forgotLink = document.getElementById("forgotLink");
  const forgotModal = document.getElementById("forgotModal");
  const closeForgot = document.getElementById("closeForgot");
  const forgotForm = document.getElementById("forgotForm");
  const forgotSubmitBtn = document.getElementById("forgotSubmitBtn");

  function getReturnUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("return") || "index";
  }

  function redirectAfterLogin() {
    const returnTo = getReturnUrl();
    if (returnTo === "ttt") {
      window.location.href = "../games/tic-tac-toe/index.html";
    } else if (returnTo === "snake") {
      window.location.href = "../games/snake/index.html";
    } else {
      window.location.href = "../home/index.html";
    }
  }

  // מעבר בין טאבים
  tabBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      const tab = btn.getAttribute("data-tab");
      
      tabBtns.forEach(function(b) {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      signinForm.classList.remove("active");
      signupForm.classList.remove("active");

      if (tab === "signin") {
        signinForm.classList.add("active");
      } else {
        signupForm.classList.add("active");
      }
    });
  });

  function showMsg(msg, type) {
    if (typeof Toast !== "undefined") {
      if (type === "success") Toast.success(msg);
      else if (type === "error") Toast.error(msg);
      else Toast.info(msg);
    } else alert(msg);
  }

  // התחברות
  signinFormEl.addEventListener("submit", function(e) {
    e.preventDefault();
    const email = this.querySelector('input[name="email"]').value.trim();
    const password = this.querySelector('input[name="password"]').value;
    const result = AUTH.signin(email, password);
    if (result.success) {
      showMsg("ברוך הבא!", "success");
      redirectAfterLogin();
    } else {
      showMsg(result.error, "error");
    }
  });

  // הרשמה
  signupFormEl.addEventListener("submit", function(e) {
    e.preventDefault();
    const name = this.querySelector('input[name="name"]').value.trim();
    const email = this.querySelector('input[name="email"]').value.trim();
    const password = this.querySelector('input[name="password"]').value;
    const result = AUTH.signup(name, email, password);
    if (result.success) {
      showMsg("🎉 ברוך הבא " + name + "! נרשמת בהצלחה.", "success");
      redirectAfterLogin();
    } else {
      showMsg(result.error, "error");
    }
  });

  // פתיחת חלון שכחת סיסמה
  forgotLink.addEventListener("click", function(e) {
    e.preventDefault();
    forgotModal.classList.add("active");
    forgotModal.setAttribute("aria-hidden", "false");
    setTimeout(function() {
      const firstInput = forgotForm.querySelector('input[type="email"]');
      if (firstInput) firstInput.focus();
    }, 100);
  });

  // סגירת חלון
  function closeModal() {
    forgotModal.classList.remove("active");
    forgotModal.setAttribute("aria-hidden", "true");
  }

  closeForgot.addEventListener("click", closeModal);

  forgotModal.addEventListener("click", function(e) {
    if (e.target === forgotModal) closeModal();
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && forgotModal.classList.contains("active")) closeModal();
  });

  // שליחת טופס איפוס סיסמה - אימייל אמיתי דרך EmailJS
  forgotForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    var emailInput = forgotForm.querySelector('input[type="email"]');
    var email = emailInput.value.trim();
    
    if (!email) {
      showMsg("יש להזין כתובת אימייל.", "error");
      return;
    }

    // בדיקה שהמשתמש הגדיר את EmailJS
    if (typeof EMAILJS_CONFIG === "undefined" || 
        !EMAILJS_CONFIG.publicKey || EMAILJS_CONFIG.publicKey === "YOUR_PUBLIC_KEY" ||
        !EMAILJS_CONFIG.serviceID || EMAILJS_CONFIG.serviceID === "YOUR_SERVICE_ID" ||
        !EMAILJS_CONFIG.templateID || EMAILJS_CONFIG.templateID === "YOUR_TEMPLATE_ID") {
      showMsg("שליחת אימייל לא מוגדרת. ערוך את email-config.js", "error");
      return;
    }

    // יצירת קוד איפוס בן 6 ספרות
    var resetCode = String(Math.floor(100000 + Math.random() * 900000));

    // שמירה ב-localStorage לבדיקה (תוקף 10 דקות)
    var expiry = Date.now() + 10 * 60 * 1000;
    try {
      var codes = JSON.parse(localStorage.getItem("passwordResetCodes") || "{}");
      codes[email] = { code: resetCode, expiry: expiry };
      localStorage.setItem("passwordResetCodes", JSON.stringify(codes));
    } catch (err) {}

    // טעינה
    forgotSubmitBtn.disabled = true;
    forgotSubmitBtn.textContent = "שולח...";

    // שליחת אימייל דרך EmailJS
    if (typeof emailjs === "undefined") {
      showMsg("ספריית EmailJS לא נטענה. בדוק את החיבור לאינטרנט.", "error");
      forgotSubmitBtn.disabled = false;
      forgotSubmitBtn.textContent = "שלח קוד איפוס";
      return;
    }

    emailjs.init(EMAILJS_CONFIG.publicKey);

    emailjs.send(EMAILJS_CONFIG.serviceID, EMAILJS_CONFIG.templateID, {
      user_email: email,
      reset_code: resetCode
    })
    .then(function() {
      showMsg("קוד איפוס נשלח לכתובת " + email, "success");
      closeModal();
      forgotForm.reset();
    })
    .catch(function(err) {
      console.error("EmailJS error:", err);
      showMsg("שגיאה בשליחת האימייל. בדוק את ההגדרות ב-email-config.js", "error");
    })
    .finally(function() {
      forgotSubmitBtn.disabled = false;
      forgotSubmitBtn.textContent = "שלח קוד איפוס";
    });
  });
});
