# وكيل برمجة جديد (Dev Agent) — معزول تمامًا

## المبدأ
لا نلمس أي كود موجود. كل شيء جديد تحت مجلدات جديدة فقط:
- `src/lib/devagent/*` (المنطق)
- `api/dev-agent.ts` (نقطة دخول واحدة جديدة)
- `src/pages/devagent/*` (واجهة + تريمينال)
- جداول جديدة بادئة `dev_*` في Supabase

الوكيل الأساسي (الشات) **لا يتغير كوده**. الاستدعاء يتم لاحقًا بسطر واحد اختياري: أداة `dev_agent` تُضاف لقائمة الأدوات، أو ببساطة رابط `@dev` يفتح الصفحة الجديدة. قرار الربط مؤجل لآخر مرحلة.

كلامك صح: `manus` مربوط لكنه طبقة خارجية مغلقة لا نبني عليها — الوكيل الجديد مستقل عنها تمامًا.

---

## الـ APIs الجاهزة المقترحة (الاختيار مطلوب)

### 1) بيئة التشغيل + الملفات + المعاينة — الحجر الأساس

**الخيار A — Freestyle.sh (الموصى به بقوة)**
لأنه يوفر الثلاثة معًا في API واحد بدل ما نبنيهم:
- **Git Filesystem API**: كل مشروع = ريبو Git حقيقي مستضاف عندهم. الوكيل يكتب ملفات، وإحنا نحصل على commits/branches/diff/rollback **مجانًا** بدل ما نخترع نظام checkpoints.
- **Dev Server API**: يشغّل `npm install` + Vite dev server ويرجّع **رابط معاينة حي مع HMR** — دي بالظبط الحاجة الناقصة لمشاريع React 18/19 العملاقة (بدل Babel-CDN الحالي).
- **VMs API**: `vm.exec()` = التريمينال الحقيقي مع stdout/stderr.
- **Deploy API**: نشر مباشر لدومين `*.style.dev` أو دومين مخصص.
- المجاني: **10 VMs متزامنة + 500 ريبو، $0 للأبد**.

**الخيار B — E2B (مثبت أصلًا في المشروع)**
sandbox + terminal ممتازين، لكن **مفيش Git ولا dev-server ولا نشر** — نبنيهم بأنفسنا. رصيد مجاني $100 مبدئي فقط.

**الخيار C — Daytona / Vercel Sandbox / Cloudflare Sandbox**
Daytona أسرع cold start وأنسب للجلسات الطويلة، لكن نفس نقص Git/Deploy مثل E2B.

> رأيي: **Freestyle للمشاريع (كود + معاينة + نشر)**، ونخلي E2B للمهام العامة الموجودة أصلًا.

### 2) عقل الوكيل (Agent Loop)
- **Vercel AI SDK** (`ai` + `@ai-sdk/openai-compatible`) بدل الحلقة اليدوية: يدي لنا tool-calling، multi-step، streaming، والغاء — جاهزين.
- الموديل عبر **Lovable AI Gateway** (`openai/gpt-5.6-sol` للتخطيط + `gpt-5.6-terra` للتنفيذ)، أو نكمل على `chat-alibaba` الموجود.

### 3) GitHub (استيراد + push + PR)
- **GitHub REST API** مباشرة (`/repos`, `/git/trees`, `/pulls`) + OAuth App.
- أو أسهل: نستنسخ الريبو داخل الـ VM بأمر `git clone` واحد ونرفعه بـ `git push` — بدون أي API إضافي.

### 4) قاعدة البيانات (Supabase)
- **Supabase Management API** (`/v1/projects`, `/v1/projects/{ref}/database/query`): إنشاء مشروع، تشغيل migrations، جلب المفاتيح وحقنها في `.env` داخل الـ VM تلقائيًا.
- OAuth رسمي من Supabase عشان المستخدم يربط حسابه بضغطة.

### 5) النشر
- افتراضي: **Freestyle Deploy** (نفس المزود، صفر إعداد).
- بديل/إضافي: **Netlify API** (أبسط API نشر) أو **Cloudflare Workers/Pages** (أسخى tier مجاني).

---

## شكل النظام الجديد

```text
صفحة /dev-agent  ──►  api/dev-agent.ts  ──►  AI SDK loop
     │  Terminal + شجرة ملفات + معاينة        │
     │                                        ├─ tools: bash / read / write / patch
     └──── SSE / Realtime ◄───────────────────┤          git_commit / npm_install
                                              ├─ Freestyle: VM + Git + DevServer + Deploy
                                              ├─ GitHub: import / push / PR
                                              └─ Supabase Mgmt: create DB + migrations
```

### الأدوات التي سيملكها الوكيل
`run_command` (تريمينال حقيقي) · `read_file` · `write_file` · `apply_patch` · `list_dir` · `search_code` · `npm_install` · `start_dev_server` · `read_logs` · `git_commit` / `git_branch` · `import_github_repo` · `create_supabase_db` · `run_migration` · `deploy` · `todo_write` (تخطيط مهام عملاقة) · `spawn_subagent` (تقسيم المهام الطويلة).

### حلقة المهام العملاقة
Planner → قائمة مهام مستمرة في `dev_tasks` → Coder ينفذ مهمة واحدة كل مرة → Verifier يشغّل `npm run build` ويقرأ الأخطاء ويصلحها تلقائيًا → commit بعد كل مهمة ناجحة. الجلسة قابلة للاستئناف لأن الحالة كلها في Git + قاعدة البيانات، مش في الذاكرة.

---

## المطلوب منك الآن
1. بيئة التشغيل: **Freestyle** (موصى به) أم **E2B** أم **Daytona**؟
2. النشر: Freestyle المدمج أم Netlify أم Cloudflare؟
3. عقل الوكيل: **AI SDK + Lovable Gateway** أم نكمل على `chat-alibaba`؟
4. GitHub: `git clone/push` داخل الـ VM (أبسط) أم GitHub API كامل بـ PRs؟

بعد اختيارك أكتب الخطة التنفيذية الكاملة بالملفات والجداول ومراحل التنفيذ.
