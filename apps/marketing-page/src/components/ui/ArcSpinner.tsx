export const ArcSpinner = () => {
  return (
    <>
      <style>
        {`
          .chrono-slicer-loader {
            width: 80px;
            height: 80px;
            position: relative;
            background: conic-gradient(from 0deg,
              #F87171, #FBBF24, #34D399, #60A5FA, #A78BFA, #F472B6, #F87171
            );
            border-radius: 50%;
            animation: spin 2s linear infinite;
          }

          
          .chrono-slicer-loader::after {
            content: '';
            position: absolute;
            top: 5px;
            left: 5px;
            width: 70px;  /* Main size (80px) - 2 * border size (5px) */
            height: 70px;
            border-radius: 50%;
            background: #1F2937; /* IMPORTANT: Match your page's background */
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
        `}
      </style>
      <div className="chrono-slicer-loader" />
    </>
  );
};
