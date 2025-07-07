import { Icon } from "../ui/Icon";
import { useNavigate } from "react-router";

interface SuccessViewProps {
  title: string;
  description: string;
  buttonText?: string;
  onAction?: () => void;
}

export const SuccessView = ({
  title,
  description,
  buttonText = "Back to Home",
  onAction,
}: SuccessViewProps) => {
  const navigate = useNavigate();
  const handleAction = onAction || (() => navigate("/"));

  return (
    <>
      <Icon name="Check" className="w-16 h-16 text-green-400 mx-auto mb-6" />
      <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
      <p className="text-lg text-gray-300 mb-8">{description}</p>
      <button
        onClick={handleAction}
        className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300"
      >
        {buttonText}
      </button>
    </>
  );
};
