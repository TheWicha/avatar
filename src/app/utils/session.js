import { heygen_API } from "../../config/apiConfig";

export const fetchNewSession = async (avatarID, voiceID) => {
  const response = await fetch(`${heygen_API.serverUrl}/v1/streaming.new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": heygen_API.apiKey,
    },
    body: JSON.stringify({
      avatar_name: avatarID,
      voice: {
        voice_id: voiceID,
      },
    }),
  });
  const data = await response.json();
  return data.data;
};
