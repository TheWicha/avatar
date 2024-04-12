import { useState } from "react";

const useCheckboxHandler = (
  sessionInfo,
  mediaCanPlay,
  updateStatus,
  setRemoveBG,
  hideElement,
  showElement,
  renderCanvas,
  mediaElement,
  canvasElement
) => {
  const [removeBG, setRemoveBG] = useState(false);

  const handleCheckboxClick = (isChecked) => {
    if (isChecked && !sessionInfo) {
      updateStatus("Please create a connection first");
      setRemoveBG(false);
      return;
    }

    if (isChecked && !mediaCanPlay) {
      updateStatus("Please wait for the video to load");
      setRemoveBG(false);
      return;
    }

    if (isChecked) {
      hideElement(mediaElement.current);
      showElement(canvasElement.current);
      renderCanvas();
    } else {
      hideElement(canvasElement.current);
      showElement(mediaElement.current);
    }
  };

  return { removeBG, handleCheckboxClick };
};

export default useCheckboxHandler;
