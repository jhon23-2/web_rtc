import React from "react";
import { usePeerContext } from "../hooks/usePeerContext";


const VideoPlayer = () => {
  

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
  
 

  const renderDebugInfo = () => (
    <div className="absolute top-0 left-0 bg-yellow-200 p-2 text-xs">
      Status: {meetingStatus} | In Call: {inCall ? "Yes" : "No"}
    </div>
  );

  if (socketError) {
    return (
      <div className="text-2xl flex justify-center items-center w-screen h-screen font-bold">
        Socket Error: <p className="text-red-600"> {socketError}</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center relative">
      {renderDebugInfo()}

      <h1 className="text-center font-bold text-3xl">Web RTC Application</h1>
      <div className="flex w-full items-start mt-3.5">
        <label className="font-bold text-2xl">
            Room id: 
            <small className="font-semibold text-2xl text-gray-500"> {roomId}</small>
        </label>
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
            {!inCall && (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
                Waiting for connection...
              </div>
            )}
          </div>}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
