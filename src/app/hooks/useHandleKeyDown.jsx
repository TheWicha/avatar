import { useEffect } from "react";

const useHandleKeyDown = (bgInputRef, renderCanvas) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        renderCanvas();
      }
    };

    const bgInputCurrent = bgInputRef.current;
    if (bgInputCurrent) {
      bgInputCurrent.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (bgInputCurrent) {
        bgInputCurrent.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [bgInputRef, renderCanvas]);
};

export default useHandleKeyDown;
