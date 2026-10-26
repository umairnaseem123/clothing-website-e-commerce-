"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="k-state">
      <h1>Something went wrong</h1>
      <p>We could not load this page. Please try again.</p>
      <button type="button" className="k-add" onClick={() => reset()}>Try again</button>
    </div>
  );
}
