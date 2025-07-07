import { SignIn, SignUp } from "@clerk/clerk-react";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  mode,
  onModeChange,
}: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 pb-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === "signin" ? "Welcome Back" : "Join LinkedIn JobLens AI"}
          </h2>
          <p className="text-gray-400">
            {mode === "signin"
              ? "Sign in to access AI-powered job summaries"
              : "Create your account to get started"}
          </p>
        </div>

        <div className="px-6 pb-6">
          {mode === "signin" ? (
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none border-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "bg-gray-800 border-gray-600 text-white hover:bg-gray-700",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                  formFieldInput: "bg-gray-800 border-gray-600 text-white",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-blue-400",
                  footerActionLink: "text-blue-400 hover:text-blue-300",
                },
              }}
            />
          ) : (
            <SignUp
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none border-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "bg-gray-800 border-gray-600 text-white hover:bg-gray-700",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                  formFieldInput: "bg-gray-800 border-gray-600 text-white",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-blue-400",
                  footerActionLink: "text-blue-400 hover:text-blue-300",
                },
              }}
            />
          )}
        </div>

        <div className="px-6 pb-6 text-center border-t border-gray-700 pt-4">
          <p className="text-gray-400">
            {mode === "signin"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() =>
                onModeChange(mode === "signin" ? "signup" : "signin")
              }
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
