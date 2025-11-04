/**
 * Utility class for formatting and converting dates to various readable formats.
 */
export default class DateFormatter {
  /**
   * Checks if the provided date input is a valid date.
   * @param dateInput - The date value to validate (string, number, or Date).
   * @returns True if valid, false otherwise.
   */
  static isValid(dateInput: string | number | Date): boolean {
    const date = new Date(dateInput);
    return !isNaN(date.getTime());
  }

  /**
   * Converts a date to a short readable format (e.g., "Jan 18, 2025").
   * @param dateInput - The date value to format.
   * @returns The formatted date string.
   */
  static toShortDate(dateInput: string | number | Date): string {
    const date = new Date(dateInput);
    if (!DateFormatter.isValid(date)) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Converts a date to a long readable format (e.g., "Saturday, January 18, 2025").
   * @param dateInput - The date value to format.
   * @returns The formatted date string.
   */
  static toLongDate(dateInput: string | number | Date): string {
    const date = new Date(dateInput);
    if (!DateFormatter.isValid(date)) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  }

  /**
   * Converts a date to a time string (e.g., "12:34 PM").
   * @param dateInput - The date value to format.
   * @returns The formatted time string.
   */
  static toTime(dateInput: string | number | Date): string {
    const date = new Date(dateInput);
    if (!DateFormatter.isValid(date)) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Converts a date to a combined short date and time string (e.g., "Jan 18, 2025 12:34 PM").
   * @param dateInput - The date value to format.
   * @returns The formatted date and time string.
   */
  static toDateTime(dateInput: string | number | Date): string {
    return `${DateFormatter.toShortDate(dateInput)} ${DateFormatter.toTime(
      dateInput
    )}`;
  }

  /**
   * Converts a date to a relative time string (e.g., "2 days ago", "just now").
   * @param dateInput - The date value to compare.
   * @returns The relative time string.
   */
  static toRelative(dateInput: string | number | Date): string {
    const date = new Date(dateInput);
    if (!DateFormatter.isValid(date)) return "";
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} day(s) ago`;
    return DateFormatter.toShortDate(dateInput);
  }

  /**
   * Returns the number of whole days remaining from now until the provided
   * date input. Rounds up partial days to the next integer.
   * - Returns -1 if the input is not a valid date.
   * - Returns 0 if the date is in the past or is today.
   */
  static remainingDays(dateInput: string | number | Date): number | null {
    if (!DateFormatter.isValid(dateInput)) return null;
    const target = new Date(dateInput).getTime();
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff = target - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / msPerDay);
  }
}
