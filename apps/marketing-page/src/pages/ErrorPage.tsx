// apps/marketing-page/src/pages/UnsubscriptionPage.tsx

import { Icon } from "../components/ui/Icon";

type ErrorType = "unsubscription" | "subscription";

type TextObj = {
  title: string;
  description: string;
};

interface ErrorPageProps {
  type: ErrorType;
}

const errorTypeToText: Record<ErrorType, TextObj> = {
  unsubscription: {
    title: "Something Went Wrong",
    description:
      "Your unsubscription request could not be processed. Please try again later or contact support if the issue persists.",
  },
  subscription: {
    title: "Something Went Wrong",
    description:
      "Your subscription request could not be processed. Please try again later or contact support if the issue persists.",
  },
};

const ErrorPage = ({ type }: ErrorPageProps) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-xl max-w-lg mx-auto">
        <Icon name="X" className="w-16 h-16 text-red-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">
          {errorTypeToText[type].title}
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          {errorTypeToText[type].description}
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default ErrorPage;
