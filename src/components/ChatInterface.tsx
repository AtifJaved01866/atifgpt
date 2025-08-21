
import { useState, useRef, useEffect } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { geminiApi, type ChatMessage as Message } from "@/services/geminiApi";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
  isArchived?: boolean;
  isHidden?: boolean;
}

export function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [hiddenChats, setHiddenChats] = useState<Chat[]>([]);
  const [userPasswords, setUserPasswords] = useState<Map<string, string>>(new Map());
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentChat = chats.find(chat => chat.id === currentChatId) || 
                      hiddenChats.find(chat => chat.id === currentChatId);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [currentChat?.messages]);

  const createNewChat = (): string => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      title: "New Chat",
      messages: [],
      timestamp: new Date(),
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    return newChatId;
  };

  const handleNewChat = () => {
    createNewChat();
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    setHiddenChats(prev => prev.filter(chat => chat.id !== chatId));
    
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
    
    toast({
      title: "Chat deleted",
      description: "The chat has been permanently deleted.",
    });
  };

  const handleArchiveChat = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, isArchived: !chat.isArchived }
        : chat
    ));
    
    toast({
      title: "Chat archived",
      description: "The chat has been moved to archives.",
    });
  };

  const handleHideChat = (chatId: string, password: string) => {
    const chatToHide = chats.find(chat => chat.id === chatId);
    if (chatToHide) {
      setUserPasswords(prev => new Map(prev).set(chatId, password));
      setHiddenChats(prev => [...prev, { ...chatToHide, isHidden: true }]);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }
      
      toast({
        title: "Chat hidden",
        description: "The chat has been hidden and password protected.",
      });
    }
  };

  const handleUnhideChat = (chatId: string, password: string) => {
    const storedPassword = userPasswords.get(chatId);
    if (password === storedPassword) {
      const chatToUnhide = hiddenChats.find(chat => chat.id === chatId);
      if (chatToUnhide) {
        setChats(prev => [{ ...chatToUnhide, isHidden: false }, ...prev]);
        setHiddenChats(prev => prev.filter(chat => chat.id !== chatId));
        setUserPasswords(prev => {
          const newMap = new Map(prev);
          newMap.delete(chatId);
          return newMap;
        });
        
        toast({
          title: "Chat unhidden",
          description: "The chat has been restored to your main chat list.",
        });
      }
    }
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, title: newTitle }
        : chat
    ));
    setHiddenChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, title: newTitle }
        : chat
    ));
    
    toast({
      title: "Chat renamed",
      description: `Chat renamed to "${newTitle}".`,
    });
  };

  const generateChatTitle = (firstMessage: string): string => {
    return firstMessage.length > 30 
      ? firstMessage.substring(0, 30) + "..."
      : firstMessage;
  };

  const handleSendMessage = async (content: string) => {
    let chatId = currentChatId;
    
    // Create new chat if none exists
    if (!chatId) {
      chatId = createNewChat();
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Add user message
    const updateChatMessages = (chatList: Chat[]) => 
      chatList.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, userMessage],
              title: chat.messages.length === 0 ? generateChatTitle(content) : chat.title
            }
          : chat
      );

    setChats(prev => updateChatMessages(prev));
    setHiddenChats(prev => updateChatMessages(prev));

    setIsLoading(true);

    try {
      // Get current messages for context
      const allChats = [...chats, ...hiddenChats];
      const currentChatData = allChats.find(c => c.id === chatId);
      const messagesWithUser = [...(currentChatData?.messages || []), userMessage];

      // Generate AI response
      const response = await geminiApi.generateResponse(messagesWithUser);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      // Add assistant message
      const updateWithAssistantMessage = (chatList: Chat[]) =>
        chatList.map(chat => 
          chat.id === chatId 
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat
        );

      setChats(prev => updateWithAssistantMessage(prev));
      setHiddenChats(prev => updateWithAssistantMessage(prev));

    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Enhanced Sidebar */}
      <ChatSidebar
        onNewChat={handleNewChat}
        chatHistory={chats}
        currentChatId={currentChatId || undefined}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onArchiveChat={handleArchiveChat}
        onHideChat={handleHideChat}
        onRenameChat={handleRenameChat}
        hiddenChats={hiddenChats}
        onUnhideChat={handleUnhideChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-background/95">
        {currentChat ? (
          <>
            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1">
              <div className="min-h-full">
                {currentChat.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="w-full px-4 py-6 bg-muted/30">
                    <div className="max-w-4xl mx-auto">
                      <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white animate-pulse" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-foreground">AtifGPT</span>
                          </div>
                          <div className="bg-card rounded-3xl rounded-tl-lg px-4 py-3 mr-8 border border-border/50">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Enhanced Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Message AtifGPT..."
            />
          </>
        ) : (
          // Enhanced Welcome screen
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
  <div className="text-center max-w-2xl mx-auto px-6">
    <div className="mb-12">
      {/* Logo wrapper */}
      <div className="w-24 h-24 bg-gradient-to-br from-white via-gray-100 to-gray-200 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl">
        <img 
          src="/logo.png" 
          alt="AtifGPT Logo" 
          className="w-16 h-16 object-contain" 
        />
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
        What can I help with?
      </h1>

      {/* Subtitle */}
      <p className="text-muted-foreground text-xl leading-relaxed">
        I'm AtifGPT, your AI assistant developed by Atif Javed. 
        Start a conversation by asking me anything!
      </p>
    </div>
  </div>
</div>

        )}
      </div>
    </div>
  );
}
