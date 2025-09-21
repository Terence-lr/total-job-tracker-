import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ExternalLink, 
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Eye
} from 'lucide-react';
import { JobApplication } from '../../../types/job';
import { AnimatedCard } from '../../ui/AnimatedCard';
import { InteractiveCard } from '../../ui/InteractiveCard';
import clsx from 'clsx';

interface AnimatedJobCardProps {
  job: JobApplication;
  index: number;
  onEdit?: (job: JobApplication) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onView?: (job: JobApplication) => void;
}

const AnimatedJobCard: React.FC<AnimatedJobCardProps> = ({
  job,
  index,
  onEdit,
  onDelete,
  onArchive,
  onView
}) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Interview':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Offer':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Withdrawn':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'Archived':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const actions = [
    {
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => onView?.(job),
      color: 'text-blue-400 hover:bg-blue-500/20'
    },
    {
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => onEdit?.(job),
      color: 'text-yellow-400 hover:bg-yellow-500/20'
    },
    {
      label: 'Archive',
      icon: <Archive className="w-4 h-4" />,
      onClick: () => onArchive?.(job.id),
      color: 'text-purple-400 hover:bg-purple-500/20'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => onDelete?.(job.id),
      color: 'text-red-400 hover:bg-red-500/20'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="relative"
    >
      <AnimatedCard
        className="h-full"
        hover={true}
        onClick={() => onView?.(job)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
              {job.position}
            </h3>
            <p className="text-gray-400 text-sm mb-2">{job.company}</p>
          </div>
          
          {/* Status Badge */}
          <span className={clsx(
            'px-3 py-1 rounded-full text-xs font-medium border',
            getStatusColor(job.status)
          )}>
            {job.status}
          </span>
        </div>

        {/* Job Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            Applied {formatDate(job.dateApplied)}
          </div>
          
          {job.salary && (
            <div className="flex items-center text-sm text-gray-400">
              <DollarSign className="w-4 h-4 mr-2" />
              {job.salary}
            </div>
          )}
          
          {job.jobUrl && (
            <div className="flex items-center text-sm text-blue-400">
              <ExternalLink className="w-4 h-4 mr-2" />
              <a 
                href={job.jobUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                View Job Posting
              </a>
            </div>
          )}
        </div>

        {/* Notes Preview */}
        {job.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-300 line-clamp-2">
              {job.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </motion.button>
          </div>
          
          <div className="text-xs text-gray-500">
            {formatDate(job.createdAt.toString())}
          </div>
        </div>

        {/* Actions Dropdown */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-4 right-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10"
            >
              <div className="py-2">
                {actions.map((action, actionIndex) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: actionIndex * 0.05 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                      setShowActions(false);
                    }}
                    className={clsx(
                      'w-full flex items-center space-x-2 px-4 py-2 text-sm transition-colors',
                      action.color
                    )}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedCard>
    </motion.div>
  );
};

export default AnimatedJobCard;
