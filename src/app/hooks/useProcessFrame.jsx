import { isCloseToGreen } from "../utils/domUtils";
import { useEffect } from "react";

export const useProcessFrame = (
  removeBG,
  renderID,
  bgInputValue,
  mediaElement,
  canvasElement
) => {
  useEffect(() => {
    if (!removeBG) return;

    const curRenderID = Math.trunc(Math.random() * 1000000000);
    setRenderID(curRenderID);

    const ctx = canvasElement.current.getContext("2d", {
      willReadFrequently: true,
    });

    if (bgInputValue) {
      canvasElement.current.parentElement.style.background =
        bgInputValue.trim();
    }

    const processFrame = () => {
      if (!removeBG) return;
      if (curRenderID !== renderID) return;

      canvasElement.current.width = mediaElement.current.videoWidth;
      canvasElement.current.height = mediaElement.current.videoHeight;

      ctx.drawImage(
        mediaElement.current,
        0,
        0,
        canvasElement.current.width,
        canvasElement.current.height
      );

      const imageData = ctx.getImageData(
        0,
        0,
        canvasElement.current.width,
        canvasElement.current.height
      );
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];

        if (isCloseToGreen([red, green, blue])) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      requestAnimationFrame(processFrame);
    };

    processFrame();
  }, [removeBG, renderID, bgInputValue, mediaElement, canvasElement]);
};
