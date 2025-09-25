import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JobOffer } from '../types/jobOffer';
import { getJobOffers, deleteJobOffer, acceptJobOffer, declineJobOffer } from '../services/jobOfferService';
import { useNotification } from '../contexts/NotificationContext';
import { motion } from 'framer-motion';
import { 
  Award, 
  DollarSign, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Trash2
} from 'lucide-react';
import Button from '../components/ui/Button';

export function JobOffers() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'comparison'>('cards');

  useEffect(() => {
    if (user) {
      loadOffers();
    }
  }, [user]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const offerData = await getJobOffers();
      setOffers(offerData);
    } catch (err: any) {
      setError(err.message || 'Failed to load job offers');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await acceptJobOffer(offerId);
      await loadOffers();
      showSuccess('Offer Accepted', 'Job offer has been accepted successfully.');
    } catch (error) {
      console.error('Error accepting offer:', error);
      showError('Accept Failed', 'Failed to accept job offer.');
    }
  };

  const handleDeclineOffer = async (offerId: string) => {
    try {
      await declineJobOffer(offerId);
      await loadOffers();
      showSuccess('Offer Declined', 'Job offer has been declined successfully.');
    } catch (error) {
      console.error('Error declining offer:', error);
      showError('Decline Failed', 'Failed to decline job offer.');
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    try {
      await deleteJobOffer(offerId);
      await loadOffers();
      showSuccess('Offer Deleted', 'Job offer has been deleted successfully.');
    } catch (error) {
      console.error('Error deleting offer:', error);
      showError('Delete Failed', 'Failed to delete job offer.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-400 bg-green-500/20';
      case 'declined': return 'text-red-400 bg-red-500/20';
      case 'expired': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'declined': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatSalary = (amount?: number, currency: string = 'USD', type: string = 'annual') => {
    if (!amount) return 'Not specified';
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formatted} ${type}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading job offers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Award className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Job Offers</h1>
                <p className="text-gray-400 text-lg">
                  Manage and compare your job offers
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant={viewMode === 'cards' ? 'primary' : 'outline'}
                onClick={() => setViewMode('cards')}
                size="sm"
              >
                Cards
              </Button>
              <Button
                variant={viewMode === 'comparison' ? 'primary' : 'outline'}
                onClick={() => setViewMode('comparison')}
                size="sm"
              >
                Compare
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Offers</p>
                <p className="text-2xl font-bold text-white">{offers.length}</p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Award className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {offers.filter(offer => offer.status === 'pending').length}
                </p>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Accepted</p>
                <p className="text-2xl font-bold text-green-400">
                  {offers.filter(offer => offer.status === 'accepted').length}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Declined</p>
                <p className="text-2xl font-bold text-red-400">
                  {offers.filter(offer => offer.status === 'declined').length}
                </p>
              </div>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Offers List */}
        {offers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Job Offers Yet</h3>
            <p className="text-gray-400">
              When you receive job offers, they'll appear here for comparison and management.
            </p>
          </motion.div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {offers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{offer.position}</h3>
                    <p className="text-gray-400">{offer.company}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full flex items-center space-x-1 ${getStatusColor(offer.status)}`}>
                    {getStatusIcon(offer.status)}
                    <span className="text-sm font-medium capitalize">{offer.status}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {offer.salary_amount && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-white font-medium">
                        {formatSalary(offer.salary_amount, offer.salary_currency, offer.salary_type)}
                      </span>
                    </div>
                  )}
                  
                  {offer.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">{offer.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">
                      Offer Date: {new Date(offer.offer_date).toLocaleDateString()}
                    </span>
                  </div>

                  {offer.offer_deadline && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">
                        Deadline: {new Date(offer.offer_deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {offer.benefits && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">Benefits:</p>
                    <p className="text-sm text-gray-300 line-clamp-2">{offer.benefits}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {offer.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleAcceptOffer(offer.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeclineOffer(offer.id)}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteOffer(offer.id)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Position</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Salary</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {offers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-white font-medium">{offer.company}</td>
                      <td className="px-6 py-4 text-gray-300">{offer.position}</td>
                      <td className="px-6 py-4 text-gray-300">
                        {offer.salary_amount ? formatSalary(offer.salary_amount, offer.salary_currency, offer.salary_type) : 'Not specified'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{offer.location || 'Not specified'}</td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full ${getStatusColor(offer.status)}`}>
                          {getStatusIcon(offer.status)}
                          <span className="text-sm font-medium capitalize">{offer.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {offer.status === 'pending' && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleAcceptOffer(offer.id)}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeclineOffer(offer.id)}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOffer(offer.id)}
                            leftIcon={<Trash2 className="w-4 h-4" />}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
