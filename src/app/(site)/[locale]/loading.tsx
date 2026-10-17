export default function Loading() {
  return (
    <div className="container loading-shell" aria-busy="true">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-hero" />
    </div>
  );
}
