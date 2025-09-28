import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, ExternalLink, Check } from 'lucide-react';
import { JobApplication } from '../../../types/job';
import JobActionsMenu from './JobActionsMenu';
import StatusDropdown from './StatusDropdown';
import clsx from 'clsx';

interface EnhancedJobCardProps {
  job: JobApplication;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onUpdate: (id: string, updates: Partial<JobApplication>) => void;
  onDelete: (id: string) => void;
  onEdit: (job: JobApplication) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
}

const EnhancedJobCard: React.FC<EnhancedJobCardProps> = ({
  job,
  isSelected = false,
  onSelect,
  onUpdate,
  onDelete,
  onEdit,
  onArchive,
  onUnarchive,
  onStatusChange
}) => {
  const getStatusColor = (status: string, withdrawn?: boolean) => {
    if (withdrawn) {
      return 'bg-orange-100 text-orange-800';
    }
    const colors: Record<string, string> = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Interview': 'bg-green-100 text-green-800',
      'Offer': 'bg-yellow-100 text-yellow-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Withdrawn': 'bg-orange-100 text-orange-800',
      'Archived': 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={clsx(
        'bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200',
        isSelected && 'ring-2 ring-blue-500 border-blue-500'
      )}
    >
      {/* Header with job title and company */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {onSelect && (
            <button
              onClick={() => onSelect(job.id)}
              className={clsx(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
                isSelected 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 hover:border-blue-400'
              )}
            >
              {isSelected && <Check className="w-3 h-3" />}
            </button>
          )}
          
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight break-words">{job.position}</h3>
            <p className="text-sm text-gray-600 break-words mt-1">{job.company}</p>
          </div>
        </div>
      </div>

      {/* Status and Actions Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {onStatusChange ? (
            <StatusDropdown
              job={job}
              onStatusChange={onStatusChange}
              className="w-28"
            />
          ) : (
            <span className={clsx(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              getStatusColor(job.status, job.withdrawn)
            )}>
              {job.withdrawn ? 'Withdrawn' : job.status}
            </span>
          )}
        </div>
        
        <JobActionsMenu
          job={job}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onEdit={onEdit}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onStatusChange={onStatusChange}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          <span>Applied {formatDate(job.date_applied)}</span>
        </div>
        
        {job.salary && (
          <div className="flex items-center text-xs text-gray-500">
            <DollarSign className="w-3 h-3 mr-1" />
            <span>{job.salary}</span>
          </div>
        )}
        
        {job.job_url && (
          <div className="flex items-center text-xs text-gray-500">
            <ExternalLink className="w-3 h-3 mr-1" />
            <a 
              href={job.job_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              View Job Posting
            </a>
          </div>
        )}
        
        {job.offers && (
          <div className="flex items-center text-xs text-green-500">
            <Check className="w-3 h-3 mr-1" />
            <span className="font-medium">Offer Details Available</span>
          </div>
        )}
      </div>
      
      {job.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600 line-clamp-3 break-words">{job.notes}</p>
        </div>
      )}
    </motion.div>
  );
};

export default EnhancedJobCard;
