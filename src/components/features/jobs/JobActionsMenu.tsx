import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { MoreVertical, Edit, Trash2, ArrowRight, Archive, Copy, X, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
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

  const handleWithdraw = () => {
    onUpdate(job.id, { withdrawn: true, status: 'Withdrawn' });
  };

  const handleUnwithdraw = () => {
    onUpdate(job.id, { withdrawn: false, status: 'Applied' });
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
        <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {/* Primary Actions */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onEdit(job)}
                  className={`${
                    active ? 'bg-blue-50' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <Edit className="w-4 h-4 mr-3" />
                  Edit Application
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleCopyJob}
                  className={`${
                    active ? 'bg-gray-50' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <Copy className="w-4 h-4 mr-3" />
                  Copy Job Data
                </button>
              )}
            </Menu.Item>

            {/* Status Transitions */}
            {job.status === 'Applied' && (
              <>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleStatusUpdate('Interview')}
                      className={`${
                        active ? 'bg-yellow-50' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-yellow-700`}
                    >
                      <ArrowRight className="w-4 h-4 mr-3" />
                      Move to Interview
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleStatusUpdate('Rejected')}
                      className={`${
                        active ? 'bg-red-50' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-red-700`}
                    >
                      <XCircle className="w-4 h-4 mr-3" />
                      Mark as Rejected
                    </button>
                  )}
                </Menu.Item>
              </>
            )}

            {job.status === 'Interview' && (
              <>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleStatusUpdate('Offer')}
                      className={`${
                        active ? 'bg-green-50' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-green-700`}
                    >
                      <CheckCircle className="w-4 h-4 mr-3" />
                      Move to Offer
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleStatusUpdate('Rejected')}
                      className={`${
                        active ? 'bg-red-50' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-red-700`}
                    >
                      <XCircle className="w-4 h-4 mr-3" />
                      Mark as Rejected
                    </button>
                  )}
                </Menu.Item>
              </>
            )}

            {job.status === 'Offer' && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleStatusUpdate('Rejected')}
                    className={`${
                      active ? 'bg-red-50' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-red-700`}
                  >
                    <XCircle className="w-4 h-4 mr-3" />
                    Mark as Rejected
                  </button>
                )}
              </Menu.Item>
            )}

            {/* Withdraw/Reactivate */}
            {!job.withdrawn && job.status !== 'Withdrawn' && job.status !== 'Archived' && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleWithdraw}
                    className={`${
                      active ? 'bg-orange-50' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-orange-600`}
                  >
                    <X className="w-4 h-4 mr-3" />
                    Withdraw Application
                  </button>
                )}
              </Menu.Item>
            )}

            {job.withdrawn && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleUnwithdraw}
                    className={`${
                      active ? 'bg-green-50' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-green-600`}
                  >
                    <RotateCcw className="w-4 h-4 mr-3" />
                    Reactivate Application
                  </button>
                )}
              </Menu.Item>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100 my-1" />

            {/* Archive/Unarchive */}
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

            {/* Danger Zone */}
            <div className="border-t border-gray-100 my-1" />
            
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
