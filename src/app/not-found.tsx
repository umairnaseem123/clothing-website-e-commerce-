import Link from "next/link";

export default function NotFound() {
  return (
    <div className="k-state">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or has moved.</p>
      <Link className="k-add k-inline" href="/">Back to home</Link>
    </div>
  );
}
