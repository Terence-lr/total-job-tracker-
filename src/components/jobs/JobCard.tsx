import React from 'react';
import { JobApplication, JobStatus } from '../../types/job';
import { Calendar, DollarSign, ExternalLink, Edit, Trash2, MapPin } from 'lucide-react';

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
  onDelete: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onDelete }) => {
  const getStatusColor = (status: JobStatus): string => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800';
      case 'Interview':
        return 'bg-yellow-100 text-yellow-800';
      case 'Offer':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
              {job.position}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-sm truncate">{job.company}</span>
            </div>
          </div>
          <div className="flex space-x-1 sm:space-x-2 ml-2">
            <button
              onClick={() => onEdit(job)}
              className="p-2 sm:p-2 text-gray-400 hover:text-indigo-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Edit application"
              aria-label="Edit application"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(job.id)}
              className="p-2 sm:p-2 text-gray-400 hover:text-red-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Delete application"
              aria-label="Delete application"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Applied: {formatDate(job.dateApplied)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Salary: {formatSalary(job.salary)}</span>
          </div>

          {job.jobUrl && (
            <div className="flex items-center text-sm">
              <ExternalLink className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 truncate min-h-[44px] flex items-center"
              >
                View Job Posting
              </a>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)} self-start`}
          >
            {job.status}
          </span>
          
          {job.notes && (
            <div className="text-xs text-gray-500 max-w-full sm:max-w-xs truncate">
              {job.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
