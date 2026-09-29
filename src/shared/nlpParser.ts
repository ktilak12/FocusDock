import { addDays, format, nextDay, parse, setHours, setMinutes, startOfDay } from 'date-fns';
import { Priority, RepeatRule } from '../types';

export interface ParsedTaskInput {
  title: string;
  dueDate?: string;
  time?: string;
  repeatRule: RepeatRule;
  priority: Priority;
  category: string;
  reminderTime?: string;
}

const WEEKDAY_MAP: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  thur: 4,
  thurs: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

export function parseNaturalLanguageTask(input: string): ParsedTaskInput {
  let text = input.trim();
  let dueDate: string | undefined = undefined;
  let time: string | undefined = undefined;
  let repeatRule: RepeatRule = 'none';
  let priority: Priority = 'medium';
  let category: string = 'General';

  // 1. Check Priority tags (!high, !h, !p1, !med, !low)
  if (/\b(!high|!h|!p1|high priority)\b/i.test(text)) {
    priority = 'high';
    text = text.replace(/\b(!high|!h|!p1|high priority)\b/gi, '');
  } else if (/\b(!low|!l|!p3|low priority)\b/i.test(text)) {
    priority = 'low';
    text = text.replace(/\b(!low|!l|!p3|low priority)\b/gi, '');
  } else if (/\b(!medium|!med|!m|!p2|medium priority)\b/i.test(text)) {
    priority = 'medium';
    text = text.replace(/\b(!medium|!med|!m|!p2|medium priority)\b/gi, '');
  }

  // 2. Check Hashtags for category (#work, #personal, #study, #gym)
  const categoryMatch = text.match(/#([a-zA-Z0-9_-]+)/);
  if (categoryMatch) {
    category = categoryMatch[1];
    text = text.replace(categoryMatch[0], '');
  }

  // 3. Check Recurring Patterns ("every day", "every weekday", "every week", "every monday", etc.)
  if (/\bevery\s+day\b|\bdaily\b/i.test(text)) {
    repeatRule = 'daily';
    dueDate = format(new Date(), 'yyyy-MM-dd');
    text = text.replace(/\bevery\s+day\b|\bdaily\b/gi, '');
  } else if (/\bevery\s+weekday\b/i.test(text)) {
    repeatRule = 'weekdays';
    dueDate = format(new Date(), 'yyyy-MM-dd');
    text = text.replace(/\bevery\s+weekday\b/gi, '');
  } else if (/\bevery\s+week\b|\bweekly\b/i.test(text)) {
    repeatRule = 'weekly';
    dueDate = format(new Date(), 'yyyy-MM-dd');
    text = text.replace(/\bevery\s+week\b|\bweekly\b/gi, '');
  } else if (/\bevery\s+month\b|\bmonthly\b/i.test(text)) {
    repeatRule = 'monthly';
    dueDate = format(new Date(), 'yyyy-MM-dd');
    text = text.replace(/\bevery\s+month\b|\bmonthly\b/gi, '');
  } else {
    // Check "every Monday", "every Friday", etc.
    const everyDayMatch = text.match(/\bevery\s+(monday|mon|tuesday|tue|tues|wednesday|wed|thursday|thu|thur|thurs|friday|fri|saturday|sat|sunday|sun)\b/i);
    if (everyDayMatch) {
      repeatRule = 'weekly';
      const dayName = everyDayMatch[1].toLowerCase();
      const targetDay = WEEKDAY_MAP[dayName];
      if (targetDay !== undefined) {
        const today = new Date();
        const nextDate = nextDay(today, targetDay);
        dueDate = format(nextDate, 'yyyy-MM-dd');
      }
      text = text.replace(everyDayMatch[0], '');
    }
  }

  // 4. Check Date Keywords ("today", "tomorrow", "tmrw", specific weekday like "monday")
  if (/\b(today|tonight)\b/i.test(text)) {
    dueDate = format(new Date(), 'yyyy-MM-dd');
    text = text.replace(/\b(today|tonight)\b/gi, '');
  } else if (/\b(tomorrow|tmrw)\b/i.test(text)) {
    dueDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    text = text.replace(/\b(tomorrow|tmrw)\b/gi, '');
  } else if (!dueDate) {
    const singleDayMatch = text.match(/\b(on\s+)?(monday|mon|tuesday|tue|tues|wednesday|wed|thursday|thu|thur|thurs|friday|fri|saturday|sat|sunday|sun)\b/i);
    if (singleDayMatch) {
      const dayName = singleDayMatch[2].toLowerCase();
      const targetDay = WEEKDAY_MAP[dayName];
      if (targetDay !== undefined) {
        const today = new Date();
        const nextDate = today.getDay() === targetDay ? today : nextDay(today, targetDay);
        dueDate = format(nextDate, 'yyyy-MM-dd');
      }
      text = text.replace(singleDayMatch[0], '');
    }
  }

  // 5. Check Time Patterns ("10 AM", "10am", "7:30 PM", "7:30pm", "at 7pm", "at 19:00", "7 pm")
  const timeRegex = /\b(?:at\s+)?([0-1]?[0-9]|2[0-3]):?([0-5][0-9])?\s*(am|pm)\b|\b(?:at\s+)?([0-1]?[0-9]|2[0-3]):([0-5][0-9])\b/i;
  const timeMatch = text.match(timeRegex);

  if (timeMatch) {
    let hours = 0;
    let minutes = 0;

    if (timeMatch[3]) {
      // 12-hour format with AM/PM
      hours = parseInt(timeMatch[1], 10);
      minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3].toLowerCase();
      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
    } else if (timeMatch[4]) {
      // 24-hour format (HH:mm)
      hours = parseInt(timeMatch[4], 10);
      minutes = parseInt(timeMatch[5], 10);
    }

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    time = `${formattedHours}:${formattedMinutes}`;

    text = text.replace(timeMatch[0], '');
  }

  // Default due date to today if time is specified but no date was parsed
  if (time && !dueDate) {
    dueDate = format(new Date(), 'yyyy-MM-dd');
  }

  // Compute reminderTime if date and time exist
  let reminderTime: string | undefined = undefined;
  if (dueDate && time) {
    reminderTime = `${dueDate}T${time}:00`;
  }

  // Clean up remaining extra spaces
  const title = text.replace(/\s+/g, ' ').trim();

  return {
    title: title || input,
    dueDate,
    time,
    repeatRule,
    priority,
    category,
    reminderTime,
  };
}
