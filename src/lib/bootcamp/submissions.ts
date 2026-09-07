const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BootcampSubmissionInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BootcampSubmissionInputError';
  }
}

export type BootcampAssignmentSubmissionInput = {
  workspaceId: string;
  curriculumId: string;
  fileLink: string;
};

function uuid(value: unknown, label: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new BootcampSubmissionInputError(`${label} tidak valid.`);
  }
  return value;
}

/**
 * Assignment links are external resources (Drive, Canva, GitHub, etc.).
 * Requiring HTTPS and rejecting credentials prevents the server from storing
 * javascript/data URLs or URLs that smuggle a password in the authority part.
 */
function secureUrl(value: unknown): string {
  if (typeof value !== 'string') throw new BootcampSubmissionInputError('Link submission wajib diisi.');
  const candidate = value.trim();
  if (!candidate || candidate.length > 2_000) throw new BootcampSubmissionInputError('Link submission tidak valid.');
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('unsafe');
    return parsed.toString();
  } catch {
    throw new BootcampSubmissionInputError('Link submission harus berupa URL HTTPS yang valid.');
  }
}

export function parseBootcampAssignmentSubmission(value: unknown): BootcampAssignmentSubmissionInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BootcampSubmissionInputError('Data pengumpulan tugas tidak valid.');
  }
  const input = value as Record<string, unknown>;
  return {
    workspaceId: uuid(input.workspaceId, 'Batch'),
    curriculumId: uuid(input.curriculumId, 'Tugas'),
    fileLink: secureUrl(input.fileLink),
  };
}
