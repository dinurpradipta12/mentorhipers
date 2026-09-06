export type WebinarStatus = 'draft' | 'published' | 'archived';
export type VideoProvider = 'youtube' | 'vimeo' | 'direct' | 'storage';
export type ResourceType = 'link' | 'file' | 'worksheet' | 'slide' | 'download';

export type WebinarListItem = {
  id: string;
  publicCode: string;
  title: string;
  description: string;
  instructorName: string | null;
  category: string | null;
  coverUrl: string | null;
  coverStoragePath: string | null;
  status: WebinarStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lessonCount: number;
};

export type WebinarSection = {
  id: string;
  webinarId: string;
  title: string;
  description: string | null;
  sortOrder: number;
};

export type WebinarLesson = {
  id: string;
  webinarId: string;
  sectionId: string;
  title: string;
  lessonSlug: string;
  description: string | null;
  videoProvider: VideoProvider;
  videoUrl: string | null;
  storagePath: string | null;
  thumbnailUrl: string | null;
  thumbnailStoragePath: string | null;
  durationSeconds: number | null;
  contentRich: string | null;
  sortOrder: number;
  isPublished: boolean;
};

export type WebinarResource = {
  id: string;
  webinarId: string;
  lessonId: string;
  title: string;
  resourceType: ResourceType;
  publicUrl: string | null;
  storagePath: string | null;
  sortOrder: number;
};

export type WebinarEditorData = WebinarListItem & {
  sections: WebinarSection[];
  lessons: WebinarLesson[];
  resources: WebinarResource[];
};

/**
 * Allowlisted shape serialized to an unauthenticated visitor.  Do not reuse
 * the editor models here: those contain database identifiers and storage
 * paths that are useful to administrators but not part of the public API.
 */
export type PublicWebinarResource = {
  title: string;
  resourceType: ResourceType;
  publicUrl: string | null;
  sortOrder: number;
};

export type PublicWebinarLesson = {
  lessonSlug: string;
  title: string;
  description: string | null;
  videoProvider: VideoProvider;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  contentRich: string | null;
  sortOrder: number;
  resources: PublicWebinarResource[];
};

export type PublicWebinarSection = {
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: PublicWebinarLesson[];
};

export type PublicWebinar = {
  publicCode: string;
  title: string;
  description: string;
  instructorName: string | null;
  category: string | null;
  coverUrl: string | null;
  publishedAt: string;
  sections: PublicWebinarSection[];
};
