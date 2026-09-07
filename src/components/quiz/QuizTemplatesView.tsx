import { QuizTemplatesManager } from './QuizTemplatesManager';

export function QuizTemplatesView({ templates }: { templates: Array<Record<string, unknown>> }) {
  return <QuizTemplatesManager initialTemplates={templates} />;
}
