import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Send,
  Phone,
  Mail,
  MessageSquare,
  Zap,
  Target
} from 'lucide-react';
import { AnimatedCard } from '@/ui/AnimatedCard';
import { InteractiveCard } from '@/ui/InteractiveCard';
import { AnimatedCounter } from '@/ui/AnimatedCounter';
import clsx from 'clsx';

interface FollowUpReminder {
  id: string;
  applicationId: string;
  company: string;
  position: string;
  type: 'email' | 'phone' | 'linkedin' | 'general';
  dueDate: Date;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  lastContact?: Date;
}

interface FollowUpEngineProps {
  applications: any[];
}

const FollowUpEngine: React.FC<FollowUpEngineProps> = ({ applications }) => {
  const [reminders, setReminders] = useState<FollowUpReminder[]>([]);
  const [notifications, setNotifications] = useState<boolean>(false);
  const [autoCalculate, setAutoCalculate] = useState<boolean>(true);

  // Calculate optimal follow-up times
  const calculateFollowUpTimes = (applications: any[]): FollowUpReminder[] => {
    const reminders: FollowUpReminder[] = [];
    const now = new Date();

    applications.forEach(app => {
      const appliedDate = new Date(app.date_applied);
      const daysSinceApplied = Math.floor((now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Different follow-up strategies based on status and time
      if (app.status === 'Applied' && daysSinceApplied >= 7) {
        // First follow-up after 1 week
        reminders.push({
          id: `${app.id}-followup-1`,
          applicationId: app.id,
          company: app.company,
          position: app.position,
          type: 'email',
          dueDate: new Date(appliedDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          status: daysSinceApplied > 7 ? 'overdue' : 'pending',
          priority: daysSinceApplied > 14 ? 'high' : 'medium',
          notes: 'Initial follow-up to express continued interest'
        });
      }

      if (app.status === 'Applied' && daysSinceApplied >= 14) {
        // Second follow-up after 2 weeks
        reminders.push({
          id: `${app.id}-followup-2`,
          applicationId: app.id,
          company: app.company,
          position: app.position,
          type: 'linkedin',
          dueDate: new Date(appliedDate.getTime() + 14 * 24 * 60 * 60 * 1000),
          status: daysSinceApplied > 14 ? 'overdue' : 'pending',
          priority: 'high',
          notes: 'Connect with hiring manager on LinkedIn'
        });
      }

      if (app.status === 'Interview' && daysSinceApplied >= 3) {
        // Post-interview thank you
        reminders.push({
          id: `${app.id}-thankyou`,
          applicationId: app.id,
          company: app.company,
          position: app.position,
          type: 'email',
          dueDate: new Date(appliedDate.getTime() + 3 * 24 * 60 * 60 * 1000),
          status: 'pending',
          priority: 'high',
          notes: 'Send thank you email after interview'
        });
      }
    });

    return reminders.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };

  useEffect(() => {
    if (autoCalculate && applications.length > 0) {
      const calculatedReminders = calculateFollowUpTimes(applications);
      setReminders(calculatedReminders);
    }
  }, [applications, autoCalculate]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotifications(permission === 'granted');
      
      if (permission === 'granted') {
        // Show test notification
        new Notification('Follow-up Reminders Enabled', {
          body: 'You\'ll now receive notifications for upcoming follow-ups',
          icon: '/favicon.ico'
        });
      }
    }
  };

  // Send browser notification
  const sendNotification = (reminder: FollowUpReminder) => {
    if (notifications && 'Notification' in window) {
      new Notification(`Follow-up Due: ${reminder.company}`, {
        body: `Time to follow up on your ${reminder.position} application`,
        icon: '/favicon.ico',
        tag: reminder.id
      });
    }
  };

  // Mark reminder as completed
  const markCompleted = (reminderId: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, status: 'completed' as const }
          : reminder
      )
    );
  };

  // Get reminder icon
  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'linkedin': return <MessageSquare className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'overdue': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const overdueReminders = reminders.filter(r => r.status === 'overdue');
  const completedReminders = reminders.filter(r => r.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Follow-up Engine</h2>
          <p className="text-gray-400">AI-powered follow-up reminders and tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={requestNotificationPermission}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              notifications
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            )}
          >
            {notifications ? 'Notifications On' : 'Enable Notifications'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedCard className="text-center">
          <div className="text-2xl font-bold text-white mb-1">
            <AnimatedCounter value={pendingReminders.length} />
          </div>
          <div className="text-sm text-gray-400">Pending</div>
        </AnimatedCard>
        <AnimatedCard className="text-center">
          <div className="text-2xl font-bold text-red-400 mb-1">
            <AnimatedCounter value={overdueReminders.length} />
          </div>
          <div className="text-sm text-gray-400">Overdue</div>
        </AnimatedCard>
        <AnimatedCard className="text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            <AnimatedCounter value={completedReminders.length} />
          </div>
          <div className="text-sm text-gray-400">Completed</div>
        </AnimatedCard>
        <AnimatedCard className="text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            <AnimatedCounter value={reminders.length} />
          </div>
          <div className="text-sm text-gray-400">Total</div>
        </AnimatedCard>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Upcoming Follow-ups</h3>
        
        <AnimatePresence>
          {reminders.length === 0 ? (
            <AnimatedCard className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">No Follow-ups Needed</h4>
              <p className="text-gray-400">
                All your applications are up to date. Great job staying on top of your follow-ups!
              </p>
            </AnimatedCard>
          ) : (
            reminders.map((reminder, index) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <InteractiveCard
                  title={`${reminder.company} - ${reminder.position}`}
                  icon={getReminderIcon(reminder.type)}
                  badge={reminder.priority}
                  expandedContent={
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white ml-2 capitalize">{reminder.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Due:</span>
                          <span className="text-white ml-2">
                            {reminder.dueDate.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {reminder.notes && (
                        <div>
                          <span className="text-gray-400 text-sm">Notes:</span>
                          <p className="text-white text-sm mt-1">{reminder.notes}</p>
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => markCompleted(reminder.id)}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Mark Complete
                        </button>
                        <button
                          onClick={() => sendNotification(reminder)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Send Reminder
                        </button>
                      </div>
                    </div>
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={clsx(
                        'p-2 rounded-lg border',
                        getPriorityColor(reminder.priority)
                      )}>
                        {getReminderIcon(reminder.type)}
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">
                          {reminder.dueDate.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reminder.notes}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={clsx(
                        'text-sm font-medium',
                        getStatusColor(reminder.status)
                      )}>
                        {reminder.status}
                      </span>
                      {reminder.status === 'pending' && (
                        <button
                          onClick={() => markCompleted(reminder.id)}
                          className="p-1 text-green-400 hover:bg-green-900/20 rounded"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* AI Recommendations */}
      <AnimatedCard>
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-1">📧 Email Follow-up Template</h4>
            <p className="text-sm text-blue-300">
              "Hi [Hiring Manager], I wanted to follow up on my application for [Position] at [Company]. 
              I remain very interested in this opportunity and would love to discuss how my skills align with your needs."
            </p>
          </div>
          <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <h4 className="font-semibold text-green-400 mb-1">⏰ Optimal Timing</h4>
            <p className="text-sm text-green-300">
              Best times to follow up: Tuesday-Thursday, 10 AM - 2 PM. Avoid Mondays and Fridays.
            </p>
          </div>
          <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <h4 className="font-semibold text-purple-400 mb-1">🎯 Follow-up Strategy</h4>
            <p className="text-sm text-purple-300">
              Week 1: Email follow-up. Week 2: LinkedIn connection. Week 3: Phone call if appropriate.
            </p>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default FollowUpEngine;
