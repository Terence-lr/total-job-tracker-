import React from 'react';
import { JobApplication, JobStatus } from '../../types/job';
import { Calendar, DollarSign, ExternalLink, Edit, Trash2, MapPin } from 'lucide-react';
import { useCursorHalo } from '../../hooks/useScrollReveal';

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
  onDelete: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onDelete }) => {
  const cardRef = useCursorHalo();

  const getStatusClass = (status: JobStatus): string => {
    switch (status) {
      case 'Applied':
        return 'status-pill status-applied';
      case 'Interview':
        return 'status-pill status-interview';
      case 'Offer':
        return 'status-pill status-offer';
      case 'Rejected':
        return 'status-pill status-rejected';
      case 'Withdrawn':
        return 'status-pill status-withdrawn';
      default:
        return 'status-pill status-withdrawn';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (salary?: string): string => {
    if (!salary) return 'Not specified';
    return salary;
  };

  return (
    <div ref={cardRef} className="card p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-var(--text) mb-1 truncate">
            {job.position}
          </h3>
          <div className="flex items-center text-var(--muted) mb-2">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="text-sm truncate">{job.company}</span>
          </div>
        </div>
        <div className="flex space-x-2 ml-2">
          <button
            onClick={() => onEdit(job)}
            className="p-2 text-var(--muted) hover:text-var(--accent) transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-halo"
            title="Edit application"
            aria-label="Edit application"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(job.id)}
            className="p-2 text-var(--muted) hover:text-var(--err) transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-halo"
            title="Delete application"
            aria-label="Delete application"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-var(--muted)">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Applied: {formatDate(job.dateApplied)}</span>
        </div>

        <div className="flex items-center text-sm text-var(--muted)">
          <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Salary: {formatSalary(job.salary)}</span>
        </div>

        {job.jobUrl && (
          <div className="flex items-center text-sm">
            <ExternalLink className="h-4 w-4 mr-2 text-var(--muted) flex-shrink-0" />
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-var(--accent) hover:text-var(--accent-2) truncate min-h-[44px] flex items-center link-underline"
            >
              View Job Posting
            </a>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <span className={`${getStatusClass(job.status)} self-start`}>
          {job.status}
        </span>
        
        {job.notes && (
          <div className="text-xs text-var(--muted) max-w-full sm:max-w-xs truncate">
            {job.notes}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
