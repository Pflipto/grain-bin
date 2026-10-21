export default function Loading() {
  return (
    <main className="site-shell" aria-busy="true">
      <div className="intro" role="status">
        <div>
          <p className="eyebrow">GRAIN BIN</p>
          <h1>Notes on a<br /><em>New Kind of Money.</em></h1>
          <p className="intro-description">Loading the latest stablecoin market data…</p>
        </div>
      </div>
    </main>
  );
}
