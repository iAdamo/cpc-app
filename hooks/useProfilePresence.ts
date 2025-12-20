import { useState, useEffect } from "react";
import {
  ProviderData,
  EventEnvelope,
  ResEventEnvelope,
  PresenceResponse,
} from "@/types";
import useGlobalStore from "@/store/globalStore";
import { socketService } from "@/services/socketService";
import { PresenceEvents } from "@/services/socketService";

export const useProfilePresence = (provider: ProviderData) => {
  const [otherAvailability, setOtherAvailability] =
    useState<PresenceResponse>();
  const { user } = useGlobalStore();

  useEffect(() => {
    if (user?._id === provider.owner) return;
    // Request current presence
    socketService.emitEvent(PresenceEvents.GET_STATUS, {
      targetId: provider.owner,
    });
    const handleStatusResponse = (envelope: ResEventEnvelope) => {
      let data: PresenceResponse;
      data = envelope.payload;
      console.log({ data });

      if (envelope.targetId === user?._id || data.userId !== envelope.targetId)
        return;

      setOtherAvailability({
        lastSeen: data.lastSeen,
        status: data?.status,
        isOnline: data.isOnline,
        customStatus: data.customStatus,
      });
    };

    // When presence changes
    const handleStatusChange = (envelope: EventEnvelope) => {
      console.log("change", { envelope });

      const data = envelope.payload;
      if (data.userId !== user?._id) return;
      // console.log(envelope.payload);

      setOtherAvailability({
        lastSeen: data.lastSeen,
        status: data.status,
        isOnline: data.isOnline,
        customStatus: data.customStatus,
      });
    };

    socketService.onEvent(PresenceEvents.STATUS_CHANGE, handleStatusChange);
    socketService.onEvent(PresenceEvents.STATUS_RESPONSE, handleStatusResponse);
    return () => {
      socketService.offEvent(PresenceEvents.STATUS_CHANGE, handleStatusChange);
      socketService.offEvent(
        PresenceEvents.STATUS_RESPONSE,
        handleStatusResponse
      );
    };
  }, []);

  return { otherAvailability };
};
