export type NormalizedSchedule = {
  title: string;
  date: string | null;
  time: string | null;
  meet_link: string | null;
};

export function normalizeSchedules(value: unknown): NormalizedSchedule[] {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    const schedule = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return {
      title: typeof schedule.title === 'string' ? schedule.title : 'Kelas',
      date: typeof schedule.date === 'string' ? schedule.date : null,
      time: typeof schedule.time === 'string' ? schedule.time : null,
      meet_link: typeof schedule.meet_link === 'string' ? schedule.meet_link : null,
    };
  });
}
