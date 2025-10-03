import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, FileText, Loader2, X } from "lucide-react";

interface Document {
  id: string;
  file_name: string;
  created_at: string;
}

export const DocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("id, file_name, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes("pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
        });

      if (dbError) throw dbError;

      toast.success("Document uploaded successfully!");
      loadDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const deleteDocument = async (id: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast.success("Document deleted");
      loadDocuments();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Your Documents
          </h3>
          <Button
            size="sm"
            onClick={() => loadDocuments()}
            variant="outline"
          >
            Refresh
          </Button>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload PDF (max 10MB)
                </p>
              </>
            )}
          </label>
        </div>

        {documents.length > 0 && (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">{doc.file_name}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteDocument(doc.id, doc.file_name)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
