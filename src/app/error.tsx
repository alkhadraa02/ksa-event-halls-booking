"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">حدث خطأ غير متوقع</h1>
      <p className="mt-2 text-muted">نعتذر عن ذلك. حاول مرة أخرى.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-6">
        إعادة المحاولة
      </button>
    </main>
  );
}
