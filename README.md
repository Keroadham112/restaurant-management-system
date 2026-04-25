Project: Restaurant menu frontend (HTML/CSS/Vanilla JS + Axios)

Demo restaurant: "KEROO"

Goal:
- Show items from mockapi.io or from the built-in local seed if API is not configured.
- CRUD operations via Axios to /items (or in-memory fallback).
- Pages: Home (`task frond.html`), `menu.html`, `details.html`, `admin.html`.

Seed data included
You can run the project immediately without mockapi; the app uses local seed data when `API_BASE` is empty. Items included (expected image filenames):

1. id: 1, name: Hummus Starter, category: Starters, price: 100 EGP, image: `assets/images/item-1.jpg`, featured: true
2. id: 2, name: Fattoush Salad, category: Starters, price: 110 EGP, image: `assets/images/item-2.jpg`, featured: false
3. id: 3, name: Chicken Shawarma, category: Main, price: 150 EGP, image: `assets/images/item-3.jpg`, featured: true
4. id: 4, name: Cheeseburger, category: Main, price: 160 EGP, image: `assets/images/item-7.jpg`, featured: false
5. id: 5, name: Chicken Kabsa, category: Main, price: 170 EGP, image: `assets/images/item-8.jpg`, featured: false
6. id: 6, name: Alfredo Pasta with Chicken, category: Main, price: 140 EGP, image: `assets/images/item-9.jpg`, featured: false
7. id: 7, name: Lamb Mandi, category: Main, price: 200 EGP, image: `assets/images/item-10.jpg`, featured: true
8. id: 8, name: Grilled Fish, category: Main, price: 180 EGP, image: `assets/images/item-11.jpg`, featured: false
9. id: 9, name: Kunafa with Cream, category: Desserts, price: 120 EGP, image: `assets/images/item-5.jpg`, featured: true
10. id: 10, name: Vanilla Ice Cream, category: Desserts, price: 100 EGP, image: `assets/images/item-12.jpg`, featured: false
11. id: 11, name: Baklava, category: Desserts, price: 110 EGP, image: `assets/images/item-13.jpg`, featured: false
12. id: 12, name: Om Ali, category: Desserts, price: 115 EGP, image: `assets/images/item-14.jpg`, featured: false
13. id: 13, name: Chocolate Cake, category: Desserts, price: 130 EGP, image: `assets/images/item-15.jpg`, featured: false
14. id: 14, name: Cheesecake, category: Desserts, price: 140 EGP, image: `assets/images/item-16.jpg`, featured: false
15. id: 15, name: Lemon Mint Juice, category: Drinks, price: 100 EGP, image: `assets/images/item-17.jpg`, featured: false
16. id: 16, name: Turkish Coffee, category: Drinks, price: 100 EGP, image: `assets/images/item-18.jpg`, featured: false
17. id: 17, name: Fresh Mango Juice, category: Drinks, price: 120 EGP, image: `assets/images/item-19.jpg`, featured: false
18. id: 18, name: Virgin Mojito, category: Drinks, price: 110 EGP, image: `assets/images/item-20.jpg`, featured: false

Images to add (upload to `assets/images/`):
item-1.jpg, item-2.jpg, item-3.jpg, item-5.jpg, item-7.jpg, item-8.jpg, item-9.jpg, item-10.jpg, item-11.jpg, item-12.jpg, item-13.jpg, item-14.jpg, item-15.jpg, item-16.jpg, item-17.jpg, item-18.jpg, item-19.jpg, item-20.jpg

ملاحظة مهمة عن الصور
- لإن أردت صور حقيقية، ضع الملفات في `assets/images/` بنفس الأسماء أعلاه (`item-1.jpg` ... `item-6.jpg`).
- إن لم تضف صور، سيُستخدم رابط بديل (placeholder) تلقائياً في بعض المواضع.

إعداد الـ API (اختياري):
1. افتح حساب وأنشئ مشروع + resource باسم "items" في mockapi.io.
2. انسخ الـ base URL الخاص بمشروعك، مثال: `https://64abcd1234.mockapi.io`.
3. افتح `assets/js/api.js` وضع قيمة `API_BASE` لعنوانك (بدون مسار `/items`). مثال:
   const API_BASE = 'https://64abcd1234.mockapi.io';

كيفية التشغيل محليًا:
- لأن المشروع صفحات ثابتة، افتح `task frond.html` في المتصفح.
- أو أنشر عبر GitHub Pages / Netlify عن طريق رفع هذا المجلد.

ملاحظات:
- قمت بتضمين Toasts وspinners وفلاتر بحث.
- الصفحة الإدارية تستخدم prompt لعمليات التعديل السريعة؛ يمكن استبدالها بنموذج modal لاحقًا.

خطوات مقترحة تالية:
- رفع صور `assets/images/item-1.jpg` ... `item-6.jpg` لتحسين العرض.
- إضافة صفحة سلة (checkout) لعرض محتوى LocalStorage.
- تحسين واجهة Edit بنموذج modal وإضافة تحقق أقوى على الحقول.
