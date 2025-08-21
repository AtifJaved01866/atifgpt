
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Archive, 
  EyeOff, 
  MoreHorizontal,
  Trash2,
  Edit3,
  Sparkles,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatOptionsModal } from "./ChatOptionsModal";

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  isArchived?: boolean;
  isHidden?: boolean;
}

interface ChatSidebarProps {
  onNewChat: () => void;
  chatHistory: Chat[];
  currentChatId?: string;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onArchiveChat: (chatId: string) => void;
  onHideChat: (chatId: string, password: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  hiddenChats: Chat[];
  onUnhideChat: (chatId: string, password: string) => void;
}

export function ChatSidebar({ 
  onNewChat, 
  chatHistory, 
  currentChatId, 
  onSelectChat,
  onDeleteChat,
  onArchiveChat,
  onHideChat,
  onRenameChat,
  hiddenChats,
  onUnhideChat
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'delete' | 'rename' | 'hide' | 'unhide' | null>(null);

  const filteredChats = useMemo(() => {
    let chats = showArchived 
      ? chatHistory.filter(chat => chat.isArchived)
      : chatHistory.filter(chat => !chat.isArchived && !chat.isHidden);
    
    if (showHidden) {
      chats = hiddenChats;
    }
    
    if (searchQuery) {
      chats = chats.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return chats;
  }, [chatHistory, hiddenChats, showArchived, showHidden, searchQuery]);

  const handleChatAction = (chatId: string, action: 'delete' | 'rename' | 'hide' | 'unhide') => {
    setSelectedChatId(chatId);
    setModalType(action);
  };

  const closeModal = () => {
    setSelectedChatId(null);
    setModalType(null);
  };

  return (
    <>
      <div className="w-80 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header with Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full" />
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">AtifGPT</h1>
              <p className="text-xs text-sidebar-foreground/60">Developed by Atif Javed</p>
            </div>
          </div>
          
          <Button 
            onClick={onNewChat}
            className="w-full bg-white hover:bg-white/90 text-black hover:text-black border-0 transition-smooth rounded-xl h-11 font-medium"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            New chat
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-sidebar-foreground/60" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-sidebar-accent border-sidebar-border rounded-xl h-10 text-sm"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 py-2">
          <div className="flex gap-1 bg-sidebar-accent rounded-xl p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowArchived(false);
                setShowHidden(false);
              }}
              className={`flex-1 rounded-lg text-xs transition-smooth ${
                !showArchived && !showHidden
                  ? 'bg-sidebar text-sidebar-foreground shadow-sm'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'
              }`}
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Chats
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowArchived(true);
                setShowHidden(false);
              }}
              className={`flex-1 rounded-lg text-xs transition-smooth ${
                showArchived
                  ? 'bg-sidebar text-sidebar-foreground shadow-sm'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'
              }`}
            >
              <Archive className="w-3 h-3 mr-1" />
              Archive
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowHidden(true);
                setShowArchived(false);
              }}
              className={`flex-1 rounded-lg text-xs transition-smooth ${
                showHidden
                  ? 'bg-sidebar text-sidebar-foreground shadow-sm'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'
              }`}
            >
              <EyeOff className="w-3 h-3 mr-1" />
              Hidden
            </Button>
          </div>
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-1 py-2">
            {filteredChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-sidebar-foreground/30" />
                <p className="text-sm text-sidebar-foreground/60">
                  {searchQuery ? 'No chats found' : 'No chats yet'}
                </p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center gap-2 p-3 rounded-xl transition-smooth hover:bg-sidebar-accent ${
                    currentChatId === chat.id 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground'
                  }`}
                >
                  <button
                    onClick={() => onSelectChat(chat.id)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0 text-sidebar-foreground/60" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{chat.title}</p>
                      <p className="text-xs text-sidebar-foreground/50">
                        {chat.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleChatAction(chat.id, 'rename')}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      {!showHidden && (
                        <DropdownMenuItem onClick={() => handleChatAction(chat.id, 'hide')}>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Hide chat
                        </DropdownMenuItem>
                      )}
                      {showHidden && (
                        <DropdownMenuItem onClick={() => handleChatAction(chat.id, 'unhide')}>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Unhide chat
                        </DropdownMenuItem>
                      )}
                      {!showArchived && !showHidden && (
                        <DropdownMenuItem onClick={() => onArchiveChat(chat.id)}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleChatAction(chat.id, 'delete')}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
       import { Linkedin, Instagram, Globe } from "lucide-react"

{/* Social Links Footer */}
<div className="p-4 border-t border-sidebar-border">
  <div className="flex items-center justify-center gap-6">
    <a
      href="https://www.linkedin.com/in/iatifjaved/"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-white transition-colors"
    >
      <Linkedin className="w-4 h-4 text-white" />
      LinkedIn
    </a>
    <a
      href="https://instagram.com/iatifjaved"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-white transition-colors"
    >
      <Instagram className="w-4 h-4 text-white" />
      Instagram
    </a>
    <a
      href="https://atifjvd.vercel.app"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-white transition-colors"
    >
      <Globe className="w-4 h-4 text-white" />
      Portfolio
    </a>
  </div>
</div>


      {/* Modals */}
      {selectedChatId && modalType && (
        <ChatOptionsModal
          chatId={selectedChatId}
          type={modalType}
          onClose={closeModal}
          onDelete={onDeleteChat}
          onRename={onRenameChat}
          onHide={onHideChat}
          onUnhide={onUnhideChat}
          chatTitle={filteredChats.find(c => c.id === selectedChatId)?.title || ''}
        />
      )}
    </>
  );
}
