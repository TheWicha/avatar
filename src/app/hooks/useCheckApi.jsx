import { useEffect } from "react";

export const useCheckAPI = (apiKey, serverUrl) => {
  useEffect(() => {
    if (apiKey === "YourApiKey" || serverUrl === "") {
      alert("Please enter your API key and server URL in the api.json file");
    }
  }, [apiKey, serverUrl]);
};
