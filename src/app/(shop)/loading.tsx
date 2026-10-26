export default function Loading() {
  return (
    <section className="section" aria-busy="true" aria-label="Loading">
      <div className="k-skel k-skel-head" />
      <div className="grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="k-skel-card">
            <div className="k-skel k-skel-img" />
            <div className="k-skel k-skel-line" />
            <div className="k-skel k-skel-line short" />
          </div>
        ))}
      </div>
    </section>
  );
}
