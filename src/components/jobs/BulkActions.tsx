import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Trash2, X, Check } from 'lucide-react';
import { JobApplication } from '../../types/job';

interface BulkActionsProps {
  selectedJobs: string[];
  onBulkUpdate: (updates: Partial<JobApplication>) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({ 
  selectedJobs, 
  onBulkUpdate, 
  onBulkDelete, 
  onClearSelection 
}) => {
  if (selectedJobs.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex items-center justify-between p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md mb-4"
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              {selectedJobs.length} application{selectedJobs.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onBulkUpdate({ status: 'Archived' })}
              className="flex items-center space-x-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              <Archive className="w-4 h-4" />
              <span>Archive</span>
            </button>
            
            <button
              onClick={() => onBulkUpdate({ status: 'Rejected' })}
              className="flex items-center space-x-1 text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
            >
              <span>Mark Rejected</span>
            </button>
            
            <button
              onClick={onBulkDelete}
              className="flex items-center space-x-1 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
        
        <button
          onClick={onClearSelection}
          className="p-1 hover:bg-blue-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-blue-600" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default BulkActions;
