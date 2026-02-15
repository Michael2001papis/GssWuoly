/**
 * הגדרות EmailJS - שליחת אימיילים אמיתיים
 * 
 * הוראות התקנה:
 * 1. היכנס ל־https://www.emailjs.com/ וצור חשבון חינם
 * 2. הוסף Email Service (Gmail / Outlook וכו') - חיבור לחשבון האימייל שלך
 * 3. צור Email Template חדש עם המשתנים:
 *    - To Email: {{user_email}}
 *    - Subject: איפוס סיסמה
 *    - Content (גוף המייל):
 *      שלום,
 *      ביקשת לאפס את הסיסמה. קוד האיפוס שלך הוא: {{reset_code}}
 *      הקוד תקף ל־10 דקות.
 * 4. העתק את המפתחות למטה:
 */
const EMAILJS_CONFIG = {
  publicKey: "YOUR_PUBLIC_KEY",      // מפתח ציבורי מ־Account > API Keys
  serviceID: "YOUR_SERVICE_ID",      // מזהה השירות מ־Email Services
  templateID: "YOUR_TEMPLATE_ID"     // מזהה התבנית מ־Email Templates
};
