import { useTheme } from "next-themes";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
      <Link href="/">
        <div className="flex items-center cursor-pointer">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-red-600 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
            />
          </svg>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">BMGii Chat</h1>
        </div>
      </Link>
      
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:inline">
              {user?.username}
            </span>
            <div onClick={() => window.location.href = "/profile"}>
              <Button variant="outline" size="sm">
                Профиль
              </Button>
            </div>
          </div>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm">
              Войти
            </Button>
          </Link>
        )}
        
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="material-icons dark:text-white block dark:hidden">dark_mode</span>
          <span className="material-icons text-white hidden dark:block">light_mode</span>
        </button>
      </div>
    </header>
  );
}
