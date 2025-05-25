// src/app/(app)/messages/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareText } from "lucide-react"; // Using a slightly different icon for page title

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <MessageSquareText className="mr-3 h-7 w-7" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your direct messages and conversations will appear here. This feature is currently under development.
          </p>
          <div className="mt-8 p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg text-center bg-muted/20">
            <MessageSquareText className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl font-semibold text-foreground">Messaging Feature Coming Soon</p>
            <p className="text-sm text-muted-foreground mt-2">
              We are working hard to bring you a full messaging experience. Stay tuned!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
