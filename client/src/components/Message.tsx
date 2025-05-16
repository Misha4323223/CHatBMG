import { Message as MessageType } from "@/lib/types";

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const { role, content, timestamp } = message;

  const formatMessage = (text: string) => {
    // Split by newlines to handle lists
    const paragraphs = text.split("\n");
    
    return (
      <>
        {paragraphs.map((paragraph, i) => {
          // Check if it's a list item (starts with - or *)
          if (paragraph.trim().match(/^[-*]\s/)) {
            return (
              <li key={i} className="ml-5">
                {paragraph.trim().replace(/^[-*]\s/, '')}
              </li>
            );
          }
          
          // Check if it's empty
          if (!paragraph.trim()) {
            return <br key={i} />;
          }
          
          // Regular paragraph
          return <p key={i}>{paragraph}</p>;
        })}
      </>
    );
  };

  if (role === 'user') {
    return (
      <div className="flex items-start justify-end">
        <div className="bg-primary-light dark:bg-blue-900 rounded-lg p-3 max-w-[85%]">
          <div className="text-sm text-gray-800 dark:text-gray-100">
            {formatMessage(content)}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block text-right">{timestamp}</span>
        </div>
        <div className="flex-shrink-0 ml-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <span className="material-icons text-sm text-gray-600 dark:text-gray-300">person</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mr-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          <span className="material-icons text-sm">smart_toy</span>
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[85%]">
        <div className="text-sm text-gray-800 dark:text-gray-100">
          {formatMessage(content)}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{timestamp}</span>
      </div>
    </div>
  );
}
