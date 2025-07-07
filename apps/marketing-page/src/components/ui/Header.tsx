import { useUser, useClerk } from "@clerk/clerk-react";
import { User, LogOut, Settings } from "lucide-react";
import { Icon } from "./Icon";

interface HeaderProps {
  onAuthClick: (mode: "signin" | "signup") => void;
}

export default function Header({ onAuthClick }: HeaderProps) {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Icon
              name="Target"
              className="w-4 h-4 text-white animate-spin-slow"
            />
          </div>
          <span className="text-white font-semibold text-lg">
            LinkedIn JobLens AI
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-white">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.firstName || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <span className="hidden sm:block text-sm">
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </span>
              </div>

              <div className="relative group">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200">
                  <Settings className="w-4 h-4" />
                </button>

                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <button
                      onClick={() => signOut(() => console.log("Logged out"))}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onAuthClick("signin")}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                onClick={() => onAuthClick("signup")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
