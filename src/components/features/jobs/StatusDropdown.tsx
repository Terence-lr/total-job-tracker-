import React from 'react';
import { JobApplication, JobStatus } from '../../../types/job';
import Select from '../../ui/Select';

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
  const statusOptions = [
    { value: 'Applied', label: 'Applied' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Offer', label: 'Offer' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Withdrawn', label: 'Withdrawn' },
    { value: 'Archived', label: 'Archived' }
  ];

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== job.status) {
      onStatusChange(job.id, newStatus as JobStatus);
    }
  };

  return (
    <Select
      options={statusOptions}
      value={job.status}
      onChange={handleStatusChange}
      className={className}
      size="sm"
      variant="default"
    />
  );
};

export default StatusDropdown;
