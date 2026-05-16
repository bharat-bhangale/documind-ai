/**
 * Formats file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(k));
  const size = (bytes / Math.pow(k, unitIndex)).toFixed(unitIndex > 0 ? 1 : 0);

  return `${size} ${units[unitIndex]}`;
}

/**
 * Formats a date string or Date object to a localized string.
 */
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/**
 * Formats a date string or Date to a relative "time ago" string.
 */
export function timeAgo(date: string | Date | undefined | null): string {
  if (!date) return "";

  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return formatDate(date);
}

/**
 * Formats an amount in paise to INR currency string.
 */
export function formatCurrency(paise: number): string {
  const rupees = paise / 100;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(rupees);
}

/**
 * Truncates a string to a max length and appends an ellipsis.
 */
export function truncate(str: string | undefined | null, maxLength = 60): string {
  if (!str || str.length <= maxLength) return str || "";
  return str.slice(0, maxLength) + "…";
}
