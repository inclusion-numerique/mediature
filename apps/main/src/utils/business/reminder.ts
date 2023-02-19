import addBusinessDays from 'date-fns/addBusinessDays';

export function isReminderSoon(reminderAt: Date): boolean {
  const reminderDateStartingBeSoon = addBusinessDays(new Date(), 1);

  return reminderAt < reminderDateStartingBeSoon;
}
