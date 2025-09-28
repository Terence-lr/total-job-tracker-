import { useCallback } from 'react';
import { updateJobApplication } from '../services/enhancedJobService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface UseJobStatusUpdateProps {
  onJobsReload: () => Promise<void>;
  onCelebration?: (company: string, position: string) => void;
}

export const useJobStatusUpdate = ({ 
  onJobsReload, 
  onCelebration 
}: UseJobStatusUpdateProps) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const handleStatusChange = useCallback(async (jobId: string, newStatus: string, job?: { company: string; position: string }) => {
    if (!user) return;
    
    try {
      console.log(`Attempting to update job ${jobId} status to ${newStatus}`);
      
      // Update the job status and withdrawn field if needed
      const updates: any = { status: newStatus as any };
      
      if (newStatus === 'Withdrawn') {
        updates.withdrawn = true;
      } else if (newStatus === 'Applied' && job) {
        // When reactivating from withdrawn, set withdrawn to false
        updates.withdrawn = false;
      }
      
      await updateJobApplication(jobId, updates, user.id);
      console.log(`Successfully updated job ${jobId} status to ${newStatus}`);
      
      // Trigger celebration for job offers
      if (newStatus === 'Offer' && job && onCelebration) {
        console.log(`Triggering celebration for job offer: ${job.company} - ${job.position}`);
        onCelebration(job.company, job.position);
      }
      
      // Reload jobs to reflect the change
      await onJobsReload();
      console.log(`Jobs reloaded after status update`);
      
      // Show success notification
      showSuccess('Status Updated', `Job status updated to ${newStatus}.`);
      
      console.log(`Job status updated to ${newStatus} - Complete`);
    } catch (error: any) {
      console.error('Error updating job status:', error);
      console.error('Error details:', {
        jobId,
        newStatus,
        userId: user.id,
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details
      });
      showError('Update Failed', `Failed to update job status: ${error.message || 'Unknown error'}`);
    }
  }, [user, onJobsReload, onCelebration, showSuccess, showError]);

  return { handleStatusChange };
};
