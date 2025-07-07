import { ArcSpinner } from "./ArcSpinner";

export const DefaultPollingView = () => (
  <div className="flex flex-col items-center justify-center min-h-[250px]">
    <ArcSpinner />
    <p className="mt-6 text-lg text-gray-400">Confirming status...</p>
  </div>
);
