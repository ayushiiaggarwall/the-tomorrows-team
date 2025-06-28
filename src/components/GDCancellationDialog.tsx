
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Clock } from "lucide-react";

interface GDCancellationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gdTitle: string;
  hoursUntilGD: number;
  isLoading?: boolean;
}

export const GDCancellationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  gdTitle, 
  hoursUntilGD,
  isLoading = false 
}: GDCancellationDialogProps) => {
  const isWithin24Hours = hoursUntilGD < 24;
  const willBePenalized = isWithin24Hours;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${willBePenalized ? 'text-red-500' : 'text-amber-500'}`} />
            {willBePenalized ? 'Drop Out Confirmation' : 'De-Register Confirmation'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>
              <strong>Group Discussion:</strong> {gdTitle}
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                {hoursUntilGD > 0 
                  ? `${Math.round(hoursUntilGD)} hours until the session`
                  : 'Session has already started or passed'
                }
              </span>
            </div>

            {willBePenalized ? (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-red-800 dark:text-red-200 font-medium text-sm">
                  ⚠️ Late Drop Out Penalty
                </div>
                <div className="text-red-700 dark:text-red-300 text-sm mt-1">
                  Since there are less than 24 hours remaining, dropping out will result in a <strong>-10 points penalty</strong> on your account.
                </div>
              </div>
            ) : (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-green-800 dark:text-green-200 font-medium text-sm">
                  ✅ No Penalty
                </div>
                <div className="text-green-700 dark:text-green-300 text-sm mt-1">
                  Since there are more than 24 hours remaining, you can de-register without any penalty.
                </div>
              </div>
            )}

            <p className="text-sm">
              Are you sure you want to {willBePenalized ? 'drop out' : 'de-register'} from this session?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className={willBePenalized ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}
          >
            {isLoading 
              ? 'Processing...' 
              : willBePenalized 
                ? 'Drop Out (-10 pts)' 
                : 'De-Register'
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
