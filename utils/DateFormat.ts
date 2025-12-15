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
   * Checks if a date is today.
   * @param dateInput - The date value to check.
   * @returns True if the date is today, false otherwise.
   */
  static isToday(dateInput: string | number | Date): boolean {
    const date = new Date(dateInput);
    if (!DateFormatter.isValid(date)) return false;

    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Checks if a date is yesterday.
   * @param dateInput - The date value to check.
   * @returns True if the date is yesterday, false otherwise.
   */
  static isYesterday(dateInput: string | number | Date): boolean {
    const date = new Date(dateInput);
    if (!DateFormatter.isValid(date)) return false;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  }

  /**
   * Generic date formatting using Intl.DateTimeFormat.
   * @param dateInput - The date value to format.
   * @param format - The format string (e.g., 'MMM d, yyyy', 'yyyy-MM-dd', etc.).
   * @param locale - The locale to use (default: 'en-US').
   * @returns The formatted date string.
   */
  static format(
    dateInput: string | number | Date,
    format: string,
    locale: string = "en-US"
  ): string {
    const date = new Date(dateInput);
    if (!DateFormatter.isValid(date)) return "";

    // Map format tokens to Intl.DateTimeFormat options
    const options: Intl.DateTimeFormatOptions = {};

    if (format.includes("yyyy")) options.year = "numeric";
    if (format.includes("yy")) options.year = "2-digit";
    if (format.includes("MMMM")) options.month = "long";
    if (format.includes("MMM")) options.month = "short";
    if (format.includes("MM")) options.month = "2-digit";
    if (format.includes("M")) options.month = "numeric";
    if (format.includes("dd")) options.day = "2-digit";
    if (format.includes("d")) options.day = "numeric";
    if (format.includes("EEEE")) options.weekday = "long";
    if (format.includes("EEE")) options.weekday = "short";
    if (format.includes("HH")) options.hour = "2-digit";
    if (format.includes("H")) options.hour = "numeric";
    if (format.includes("hh")) {
      options.hour = "2-digit";
      options.hour12 = true;
    }
    if (format.includes("h")) {
      options.hour = "numeric";
      options.hour12 = true;
    }
    if (format.includes("mm")) options.minute = "2-digit";
    if (format.includes("m")) options.minute = "numeric";
    if (format.includes("ss")) options.second = "2-digit";
    if (format.includes("s")) options.second = "numeric";
    if (format.includes("a")) options.hour12 = true;

    try {
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
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
    if (diff < 1) return "just now";
    if (diff < 60) {
      const secs = Math.floor(diff);
      return `${secs} ${secs === 1 ? "second" : "seconds"} ago`;
    }
    if (diff < 3600) {
      const mins = Math.floor(diff / 60);
      return `${mins} ${mins === 1 ? "min" : "mins"} ago`;
    }
    if (diff < 86400) {
      const hrs = Math.floor(diff / 3600);
      return `${hrs} ${hrs === 1 ? "hour" : "hours"} ago`;
    }
    if (diff < 604800) {
      const days = Math.floor(diff / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
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

  /**
   * Returns a human-readable remaining time until the provided date.
   * Examples: "2 days", "3 hours", "5 mins", "10 seconds"
   * Returns null for invalid dates and "0 days" for past/now.
   */
  static remainingTime(dateInput: string | number | Date): string | null {
    if (!DateFormatter.isValid(dateInput)) return null;
    const target = new Date(dateInput).getTime();
    const now = Date.now();
    let diffSec = Math.ceil((target - now) / 1000);
    if (diffSec <= 0) return "0 days";

    const secPerDay = 24 * 60 * 60;
    const secPerHour = 60 * 60;
    const secPerMin = 60;

    if (diffSec >= secPerDay) {
      const days = Math.ceil(diffSec / secPerDay);
      return `${days} ${days === 1 ? "day" : "days"}`;
    }

    if (diffSec >= secPerHour) {
      const hours = Math.ceil(diffSec / secPerHour);
      return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    }

    if (diffSec >= secPerMin) {
      const mins = Math.ceil(diffSec / secPerMin);
      return `${mins} ${mins === 1 ? "min" : "mins"}`;
    }

    return `${diffSec} ${diffSec === 1 ? "second" : "seconds"}`;
  }

  /**
   * Get the start of the day (00:00:00) for a given date.
   */
  static startOfDay(dateInput: string | number | Date): Date {
    const date = new Date(dateInput);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  /**
   * Get the end of the day (23:59:59) for a given date.
   */
  static endOfDay(dateInput: string | number | Date): Date {
    const date = new Date(dateInput);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  /**
   * Get the difference in days between two dates.
   */
  static diffInDays(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}
