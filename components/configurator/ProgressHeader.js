import { brand } from "../../lib/brand";

export default function ProgressHeader({ step, propertyType, selectedCount }) {
  return (
    <header className="progress-header">
      <div className="mark">
        <strong>STRATA</strong>
        <span>Superior Flooring</span>
      </div>
      <div className="progress-steps" aria-label="Configure progress">
        {[1, 2, 3].map(item => (
          <span key={item} className={item <= step ? "active" : ""} />
        ))}
      </div>
      <div className="context">
        {propertyType || "Project type"}
        {selectedCount > 0 ? ` · ${selectedCount} selected` : ""}
      </div>
      <style>{`
        .progress-header {
          width: min(1120px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: center;
        }
        .mark strong {
          display: block;
          font-family: ${brand.serif};
          color: ${brand.text};
          font-size: 20px;
          letter-spacing: 0.18em;
          line-height: 1;
        }
        .mark span {
          display: block;
          color: rgba(242,237,224,0.34);
          font-size: 8px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin-top: 5px;
        }
        .progress-steps {
          display: flex;
          gap: 5px;
        }
        .progress-steps span {
          width: 34px;
          height: 2px;
          border-radius: 999px;
          background: ${brand.border};
        }
        .progress-steps span.active {
          background: ${brand.gold};
        }
        .context {
          grid-column: 1 / -1;
          justify-self: start;
          color: ${brand.dim};
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        @media (min-width: 760px) {
          .progress-header { grid-template-columns: 1fr auto 1fr; }
          .context { grid-column: auto; justify-self: end; }
        }
      `}</style>
    </header>
  );
}
