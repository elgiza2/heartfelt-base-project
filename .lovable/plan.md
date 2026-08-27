# خطة إضافة ثيم أبيض (Light Theme) للتطبيق

## الوضع الحالي
التطبيق مقفول على الوضع الداكن بالكامل:
- `src/App.tsx` يفرض `dark` على `<html>` عند الإقلاع.
- `src/lib/appTheme.ts` مجرد stubs بترجّع `"dark"` دايمًا.
- `src/index.css` فيه توكنز `:root` (فاتحة) و`.dark` (داكنة)، بس فيه كمان قواعد "قسرية" بتقلب `bg-white / bg-black / text-white / text-black` حسب الكلاس.
- ملفات ستايل إضافية (`deferred.css`, `manus-theme.css`, `chat-legibility.css`, `mobile-sunset-buttons.css`, `settings-amber.css`, `claude-chat.css`, ...) فيها ألوان داكنة مثبتة بدون شرط.
- حوالي 23 ملف tsx فيه ألوان hardcoded (`bg-black`, `text-white`, `bg-[#...]`).

## المبدأ الأساسي
الثيم الفاتح ما يتعملش بألوان جديدة متناثرة، بل بـ **توكنز**:
كل الألوان تيجي من متغيرات CSS في `:root` (فاتح) و`.dark` (داكن)، والمكوّنات تستخدم `bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground` بدل الألوان الصريحة.

## المراحل

### 1) تشغيل مفتاح الثيم (البنية التحتية)
- إرجاع `appTheme.ts` لتنفيذ حقيقي: `light | dark | system`، تخزين في `localStorage` (`megsy_theme`)، ومزامنة `<html class>` + `data-theme` + `colorScheme` + `<meta name="theme-color">`.
- سكربت صغير inline في `index.html` يطبّق الثيم قبل أول رسم (منع الوميض).
- إزالة الفرض في `App.tsx` واستبداله بـ `initTheme()`.
- إضافة اختيار الثيم في `Settings → Customization` (فاتح / داكن / تلقائي).

### 2) ضبط لوحة التوكنز الفاتحة
- مراجعة `:root` في `index.css`: background, foreground, card, popover, muted, border, input, ring, sidebar، وقيم الـ shadows والـ glass.
- التأكد من تباين AA للنصوص الثانوية والأيقونات.
- تعديل `.ambient-bg`, gradients, glow, overlays عشان يبقى ليها نسخة فاتحة هادية بدل السوداء.

### 3) تحييد قواعد الألوان القسرية
مراجعة الكتلة اللي بتتحكم في `bg-white/bg-black/text-white/text-black` في `index.css` وإعادة كتابتها كـ mapping متماثل للجهتين، بدل استثناءات `theme-fixed` المتراكمة.

### 4) ملفات الستايل المساعدة
لكل ملف من: `deferred.css`, `manus-theme.css`, `manus-tokens.css`, `chat-legibility.css`, `claude-chat.css`, `mobile-sunset-buttons.css`, `settings-amber.css`, `megsy-workspace.css`, `ios-glass.css`, `page-transitions.css`:
- تحويل الألوان الثابتة لتوكنز، أو تغليف القيم الداكنة بـ `html.dark { ... }` مع مقابل فاتح.

### 5) الشات (الأهم — تغطية كاملة)
تغطية كل عناصر الشات الداخلية:
- Composer: الحقل، زر Plus، الشيبس، قوائم الموديل/الخدمات، المرفقات، التسجيل الصوتي.
- الرسائل: فقاعات المستخدم/المساعد، Markdown، الكود بلوكات (Syntax highlight فاتح)، الجداول، الاقتباسات، الروابط.
- أدوات الوكيل: قوائم المهام، خطوات التنفيذ، Terminal/logs، معاينة الملفات، بطاقات النشر والسكرين شوت.
- Canvas / Artifacts / Preview panes، الـ sidebar، قوائم المحادثات، البحث، المودالات والـ sheets، الـ toasts، الـ skeletons والـ loaders، الـ scrollbars.

### 6) باقي التطبيق
كل الصفحات: الرئيسية، الإعدادات بكل صفحاتها، الملف الشخصي، الفواتير، الإحالات، الصور/الفيديو/العروض/المستندات، Integrations، MCP، Skills، صفحات الحالة والخصوصية، الأخطاء و404.

### 7) الاستثناء الوحيد
صفحات **تسجيل الدخول والتسجيل** (Auth/Sign in/Sign up + الشاشات المرتبطة بيها) تفضل زي ما هي بالضبط بدون أي تغيير — هيتم تثبيتها بكلاس `theme-fixed`/سكوب خاص عشان الثيم ما يأثرش عليها.

### 8) التحقق
- فحص بصري بـ Playwright لكل مسار رئيسي في الوضعين (موبايل + ديسكتوب).
- التأكد من عدم وجود وميض عند الإقلاع، وثبات الاختيار بعد إعادة التحميل.
- بحث نهائي عن أي `bg-black/text-white/#hex` متبقي خارج صفحات الدخول.

## ملاحظات تقنية
- ما فيش تغيير في المنطق أو الباك اند — شغل واجهة وستايل فقط.
- التنفيذ تدريجي: المرحلة 1 و2 أولًا (مفتاح شغال + لوحة ألوان)، وبعدها المرور على الشات ثم باقي الصفحات.
