import React from "react";

/**
 * Marqueur visuel de fin de page A4
 * Prend en compte les marges Puppeteer de 20mm top et bottom
 * Hauteur de page effective : 297mm - 20mm - 20mm = 257mm
 */
const PageBreakMarker: React.FC = () => {
  return (
    <>
      <div className="page-break-marker">
        <div className="marker-line"></div>
        <div className="marker-label">Fin de page A4</div>
      </div>

      <style>{`
        .page-break-marker {
          height: 2px;
          position: relative;
          pointer-events: none;
          margin: 0;
        }

        .marker-line {
          position: absolute;
          top: 0;
          left: -20mm;
          right: -20mm;
          height: 2px;
          background: repeating-linear-gradient(
            to right,
            #ff6b6b 0px,
            #ff6b6b 10px,
            transparent 10px,
            transparent 20px
          );
        }

        .marker-label {
          position: absolute;
          top: -25px;
          right: -20mm;
          background: #ff6b6b;
          color: white;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 3px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media print {
          .page-break-marker {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default PageBreakMarker;
