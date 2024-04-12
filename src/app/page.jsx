"use client";
import React, { useState, useRef, useEffect } from "react";
import { hideElement, showElement } from "./utils/domUtils";
import { heygen_API } from "../config/apiConfig";
import { useHandleMediaMetadata } from "./hooks/useHandleMediaMetadata";
import { useProcessFrame } from "./hooks/useProcessFrame";
import { useCheckAPI } from "./hooks/useCheckApi";
import useCreateSession from "./hooks/useCreateSession";
import useHandleKeyDown from "./hooks/useHandleKeyDown";

const App = () => {
  const [statusMessages, setStatusMessages] = useState([]);
  const [avatarID, setAvatarID] = useState("");
  const [voiceID, setVoiceID] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [removeBG, setRemoveBG] = useState(false);
  const [mediaCanPlay, setMediaCanPlay] = useState(false);
  const [renderID, setRenderID] = useState(0);
  const [bgInputValue, setBGInputValue] = useState(false);

  const mediaElement = useRef(null);
  const canvasElement = useRef(null);
  const bgInputRef = useRef(null);

  const updateStatus = (message) => {
    setStatusMessages((prevMessages) => [...prevMessages, message]);
  };
  useCheckAPI(heygen_API.apiKey, heygen_API.serverUrl);
  useHandleMediaMetadata(mediaElement, setMediaCanPlay);
  useProcessFrame(
    removeBG,
    renderID,
    bgInputValue,
    mediaElement,
    canvasElement
  );
  const { sessionInfo, peerConnection, createNewSession } = useCreateSession(
    avatarID,
    voiceID,
    updateStatus,
    mediaElement
  );

  useHandleKeyDown(
    bgInputRef,
    useProcessFrame(
      removeBG,
      renderID,
      bgInputValue,
      mediaElement,
      canvasElement
    )
  );

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

      useProcessFrame(
        removeBG,
        renderID,
        bgInputValue,
        mediaElement,
        canvasElement
      );
    } else {
      hideElement(canvasElement.current);
      showElement(mediaElement.current);

      setRenderID((prevRenderID) => prevRenderID + 1);
    }
  };

  const startAndDisplaySession = async () => {
    if (!sessionInfo) {
      updateStatus("Please create a connection first");
      return;
    }
    updateStatus("Starting session... please wait");
    const localDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(localDescription);

    peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) {
        handleICE(sessionInfo.session_id, candidate.toJSON());
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      updateStatus(
        `ICE connection state changed to: ${peerConnection.iceConnectionState}`
      );
    };

    await startSession(sessionInfo.session_id, localDescription);
    updateStatus("Session started successfully");
  };

  const closeConnectionHandler = async () => {
    if (!sessionInfo) {
      updateStatus("Please create a connection first");
      return;
    }
    updateStatus("Closing connection... please wait");
    peerConnection.close();
    await stopSession(sessionInfo.session_id);
    updateStatus("Connection closed successfully");
  };

  const repeatHandler = async () => {
    if (!sessionInfo) {
      updateStatus("Please create a connection first");
      return;
    }
    updateStatus("Sending task... please wait");
    const text = taskInput;
    await repeat(sessionInfo.session_id, text);
    updateStatus("Task sent successfully");
  };

  const talkHandler = async () => {
    if (!sessionInfo) {
      updateStatus("Please create a connection first");
      return;
    }
    updateStatus("Talking to LLM... please wait");
    const prompt = taskInput;
    const text = await talkToOpenAI(prompt);
    if (text) {
      await repeat(sessionInfo.session_id, text);
      updateStatus("LLM response sent successfully");
    } else {
      updateStatus("Failed to get a response from AI");
    }
  };

  const handleICE = async (session_id, candidate) => {
    const response = await fetch(`${heygen_API.serverUrl}/v1/streaming.ice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": heygen_API.apiKey,
      },
      body: JSON.stringify({ session_id, candidate }),
    });
    if (response.status === 500) {
      console.error("Server error");
      updateStatus(
        "Server Error. Please ask the staff if the service has been turned on"
      );
      throw new Error("Server error");
    } else {
      const data = await response.json();
      return data;
    }
  };

  const startSession = async (session_id, sdp) => {
    const response = await fetch(`${heygen_API.serverUrl}/v1/streaming.start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": heygen_API.apiKey,
      },
      body: JSON.stringify({ session_id, sdp }),
    });
    if (response.status === 500) {
      console.error("Server error");
      updateStatus(
        "Server Error. Please ask the staff if the service has been turned on"
      );
      throw new Error("Server error");
    } else {
      const data = await response.json();
      return data.data;
    }
  };

  const talkToOpenAI = async (prompt) => {
    const response = await fetch(`http://localhost:3000/openai/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
    if (response.status === 500) {
      console.error("Server error");
      updateStatus("Server Error. Please make sure to set the openai api key");
      throw new Error("Server error");
    } else {
      const data = await response.json();
      return data.text;
    }
  };

  const repeat = async (session_id, text) => {
    const response = await fetch(`${heygen_API.serverUrl}/v1/streaming.task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": heygen_API.apiKey,
      },
      body: JSON.stringify({ session_id, text }),
    });
    if (response.status === 500) {
      console.error("Server error");
      updateStatus(
        "Server Error. Please ask the staff if the service has been turned on"
      );
      throw new Error("Server error");
    } else {
      const data = await response.json();
      return data.data;
    }
  };

  const stopSession = async (session_id) => {
    const response = await fetch(`${heygen_API.serverUrl}/v1/streaming.stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": heygen_API.apiKey,
      },
      body: JSON.stringify({ session_id }),
    });
    if (response.status === 500) {
      console.error("Server error");
      updateStatus("Server Error. Please ask the staff for help");
      throw new Error("Server error");
    } else {
      const data = await response.json();
      return data.data;
    }
  };

  return (
    <div className="main">
      <div className="actionRowsWrap">
        <div className="actionRow">
          <label>
            AvatarID
            <input
              value={avatarID}
              onChange={(e) => setAvatarID(e.target.value)}
              type="text"
            />
          </label>

          <label>
            VoiceID
            <input
              value={voiceID}
              onChange={(e) => setVoiceID(e.target.value)}
              type="text"
            />
          </label>

          <button onClick={createNewSession}>New</button>
          <button onClick={startAndDisplaySession}>Start</button>
          <button onClick={closeConnectionHandler}>Close</button>
        </div>

        <div className="actionRow">
          <label>
            Message
            <input
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              type="text"
            />
          </label>
          <button onClick={repeatHandler}>Repeat</button>
          <button onClick={talkHandler}>Talk</button>
        </div>
      </div>
      <div id="status">
        {statusMessages.map((msg, index) => (
          <React.Fragment key={index}>
            {msg}
            <br />
          </React.Fragment>
        ))}
      </div>

      <div className="videoSectionWrap">
        <div className="videoWrap">
          <video ref={mediaElement} className="videoEle show" autoPlay></video>
          <canvas
            ref={canvasElement}
            className={`${removeBG ? "show" : "hide"}`}
          ></canvas>
        </div>

        <div
          className={`actionRow switchRow ${removeBG ? "show" : "hide"}`}
          id="bgCheckboxWrap"
        >
          <div className="switchWrap">
            <span>Remove background</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={removeBG}
                onChange={(e) => {
                  setRemoveBG(e.target.checked);
                  handleCheckboxClick(e.target.checked);
                }}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <label>
            Background (CSS)
            <input
              ref={bgInputRef}
              type="text"
              value='url("https://app.heygen.com/icons/heygen/logo_hori_text_light_bg.svg")'
              readOnly
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default App;
