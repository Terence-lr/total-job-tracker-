import { FollowUp } from '../types/fitScore';
import { followUpTemplates, FollowUpType } from '../templates/followups';

// Generate follow-up reminders based on job status
export function generateFollowUps(jobId: string, status: string, appliedDate: string): FollowUp[] {
  const followUps: FollowUp[] = [];
  const appliedDateObj = new Date(appliedDate);

  if (status === 'applied') {
    // Applied → reminders at +3 days and +7 days
    const threeDaysLater = new Date(appliedDateObj);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    
    const sevenDaysLater = new Date(appliedDateObj);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    followUps.push(
      {
        jobId,
        dueAt: threeDaysLater.toISOString(),
        type: 'applied-3d',
        done: false
      },
      {
        jobId,
        dueAt: sevenDaysLater.toISOString(),
        type: 'applied-7d',
        done: false
      }
    );
  } else if (status === 'interview') {
    // Interviewed → reminders at +2 days and +5 days
    const twoDaysLater = new Date(appliedDateObj);
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    
    const fiveDaysLater = new Date(appliedDateObj);
    fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);

    followUps.push(
      {
        jobId,
        dueAt: twoDaysLater.toISOString(),
        type: 'interview-2d',
        done: false
      },
      {
        jobId,
        dueAt: fiveDaysLater.toISOString(),
        type: 'interview-5d',
        done: false
      }
    );
  }

  return followUps;
}

// Get upcoming follow-ups (not done, due within next 7 days)
export function getUpcomingFollowUps(followUps: FollowUp[]): FollowUp[] {
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  return followUps
    .filter(followUp => !followUp.done)
    .filter(followUp => {
      const dueDate = new Date(followUp.dueAt);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

// Mark follow-up as done
export function markFollowUpDone(followUps: FollowUp[], jobId: string, type: FollowUpType): FollowUp[] {
  return followUps.map(followUp => 
    followUp.jobId === jobId && followUp.type === type
      ? { ...followUp, done: true }
      : followUp
  );
}

// Snooze follow-up by 2 days
export function snoozeFollowUp(followUps: FollowUp[], jobId: string, type: FollowUpType): FollowUp[] {
  return followUps.map(followUp => {
    if (followUp.jobId === jobId && followUp.type === type) {
      const newDueDate = new Date(followUp.dueAt);
      newDueDate.setDate(newDueDate.getDate() + 2);
      return { ...followUp, dueAt: newDueDate.toISOString() };
    }
    return followUp;
  });
}

// Get template for follow-up type
export function getFollowUpTemplate(type: FollowUpType) {
  return followUpTemplates[type];
}

// Format follow-up date for display
export function formatFollowUpDate(dueAt: string): string {
  const date = new Date(dueAt);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays > 0) {
    return `In ${diffDays} days`;
  } else {
    return 'Overdue';
  }
}

// Get follow-up type display name
export function getFollowUpTypeDisplayName(type: FollowUpType): string {
  const displayNames = {
    'applied-3d': '3-day follow-up',
    'applied-7d': '7-day follow-up',
    'interview-2d': 'Post-interview thank you',
    'interview-5d': 'Interview follow-up'
  };
  return displayNames[type];
}



