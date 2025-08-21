
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit3, EyeOff, Eye } from "lucide-react";

interface ChatOptionsModalProps {
  chatId: string;
  type: 'delete' | 'rename' | 'hide' | 'unhide';
  onClose: () => void;
  onDelete: (chatId: string) => void;
  onRename: (chatId: string, newTitle: string) => void;
  onHide: (chatId: string, password: string) => void;
  onUnhide: (chatId: string, password: string) => void;
  chatTitle: string;
}

export function ChatOptionsModal({
  chatId,
  type,
  onClose,
  onDelete,
  onRename,
  onHide,
  onUnhide,
  chatTitle
}: ChatOptionsModalProps) {
  const [newTitle, setNewTitle] = useState(chatTitle);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      switch (type) {
        case 'delete':
          onDelete(chatId);
          break;
        case 'rename':
          if (newTitle.trim()) {
            onRename(chatId, newTitle.trim());
          }
          break;
        case 'hide':
          if (password.trim()) {
            onHide(chatId, password);
          } else {
            alert('Please enter a password');
            setIsLoading(false);
            return;
          }
          break;
        case 'unhide':
          if (password.trim()) {
            onUnhide(chatId, password);
          } else {
            alert('Please enter the password');
            setIsLoading(false);
            return;
          }
          break;
      }
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getModalContent = () => {
    switch (type) {
      case 'delete':
        return {
          title: 'Delete Chat',
          icon: <Trash2 className="w-5 h-5 text-destructive" />,
          content: (
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "{chatTitle}"? This action cannot be undone.
            </p>
          ),
          actionLabel: 'Delete',
          actionVariant: 'destructive' as const
        };
      case 'rename':
        return {
          title: 'Rename Chat',
          icon: <Edit3 className="w-5 h-5" />,
          content: (
            <div className="space-y-2">
              <Label htmlFor="title">Chat title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter new title..."
                className="rounded-xl"
              />
            </div>
          ),
          actionLabel: 'Rename',
          actionVariant: 'default' as const
        };
      case 'hide':
        return {
          title: 'Hide Chat',
          icon: <EyeOff className="w-5 h-5" />,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Create a password to hide "{chatTitle}". You'll need this password to access the chat later.
              </p>
              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password..."
                  className="rounded-xl"
                />
              </div>
            </div>
          ),
          actionLabel: 'Hide Chat',
          actionVariant: 'default' as const
        };
      case 'unhide':
        return {
          title: 'Unhide Chat',
          icon: <Eye className="w-5 h-5" />,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Enter the password you created to unhide "{chatTitle}".
              </p>
              <div className="space-y-2">
                <Label htmlFor="password">Enter Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password..."
                  className="rounded-xl"
                />
              </div>
            </div>
          ),
          actionLabel: 'Unhide Chat',
          actionVariant: 'default' as const
        };
    }
  };

  const modalContent = getModalContent();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {modalContent.icon}
            {modalContent.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {modalContent.content}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            variant={modalContent.actionVariant}
            onClick={handleSubmit}
            disabled={isLoading || (type === 'rename' && !newTitle.trim()) || ((type === 'hide' || type === 'unhide') && !password.trim())}
            className="rounded-xl"
          >
            {isLoading ? 'Processing...' : modalContent.actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
