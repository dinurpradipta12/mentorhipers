const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BootcampQuizTemplateInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BootcampQuizTemplateInputError';
  }
}

type TemplateQuestion = {
  id: number | string;
  text: string;
  type: 'mc' | 'multiple_choice' | 'essay' | 'long_text' | 'other';
  options: string[];
  correct: number | null;
  required: boolean;
};

export type BootcampQuizTemplateInput = {
  title: string;
  description: string | null;
  category: string | null;
  questionsJson: TemplateQuestion[];
};

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BootcampQuizTemplateInputError(`${label} tidak valid.`);
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== 'string') throw new BootcampQuizTemplateInputError(`${label} wajib diisi.`);
  const normalized = value.trim();
  if (!normalized) throw new BootcampQuizTemplateInputError(`${label} wajib diisi.`);
  if (normalized.length > maxLength) throw new BootcampQuizTemplateInputError(`${label} terlalu panjang.`);
  return normalized;
}

function optionalText(value: unknown, label: string, maxLength: number): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw new BootcampQuizTemplateInputError(`${label} tidak valid.`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new BootcampQuizTemplateInputError(`${label} terlalu panjang.`);
  return normalized || null;
}

function parseQuestion(value: unknown, index: number): TemplateQuestion {
  const input = record(value, `Soal ${index + 1}`);
  const rawType = input.type === undefined ? 'mc' : input.type;
  if (rawType !== 'mc' && rawType !== 'multiple_choice' && rawType !== 'essay' && rawType !== 'long_text' && rawType !== 'other') {
    throw new BootcampQuizTemplateInputError(`Tipe soal ${index + 1} tidak valid.`);
  }
  const rawOptions = input.options === undefined ? [] : input.options;
  if (!Array.isArray(rawOptions) || rawOptions.length > 20) throw new BootcampQuizTemplateInputError(`Pilihan soal ${index + 1} tidak valid.`);
  const options = rawOptions.map((option, optionIndex) => text(option, `Pilihan ${index + 1}.${optionIndex + 1}`, 500));
  if ((rawType === 'mc' || rawType === 'multiple_choice') && options.length < 2) {
    throw new BootcampQuizTemplateInputError(`Soal pilihan ganda ${index + 1} minimal memiliki dua pilihan.`);
  }
  let correct: number | null = null;
  if (input.correct !== null && input.correct !== undefined && input.correct !== '') {
    const candidate = typeof input.correct === 'number' ? input.correct : Number(input.correct);
    if (!Number.isSafeInteger(candidate) || candidate < 0 || candidate >= options.length) throw new BootcampQuizTemplateInputError(`Kunci jawaban soal ${index + 1} tidak valid.`);
    correct = candidate;
  }
  if ((rawType === 'mc' || rawType === 'multiple_choice') && correct === null) {
    throw new BootcampQuizTemplateInputError(`Kunci jawaban soal ${index + 1} wajib diisi.`);
  }
  const rawId = input.id;
  const id = typeof rawId === 'number' && Number.isSafeInteger(rawId) ? rawId : typeof rawId === 'string' && rawId.length <= 80 ? rawId : index + 1;
  return {
    id,
    text: text(input.text, `Teks soal ${index + 1}`, 10_000),
    type: rawType,
    options,
    correct,
    required: input.required === undefined ? true : input.required === true,
  };
}

export function parseBootcampQuizTemplateInput(value: unknown): BootcampQuizTemplateInput {
  const input = record(value, 'Data template quiz');
  const questions = input.questionsJson ?? input.questions_json;
  if (!Array.isArray(questions) || questions.length === 0 || questions.length > 200) {
    throw new BootcampQuizTemplateInputError('Template quiz harus memiliki 1–200 soal.');
  }
  return {
    title: text(input.title, 'Judul template', 180),
    description: optionalText(input.description, 'Deskripsi template', 12_000),
    category: optionalText(input.category, 'Kategori template', 80),
    questionsJson: questions.map(parseQuestion),
  };
}

export function parseBootcampQuizTemplateId(value: unknown): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) throw new BootcampQuizTemplateInputError('Template quiz tidak valid.');
  return value;
}
