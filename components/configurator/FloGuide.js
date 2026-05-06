import { brand } from "../../lib/brand";

export default function FloGuide({ message }) {
  return (
    <aside className="flo-guide" aria-live="polite">
      <div className="badge">F</div>
      <div>
        <strong>Flo</strong>
        <p>{message}</p>
      </div>
      <style>{`
        .flo-guide {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid rgba(201,169,110,0.18);
          background: rgba(26,26,24,0.72);
          border-radius: 16px;
          padding: 14px;
          box-shadow: 0 18px 50px rgba(0,0,0,0.24);
        }
        .badge {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: ${brand.gold};
          color: ${brand.bg};
          font-family: ${brand.serif};
          font-style: italic;
          font-weight: 700;
          flex: 0 0 auto;
        }
        strong {
          display: block;
          color: ${brand.gold};
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        p {
          color: ${brand.text};
          margin: 0;
          font-family: ${brand.serif};
          font-size: 17px;
          font-style: italic;
          line-height: 1.35;
        }
        @media (min-width: 760px) {
          .flo-guide {
            max-width: 620px;
            margin: 0 auto;
            width: 100%;
          }
        }
      `}</style>
    </aside>
  );
}
