import React from "react";
import { Badge, BadgeText, BadgeIcon } from "@/components/ui/badge";
import { CircleDotIcon } from "lucide-react-native";
import { normalizePresence } from "@/utils/presence";
import { Presence } from "@/types";

interface PresenceBadgeProps {
  presence?: Presence | null;
  showLabel?: boolean; // Optional: show "Available", "Busy", etc.
  className?: string;
  iconSize?: number;
}

const PresenceBadge = ({
  presence,
  showLabel = true,
  className = "",
  iconSize = 12,
}: PresenceBadgeProps) => {
  const p = normalizePresence(presence ?? undefined);

  return (
    <Badge
      action={p.action as "error" | "success" | "info" | "muted" | "warning"}
      className={`px-2 py-1 ${className}`}
    >
      <BadgeIcon
        as={CircleDotIcon}
        className={`${p.colorClass}`}
        style={{ width: iconSize, height: iconSize }}
      />
      {showLabel && <BadgeText className="ml-2">{p.label}</BadgeText>}
    </Badge>
  );
};

export default PresenceBadge;
