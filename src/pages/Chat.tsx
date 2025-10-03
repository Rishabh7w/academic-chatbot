import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/ChatInterface";
import { DocumentUpload } from "@/components/DocumentUpload";
import { AuthGuard } from "@/components/AuthGuard";
import { User, LogOut, Plus, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [showDocuments, setShowDocuments] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setConversations(data || []);

      // Auto-select first conversation or create new one
      if (data && data.length > 0) {
        setCurrentConversation(data[0].id);
      } else {
        await createNewConversation();
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const createNewConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: user.id,
          title: "New Conversation",
        })
        .select()
        .single();

      if (error) throw error;

      setConversations((prev) => [data, ...prev]);
      setCurrentConversation(data.id);
      toast.success("New conversation created");
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gradient-subtle">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Academic AI
            </h1>
          </div>

          <ScrollArea className="flex-1 p-2">
            <Button
              onClick={createNewConversation}
              className="w-full mb-2"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>

            <div className="space-y-1">
              {conversations.map((conv) => (
                <Button
                  key={conv.id}
                  variant={currentConversation === conv.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setCurrentConversation(conv.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span className="truncate">{conv.title}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowDocuments(!showDocuments)}
            >
              Documents
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            {currentConversation && <ChatInterface conversationId={currentConversation} />}
          </div>

          {/* Documents Panel */}
          {showDocuments && (
            <div className="w-80 border-l bg-card p-4">
              <DocumentUpload />
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Chat;
