import React, { useState } from 'react';
import { FollowUp, FollowUpType } from '../types/fitScore';
import { 
  getUpcomingFollowUps, 
  markFollowUpDone, 
  snoozeFollowUp, 
  getFollowUpTemplate, 
  formatFollowUpDate, 
  getFollowUpTypeDisplayName 
} from '../services/followUpService';
import { Bell, Copy, Check, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface FollowUpsWidgetProps {
  followUps: FollowUp[];
  jobs: Array<{ id: string; company: string; position: string; status: string }>;
  onUpdateFollowUps: (followUps: FollowUp[]) => void;
}

const FollowUpsWidget: React.FC<FollowUpsWidgetProps> = ({ 
  followUps, 
  jobs, 
  onUpdateFollowUps 
}) => {
  const [expandedFollowUp, setExpandedFollowUp] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const upcomingFollowUps = getUpcomingFollowUps(followUps);

  const handleMarkDone = (jobId: string, type: FollowUpType) => {
    const updatedFollowUps = markFollowUpDone(followUps, jobId, type);
    onUpdateFollowUps(updatedFollowUps);
  };

  const handleSnooze = (jobId: string, type: FollowUpType) => {
    const updatedFollowUps = snoozeFollowUp(followUps, jobId, type);
    onUpdateFollowUps(updatedFollowUps);
  };

  const handleCopyTemplate = async (type: FollowUpType) => {
    const template = getFollowUpTemplate(type);
    const job = jobs.find(j => j.id === upcomingFollowUps.find(f => f.type === type)?.jobId);
    
    if (job) {
      const personalizedTemplate = template.body
        .replace(/\[Name\]/g, 'Hiring Manager')
        .replace(/\[Job Title\]/g, job.position)
        .replace(/\[Date\]/g, new Date().toLocaleDateString())
        .replace(/\[Your Name\]/g, 'Your Name')
        .replace(/\[Relevant Skills\]/g, 'your relevant skills');

      try {
        await navigator.clipboard.writeText(personalizedTemplate);
        setCopiedTemplate(type);
        setTimeout(() => setCopiedTemplate(null), 2000);
      } catch (err) {
        console.error('Failed to copy template:', err);
      }
    }
  };

  if (upcomingFollowUps.length === 0) {
    return null;
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bell className="h-5 w-5 text-var(--accent) mr-2" />
          <h3 className="text-lg font-medium text-var(--text)">Follow-up Reminders</h3>
        </div>
        <span className="px-2 py-1 bg-var(--accent) text-white text-xs rounded-full">
          {upcomingFollowUps.length}
        </span>
      </div>

      <div className="space-y-3">
        {upcomingFollowUps.map((followUp) => {
          const job = jobs.find(j => j.id === followUp.jobId);
          if (!job) return null;

          const isExpanded = expandedFollowUp === `${followUp.jobId}-${followUp.type}`;
          const template = getFollowUpTemplate(followUp.type);

          return (
            <div key={`${followUp.jobId}-${followUp.type}`} className="border border-var(--border) rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-var(--text)">
                      {job.company} - {job.position}
                    </h4>
                    <span className="px-2 py-1 bg-var(--elev) text-var(--muted) text-xs rounded-full">
                      {getFollowUpTypeDisplayName(followUp.type)}
                    </span>
                  </div>
                  <p className="text-sm text-var(--muted) mt-1">
                    Due: {formatFollowUpDate(followUp.dueAt)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setExpandedFollowUp(isExpanded ? null : `${followUp.jobId}-${followUp.type}`)}
                    className="p-1 text-var(--muted) hover:text-var(--text) cursor-halo"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-var(--border)">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-var(--text) mb-2">Email Template</p>
                      <div className="bg-var(--elev) p-3 rounded-lg">
                        <p className="text-sm text-var(--muted) mb-2">
                          <strong>Subject:</strong> {template.subject}
                        </p>
                        <p className="text-sm text-var(--muted) whitespace-pre-line">
                          {template.body}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyTemplate(followUp.type)}
                        className="btn btn-secondary cursor-halo"
                        disabled={copiedTemplate === followUp.type}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {copiedTemplate === followUp.type ? 'Copied!' : 'Copy Email'}
                      </button>
                      
                      <button
                        onClick={() => handleSnooze(followUp.jobId, followUp.type)}
                        className="btn btn-secondary cursor-halo"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Snooze 2d
                      </button>
                      
                      <button
                        onClick={() => handleMarkDone(followUp.jobId, followUp.type)}
                        className="btn btn-primary cursor-halo"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FollowUpsWidget;

