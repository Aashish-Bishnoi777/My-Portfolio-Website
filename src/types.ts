export interface Project {
  id?: string;
  title: string;
  description: string;
  tools: string[];
  imageUrl: string;
  link?: string;
  createdAt: any;
}

export interface Achievement {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  createdAt: any;
}

export interface Skill {
  name: string;
  proficiency: number;
}

export interface Profile {
  id?: string;
  name: string;
  title: string;
  tagline: string;
  about: string;
  university: string;
  careerGoals: string;
  profileImage: string;
  skills: Skill[];
  socialLinks: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    github?: string;
  };
  resumeUrl?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
}
