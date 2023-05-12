import addBusinessDays from 'date-fns/addBusinessDays';

export const startingToBeSoonWindowDays = 1;

export function getDateStartingToBeSoon(): Date {
  return addBusinessDays(new Date(), startingToBeSoonWindowDays);
}

export function isReminderSoon(reminderAt: Date): boolean {
  return reminderAt < getDateStartingToBeSoon();
}
