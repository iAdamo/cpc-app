import DateFormatter from "@/utils/DateFormat";
import { PresenceResponse } from "@/types";

export const STATUS_MAP: Record<
  string,
  {
    action: "success" | "muted" | "danger" | "warning" | "info";
    colorClass: string;
    label: string;
  }
> = {
  available: {
    action: "success",
    colorClass: "text-green-600",
    label: "Available",
  },
  offline: {
    action: "muted",
    colorClass: "text-gray-500",
    label: "Offline",
  },
  busy: {
    action: "danger",
    colorClass: "text-red-600",
    label: "Busy",
  },
  away: {
    action: "warning",
    colorClass: "text-yellow-500",
    label: "Away",
  },
};

/**
 * Convert raw presence response to UI-ready normalized data
 */
export function normalizePresence(presence?: PresenceResponse) {
  const rawStatus =
    presence?.customStatus ?? (presence?.isOnline ? "available" : "offline");

  const status = String(rawStatus).toLowerCase();

  const statusData = STATUS_MAP[status] ?? STATUS_MAP.offline;

  return {
    status, // "offline"
    label: statusData.label, // "Offline"
    action: statusData.action, // badge action
    colorClass: statusData.colorClass,
    isOnline: presence?.isOnline ?? false,
    lastSeenText:
      !presence?.isOnline && presence?.lastSeen
        ? DateFormatter.toRelative(presence.lastSeen)
        : null,
  };
}
