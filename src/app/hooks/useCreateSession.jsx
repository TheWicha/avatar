import { useState } from "react";
import { fetchNewSession } from "../utils/session";

const useCreateSession = (avatarID, voiceID, updateStatus, mediaElement) => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);

  const createNewSession = async () => {
    updateStatus("Creating new session... please wait");
    const sessionData = await fetchNewSession(avatarID, voiceID);
    setSessionInfo(sessionData);
    const { sdp: serverSdp, ice_servers2: iceServers } = sessionData;

    const newPeerConnection = new RTCPeerConnection({ iceServers });
    newPeerConnection.ontrack = (event) => {
      if (event.track.kind === "audio" || event.track.kind === "video") {
        mediaElement.current.srcObject = event.streams[0];
      }
    };
    setPeerConnection(newPeerConnection);
    updateStatus("Session creation completed");
  };

  return { sessionInfo, peerConnection, createNewSession };
};

export default useCreateSession;
