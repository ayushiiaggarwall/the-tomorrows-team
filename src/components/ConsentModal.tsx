
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, FileText } from "lucide-react";

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  gdTitle: string;
}

export const ConsentModal = ({ isOpen, onClose, onAgree, gdTitle }: ConsentModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Consent to Recording & Participation Terms
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Please review and agree to the following terms before registering for: <strong>{gdTitle}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4 text-sm">
            <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
              <p className="font-medium mb-2">By registering for this Group Discussion, I confirm that:</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">1</span>
                </div>
                <p>I am participating voluntarily in this session conducted by The Tomorrows Team.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">2</span>
                </div>
                <p>I understand that the session will be recorded (including my video, audio, and comments).</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">3</span>
                </div>
                <p>I give permission for the session (partially or fully) to be published online, including platforms like YouTube and Spotify.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">4</span>
                </div>
                <p>I allow The Tomorrows Team to use my name, voice, and image in any promotional or educational content derived from this session.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">5</span>
                </div>
                <p>I understand I will not receive compensation for participation and waive future claims over the content.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">6</span>
                </div>
                <p>I agree to follow the community guidelines and participate respectfully.</p>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium">Legal Notice</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                This agreement constitutes a legally binding consent. By clicking "I Agree & Continue", you acknowledge that you have read, understood, and agree to all terms above.
              </p>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
            ❌ Cancel
          </Button>
          <Button onClick={onAgree} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
            ✅ I Agree & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
