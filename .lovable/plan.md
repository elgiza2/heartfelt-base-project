# وكيل برمجة كامل (Terminal + أدوات + نشر) — خطة مبدئية واختيار الـ APIs

الهدف: تحويل الوكيل الحالي (`long-run` + E2B Desktop) إلى وكيل برمجة حقيقي يقدر يبني مشاريع React 18 / Full-stack كاملة، يشغّل terminal داخل sandbox، يكتب قاعدة بيانات على حساب Supabase الخاص بالمستخدم، يستورد من GitHub، وينشر المشروع على استضافة.

## الموجود حاليًا في المشروع
- `api/long-run.ts` + `src/lib/longrun/agentLoop.ts` — حلقة وكيل تعمل على شرائح (45 ثانية / 4 خطوات) مع استئناف من الأحداث، وقادرة على تشغيل 20+ ساعة.
- `@e2b/desktop` متصل بالفعل (bash + GUI + screenshots).
- `api/computer-agent.ts`, `api/mcp.ts`, `src/lib/computer/*` — بنية جاهزة للأدوات و MCP.
- Supabase متصل (جداول `long_runs` و `long_run_events`).

يعني الأساس موجود؛ الناقص هو: طبقة أدوات برمجية منظمة (بدل JSON action واحد)، terminal في الواجهة، وطبقات GitHub / Supabase / Deploy.

---

## 1) الـ Sandbox (تشغيل الكود والـ terminal)

| الخيار | الرصيد المجاني | مناسب لـ | ملاحظات |
|---|---|---|---|
| **E2B** (مستخدم حاليًا) | ~$100 رصيد مبدئي للحسابات الجديدة، Hobby مجاني | تشغيل سريع لكل خطوة، bash + desktop | متصل بالفعل، أقل مجهود |
| **Daytona** | رصيد مجاني عند التسجيل | Workspaces طويلة العمر (مشاريع ضخمة تستمر أيام) | أفضل لاستمرارية حالة المشروع |
| **Modal** | ~$30 شهريًا مجانًا متجدد | مهام batch + GPU | الأفضل من ناحية استمرار الرصيد المجاني |
| **Cloudflare / Vercel Sandbox** | ضمن خطط المنصة | تكامل مع النشر | أضعف في الـ terminal الطويل |

اقتراحي: **E2B للأساس** (موجود) + **Daytona اختياريًا** للمشاريع طويلة الأمد.

## 2) استضافة/نشر المشاريع الناتجة

| الخيار | المجاني | API للنشر البرمجي |
|---|---|---|
| **Cloudflare Workers/Pages** | سخي جدًا ومجاني عمليًا (100k طلب/يوم) + D1 + R2 | Cloudflare API + Wrangler داخل الـ sandbox |
| **Netlify** | 100GB/شهر | Netlify Deploy API (رفع ملفات مباشرة) — أسهل واحد |
| **Vercel** | Hobby مجاني | Vercel REST Deployments API |
| **Fly.io / Railway** | رصيد محدود | مناسب للـ backend/Docker |

اقتراحي: **Netlify API كافتراضي** (نشر بسطر واحد بدون Docker) + **Cloudflare** كخيار للمشاريع اللي فيها backend/DB.

## 3) قواعد البيانات (ربط حساب Supabase للمستخدم)
- **Supabase Management API** + OAuth: المستخدم يربط حسابه → الوكيل يقدر يعمل مشروع، يشغّل SQL migrations، ويجيب الـ anon key ويحقنها في المشروع.
- بديل أخف: المستخدم يلصق Project Ref + Service Role، ونخزّنه مشفّر.

## 4) GitHub
- **GitHub OAuth / App** → استيراد ريبو (clone داخل الـ sandbox)، إنشاء ريبو جديد، commit & push للنتيجة، وفتح PR.

## 5) نموذج الذكاء الاصطناعي
- Lovable AI Gateway (موجود) مع موديل قوي للبرمجة: `openai/gpt-5.6-terra` أو `google/gemini-3.7-flash` للخطوات السريعة، وموديل أقوى للتخطيط.
- استخدام **tool calling** حقيقي بدل JSON نصي.

---

## ما سنبنيه (بعد اختيارك)

### أ) طبقة أدوات الوكيل (Agent Tools)
أدوات مُعرّفة بـ schema بدل الأكشن الواحد الحالي:
`run_bash`, `write_file`, `read_file`, `list_dir`, `apply_patch`, `search_code`, `npm_install`, `start_dev_server`, `read_logs`, `screenshot_preview`, `git_clone/commit/push`, `supabase_sql`, `deploy`.

### ب) Terminal داخل الواجهة
- لوحة terminal حية بجانب الشات تعرض stdout/stderr لكل أمر من الـ sandbox، مع إمكانية كتابة أوامر يدوية من المستخدم في نفس الـ sandbox.
- Streaming عبر أحداث `long_run_events` (Realtime) — نفس البنية الحالية.

### ج) خط إنتاج المشاريع الضخمة
- **Planner** يقسّم المهمة لملفات/مراحل → **Coder** ينفّذ ملف ملف → **Verifier** يشغّل build/lint ويصلح الأخطاء تلقائيًا (auto-fix loop) → **Deployer**.
- قوالب جاهزة: React 18 + Vite + TS + Tailwind، وFull-stack (React + Supabase)، وNext.js.
- شجرة ملفات ومعاينة حية (preview URL من الـ sandbox).

### د) الربط والنشر
- شاشة Integrations: ربط GitHub / Supabase / Netlify-Cloudflare بالـ OAuth، وتخزين التوكنات في جدول مشفّر مع RLS.

---

## القرارات المطلوبة منك
1. **Sandbox**: نكمل بـ E2B فقط؟ ولا نضيف Daytona/Modal للمهام الطويلة؟
2. **النشر**: Netlify (أسهل) / Cloudflare (أسخى) / Vercel / كلهم؟
3. **Supabase**: OAuth كامل (Management API) ولا إدخال يدوي للمفاتيح؟
4. **GitHub**: استيراد فقط، ولا استيراد + push + PR؟

قولّي اختياراتك وأرجع بخطة تنفيذ كاملة بمراحل وملفات وجداول قاعدة بيانات.
