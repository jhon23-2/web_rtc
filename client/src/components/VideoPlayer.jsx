import React, { useState } from "react";
import { usePeerContext } from "../hooks/usePeerContext";


const VideoPlayer = () => {


  const [copied, setCopied] = useState(false);

  const {
    meetingStatus,
    inCall,
    socketError,
    localUsername,
    remoteUsername,
    localVideoRef,
    remoteVideoRef,
    roomId, 
    permissionsGranted,
    getMediaDevices
  } = usePeerContext()


  if( !permissionsGranted ) {
    getMediaDevices()
  }
 
  
  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
  
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  
 


  if (socketError) {
    return (
      <div className="text-2xl flex justify-center items-center w-screen h-screen font-bold">
        Socket Error: <p className="text-red-600"> {socketError}</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center relative">
      <div className="absolute top-0 left-0 bg-yellow-200 p-2 text-xs">
        Status: {meetingStatus} | In Call: {inCall ? "Yes" : "No"}
      </div>

      <h1 className="text-center font-bold text-3xl">Web RTC Application</h1>

      <div className="flex items-start w-full mt-12 gap-3">
  <label className="font-bold text-2xl">
    Room id:
    <small className="font-semibold text-2xl text-gray-500 ml-2">
      {roomId}
    </small>
  </label>

  <button
    onClick={handleCopyRoomId}
    className={`px-3 py-1 rounded text-sm font-semibold transition cursor-pointer
      ${copied ? "bg-green-600 text-white" : "bg-blue-600 text-white"}
    `}
  >
    {copied ? "Copied ✅" : "Copy"}
  </button>
</div>

      <div className="mt-24 w-full h-[calc(100vh-200px)] flex flex-col">

        <div className="w-full flex h-full gap-2">
          <div className={`${inCall ? "w-1/2 h-full": "flex justify-center items-center flex-col w-full"}`} >
            <h2 className="font-semibold text-gray-500 text-center">
              {localUsername || "Local Video"}
            </h2>
            <video
              className="w-full h-full bg-black"
              autoPlay
              muted
              playsInline
              ref={localVideoRef}
            ></video>
          </div>

          {inCall && <div className="w-1/2 h-full">
            <h2 className="font-semibold text-gray-500 text-center">
              {`${remoteUsername || "Remote Video"} ${inCall ? "🟢" : "🔴"}`}
            </h2>
            <video
              className={`w-full h-full bg-black ${inCall ? "" : "hidden"}`}
              autoPlay
              playsInline
              ref={remoteVideoRef}
            ></video>
          </div>
          }
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
