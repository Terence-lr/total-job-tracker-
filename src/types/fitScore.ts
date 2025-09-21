export type FitScoreResult = {
  fitScore: number; // 0-100
  missingKeywords: string[];
  notes: string;
};

export type FitScoreRequest = {
  jobDescription: string;
  profile: {
    skills: string[];
    summary?: string;
  };
};

export type FollowUpType = "applied-3d" | "applied-7d" | "interview-2d" | "interview-5d";

export type FollowUp = {
  jobId: string;
  dueAt: string; // UTC ISO string
  type: FollowUpType;
  done?: boolean;
};
