import type { Timestamp } from "firebase/firestore";

export interface CardField {
  id: string;
  label: string;
  value: string;
}

export const CATEGORIES = [
  "Personal",
  "Legal",
  "Medical",
  "Financial",
  "Work",
  "Education",
  "Travel",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface PimCard {
  id: string;
  title: string;
  category: string;
  fields: CardField[];
  isPinned: boolean;
  icon?: string;
  order?: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  attachmentUrl?: string;
}

export interface PimCardInput {
  title: string;
  category: string;
  fields: CardField[];
  isPinned: boolean;
  icon?: string;
  attachmentUrl?: string;
}
