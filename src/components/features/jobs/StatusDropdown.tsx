import React from 'react';
import { ChevronDown } from 'lucide-react';
import { JobApplication, JobStatus } from '../../../types/job';

interface StatusDropdownProps {
  job: JobApplication;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  className?: string;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  job,
  onStatusChange,
  className = ''
}) => {
  const statusOptions: { value: JobStatus; label: string; color: string }[] = [
    { value: 'Applied', label: 'Applied', color: 'bg-blue-600' },
    { value: 'Interview', label: 'Interview', color: 'bg-green-600' },
    { value: 'Offer', label: 'Offer', color: 'bg-yellow-600' },
    { value: 'Rejected', label: 'Rejected', color: 'bg-red-600' },
    { value: 'Withdrawn', label: 'Withdrawn', color: 'bg-gray-600' },
    { value: 'Archived', label: 'Archived', color: 'bg-gray-500' }
  ];

  const handleStatusChange = (newStatus: JobStatus) => {
    if (newStatus !== job.status) {
      onStatusChange(job.id, newStatus);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={job.status}
        onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
        className={`
          appearance-none bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 pr-8 text-sm text-white
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
          hover:bg-gray-700 transition-colors cursor-pointer
        `}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

export default StatusDropdown;
