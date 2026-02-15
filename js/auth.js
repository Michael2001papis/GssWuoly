/**
 * מערכת אימות מקומית (localStorage) - ללא שרת
 */
const AUTH = {
  USERS_KEY: "gameHubUsers",
  LOGGED_KEY: "loggedInUser",

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.USERS_KEY) || "[]");
    } catch {
      return [];
    }
  },

  saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  getLoggedUser() {
    try {
      return JSON.parse(localStorage.getItem(this.LOGGED_KEY) || "null");
    } catch {
      return null;
    }
  },

  setLoggedUser(user) {
    if (user) {
      localStorage.setItem(this.LOGGED_KEY, JSON.stringify({
        name: user.name,
        email: user.email,
        avatar: user.avatar || "👤"
      }));
    } else {
      localStorage.removeItem(this.LOGGED_KEY);
    }
  },

  updateAvatar(emoji) {
    const u = this.getLoggedUser();
    if (!u) return;
    const avatar = emoji || "👤";
    const users = this.getUsers();
    const idx = users.findIndex((x) => x.email === u.email);
    if (idx >= 0) {
      users[idx].avatar = avatar;
      this.saveUsers(users);
    }
    this.setLoggedUser({ ...u, avatar });
  },

  logout() {
    this.setLoggedUser(null);
  },

  _validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
  },

  signup(name, email, password) {
    const em = (email || "").trim().toLowerCase();
    if (!em) return { success: false, error: "יש להזין כתובת אימייל." };
    if (!this._validEmail(em)) return { success: false, error: "כתובת האימייל אינה תקינה." };
    if ((password || "").length < 6) return { success: false, error: "הסיסמה חייבת להכיל לפחות 6 תווים." };
    if (!(name || "").trim()) return { success: false, error: "יש להזין שם." };
    const users = this.getUsers();
    if (users.some(u => u.email === em)) {
      return { success: false, error: "אימייל זה כבר רשום. נסה להתחבר." };
    }
    users.push({ name: name.trim(), email: em, password, avatar: "👤" });
    this.saveUsers(users);
    this.setLoggedUser({ name: name.trim(), email: em, avatar: "👤" });
    return { success: true, isNewUser: true };
  },

  signin(email, password) {
    const em = (email || "").trim().toLowerCase();
    if (!em) return { success: false, error: "יש להזין כתובת אימייל." };
    if (!this._validEmail(em)) return { success: false, error: "כתובת האימייל אינה תקינה." };
    if (!(password || "").length) return { success: false, error: "יש להזין סיסמה." };
    const users = this.getUsers();
    const user = users.find(u => u.email === em && u.password === password);
    if (!user) {
      return { success: false, error: "אימייל או סיסמה שגויים." };
    }
    this.setLoggedUser({ name: user.name, email: user.email, avatar: user.avatar || "👤" });
    return { success: true, isNewUser: false };
  }
};
