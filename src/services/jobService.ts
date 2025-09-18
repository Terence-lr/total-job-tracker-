import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { JobApplication, CreateJobApplication, JobFilters } from '../types/job';

const COLLECTION_NAME = 'jobApplications';

// Create a new job application
export const createJobApplication = async (
  jobData: CreateJobApplication,
  userId: string
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...jobData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Job application created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating job application:', error);
    throw new Error('Failed to create job application');
  }
};

// Get all job applications for a user
export const getJobApplications = async (userId: string): Promise<JobApplication[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const jobs: JobApplication[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as JobApplication);
    });
    
    console.log(`Retrieved ${jobs.length} job applications for user ${userId}`);
    return jobs;
  } catch (error) {
    console.error('Error getting job applications:', error);
    throw new Error('Failed to retrieve job applications');
  }
};

// Get a single job application by ID
export const getJobApplication = async (jobId: string, userId: string): Promise<JobApplication | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, jobId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Verify the job belongs to the user
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to job application');
      }
      
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as JobApplication;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting job application:', error);
    throw new Error('Failed to retrieve job application');
  }
};

// Update a job application
export const updateJobApplication = async (
  jobId: string,
  updates: Partial<CreateJobApplication>,
  userId: string
): Promise<void> => {
  try {
    // First verify the job belongs to the user
    const existingJob = await getJobApplication(jobId, userId);
    if (!existingJob) {
      throw new Error('Job application not found or unauthorized');
    }
    
    const docRef = doc(db, COLLECTION_NAME, jobId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
    
    console.log('Job application updated:', jobId);
  } catch (error) {
    console.error('Error updating job application:', error);
    throw new Error('Failed to update job application');
  }
};

// Delete a job application
export const deleteJobApplication = async (jobId: string, userId: string): Promise<void> => {
  try {
    // First verify the job belongs to the user
    const existingJob = await getJobApplication(jobId, userId);
    if (!existingJob) {
      throw new Error('Job application not found or unauthorized');
    }
    
    const docRef = doc(db, COLLECTION_NAME, jobId);
    await deleteDoc(docRef);
    
    console.log('Job application deleted:', jobId);
  } catch (error) {
    console.error('Error deleting job application:', error);
    throw new Error('Failed to delete job application');
  }
};

// Search and filter job applications
export const searchJobApplications = async (
  userId: string,
  filters: JobFilters = {}
): Promise<JobApplication[]> => {
  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    // Apply status filter if provided
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    const querySnapshot = await getDocs(q);
    let jobs: JobApplication[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as JobApplication);
    });
    
    // Apply client-side filters for search and date range
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      jobs = jobs.filter(job => 
        job.company.toLowerCase().includes(searchTerm) ||
        job.position.toLowerCase().includes(searchTerm) ||
        (job.notes && job.notes.toLowerCase().includes(searchTerm))
      );
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      jobs = jobs.filter(job => new Date(job.dateApplied) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      jobs = jobs.filter(job => new Date(job.dateApplied) <= toDate);
    }
    
    console.log(`Found ${jobs.length} job applications matching filters`);
    return jobs;
  } catch (error) {
    console.error('Error searching job applications:', error);
    throw new Error('Failed to search job applications');
  }
};
