
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Square, Paperclip, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onStopGeneration?: () => void;
  placeholder?: string;
}

export function ChatInput({ 
  onSendMessage, 
  isLoading = false, 
  onStopGeneration,
  placeholder = "Message AtifGPT..." 
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center gap-3 bg-card border border-border/50 p-3 shadow-elegant hover:shadow-lg transition-all duration-200" style={{ borderRadius: '100px' }}>
            {/* Attachment Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex-shrink-0 p-2 h-10 w-10 rounded-2xl hover:bg-accent transition-smooth"
            >
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </Button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="border-0 bg-transparent h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
              />
            </div>

            {/* Emoji Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex-shrink-0 p-2 h-10 w-10 rounded-2xl hover:bg-accent transition-smooth"
            >
              <Smile className="w-4 h-4 text-muted-foreground" />
            </Button>
            
            {/* Send/Stop Button */}
            <Button
              type={isLoading ? "button" : "submit"}
              size="sm"
              onClick={isLoading ? onStopGeneration : undefined}
              className={cn(
                "flex-shrink-0 h-10 w-10 rounded-2xl transition-all duration-200 shadow-sm",
                message.trim() && !isLoading
                  ? "bg-white text-black hover:bg-white/90 shadow-md hover:shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
                isLoading && "bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-pulse"
              )}
              disabled={!message.trim() && !isLoading}
            >
              {isLoading ? (
                <Square className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
        
        <div className="text-xs text-muted-foreground/70 text-center mt-3 px-4">
          AtifGPT can make mistakes. Please verify important information.
        </div>
      </div>
    </div>
  );
}
