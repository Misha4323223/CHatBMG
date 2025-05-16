export default function TypingIndicator() {
  return (
    <div className="typing-indicator bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[200px] mx-4 mb-3 flex items-center">
      <div className="flex-shrink-0 mr-2">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
          <span className="material-icons text-xs">smart_toy</span>
        </div>
      </div>
      <div className="flex items-center">
        <span className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full inline-block mr-1"></span>
        <span className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full inline-block mr-1"></span>
        <span className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full inline-block"></span>
      </div>
    </div>
  );
}
