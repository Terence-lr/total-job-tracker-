export type Skill = { 
  name: string; 
  level?: number; // 1-5 optional
};

export type Profile = { 
  userId: string; 
  skills: Skill[]; 
  summary?: string;
};
