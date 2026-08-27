import { useEffect, useMemo, useRef } from "react";
import { useComposerRuntime } from "@assistant-ui/react";
import type { AttachedFile } from "../../hooks/useAttachments";

/**
 * جسر أحادي الاتجاه: يعكس قائمة `attachedFiles` (المصدر الأصلي في
 * ChatPage → useAttachments) إلى runtime composer الخاص بـ assistant-ui.
 *
 * PERF/CORRECTNESS: الاعتماد على `composer` نفسه كـ dependency كان يعيد تشغيل
 * الـ effect في كل render — و`clearAttachments()` بدوره يحدّث الـ composer
 * store، فينتج عنه حلقة لا نهائية على صفحة الشات
 * ("Maximum update depth exceeded / getSnapshot should be cached").
 * الآن الـ effect يعتمد على بصمة المرفقات فقط، والـ runtime يُقرأ من ref،
 * ولا ننادي clear إلا لو فيه فعلًا مرفقات سابقة تمت مزامنتها.
 */
export function AttachmentsSync({
  attachedFiles,
}: {
  attachedFiles: AttachedFile[];
}) {
  const composer = useComposerRuntime();
  const composerRef = useRef(composer);
  composerRef.current = composer;

  const syncable = useMemo(
    () => attachedFiles.filter((f) => f.type !== "link"),
    [attachedFiles],
  );
  const signature = useMemo(
    () => syncable.map((f) => `${f.name}:${f.type}:${f.data?.length ?? 0}`).join("|"),
    [syncable],
  );

  const syncedRef = useRef("");

  useEffect(() => {
    if (syncedRef.current === signature) return;
    const previous = syncedRef.current;
    syncedRef.current = signature;

    // Nothing was ever pushed and nothing to push → no composer mutation at all.
    if (!previous && !signature) return;

    let cancelled = false;
    const files = syncable;
    (async () => {
      const runtime = composerRef.current;
      try {
        if (previous) await runtime.clearAttachments();
      } catch {
        /* ignore */
      }
      for (const f of files) {
        if (cancelled) return;
        try {
          const blob = await dataUrlToBlob(f.data);
          const file = new File([blob], f.name, { type: blob.type });
          await runtime.addAttachment(file);
        } catch {
          /* ignore individual failures */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return null;
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}
