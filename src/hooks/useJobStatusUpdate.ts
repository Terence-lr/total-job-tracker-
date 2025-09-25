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
      // Update the job status
      await updateJobApplication(jobId, { status: newStatus as any }, user.id);
      
      // Trigger celebration for job offers
      if (newStatus === 'Offer' && job && onCelebration) {
        onCelebration(job.company, job.position);
      }
      
      // Reload jobs to reflect the change
      await onJobsReload();
      
      // Show success notification
      showSuccess('Status Updated', `Job status updated to ${newStatus}.`);
      
      console.log(`Job status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating job status:', error);
      showError('Update Failed', `Failed to update job status: ${error.message || 'Unknown error'}`);
    }
  }, [user, onJobsReload, onCelebration, showSuccess, showError]);

  return { handleStatusChange };
};
