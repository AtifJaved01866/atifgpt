
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Sparkles, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div className={cn(
      "w-full px-4 py-6 transition-smooth",
      isUser ? "bg-background" : "bg-muted/30"
    )}>
      <div className="max-w-4xl mx-auto">
        <div className={cn(
          "flex gap-4 items-start",
          isUser && "flex-row-reverse"
        )}>
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="w-8 h-8 border-2 border-border/50">
              <AvatarFallback className={cn(
                "text-xs font-medium transition-colors",
                isUser 
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white" 
                  : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
              )}>
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Message Content */}
          <div className={cn(
            "flex-1 min-w-0 max-w-3xl",
            isUser ? "text-right" : "text-left"
          )}>
            {/* Header */}
            <div className={cn(
              "flex items-center gap-2 mb-2",
              isUser ? "justify-end" : "justify-start"
            )}>
              <span className="text-sm font-semibold text-foreground">
                {isUser ? "You" : "AtifGPT"}
              </span>
              <span className="text-xs text-muted-foreground">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            
            {/* Message Bubble */}
            <div className={cn(
              "relative rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm",
              isUser 
                ? "bg-white text-black ml-8 rounded-tr-lg" 
                : "bg-card text-foreground mr-8 rounded-tl-lg border border-border/50"
            )}>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap m-0">
                  {message.content}
                </p>
              </div>
            </div>

            {/* Action Buttons (only for assistant messages) */}
            {!isUser && (
              <div className="flex items-center gap-1 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 px-2 text-xs rounded-xl hover:bg-accent"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs rounded-xl hover:bg-accent"
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs rounded-xl hover:bg-accent"
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
