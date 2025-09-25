import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { MoreVertical, Edit, Trash2, ArrowRight, Archive, Copy } from 'lucide-react';
import { JobApplication } from '../../../types/job';

interface JobActionsMenuProps {
  job: JobApplication;
  onUpdate: (id: string, updates: Partial<JobApplication>) => void;
  onDelete: (id: string) => void;
  onEdit: (job: JobApplication) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
}

const JobActionsMenu: React.FC<JobActionsMenuProps> = ({ 
  job, 
  onUpdate, 
  onDelete, 
  onEdit,
  onArchive,
  onUnarchive
}) => {
  const handleStatusUpdate = (newStatus: string) => {
    onUpdate(job.id, { status: newStatus as any });
  };

  const handleCopyJob = () => {
    const jobData = {
      company: job.company,
      position: job.position,
      salary: job.salary,
      notes: job.notes,
      jobUrl: job.job_url
    };
    navigator.clipboard.writeText(JSON.stringify(jobData, null, 2));
  };

  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onEdit(job)}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <Edit className="w-4 h-4 mr-3" />
                  Edit
                </button>
              )}
            </Menu.Item>
            
            {job.status === 'Applied' && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleStatusUpdate('Interview')}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                  >
                    <ArrowRight className="w-4 h-4 mr-3" />
                    Move to Interview
                  </button>
                )}
              </Menu.Item>
            )}
            
            {job.status === 'Interview' && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleStatusUpdate('Offer')}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                  >
                    <ArrowRight className="w-4 h-4 mr-3" />
                    Move to Offer
                  </button>
                )}
              </Menu.Item>
            )}
            
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleStatusUpdate('Archived')}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <Archive className="w-4 h-4 mr-3" />
                  Archive
                </button>
              )}
            </Menu.Item>
            
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleCopyJob}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <Copy className="w-4 h-4 mr-3" />
                  Copy Job Data
                </button>
              )}
            </Menu.Item>
            
            <div className="border-t border-gray-100 my-1" />
            
            {job.status === 'Archived' ? (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => onUnarchive?.(job.id)}
                    className={`${
                      active ? 'bg-green-50' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-green-600`}
                  >
                    <Archive className="w-4 h-4 mr-3" />
                    Unarchive
                  </button>
                )}
              </Menu.Item>
            ) : (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => onArchive?.(job.id)}
                    className={`${
                      active ? 'bg-yellow-50' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-yellow-600`}
                  >
                    <Archive className="w-4 h-4 mr-3" />
                    Archive
                  </button>
                )}
              </Menu.Item>
            )}
            
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onDelete(job.id)}
                  className={`${
                    active ? 'bg-red-50' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-red-600`}
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default JobActionsMenu;
