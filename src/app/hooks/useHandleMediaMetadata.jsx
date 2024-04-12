import { useEffect } from "react";

export const useHandleMediaMetadata = (mediaElement, setMediaCanPlay) => {
  useEffect(() => {
    if (mediaElement.current) {
      mediaElement.current.onloadedmetadata = () => {
        setMediaCanPlay(true);
        mediaElement.current.play();
      };
    }
  }, [mediaElement, setMediaCanPlay]);
};
