import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePeerContext } from "../hooks/usePeerContext";


const VideoPlayer = () => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate()

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
    getMediaDevices,
    isVideoOff,
    isMuted,
    toggleAudio,
    toggleVideo,
    isDarkMode,
    setIsDarkMode
  } = usePeerContext()

 
  
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

  if (!permissionsGranted) {
    getMediaDevices()
  }


  return (
    <div className={`w-screen h-screen flex flex-col ${isDarkMode ? 'bg-linear-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      
      {/* Top Header Bar */}
      <div className={`${isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-sm shadow-lg px-8 py-4 flex items-center justify-between border-b`}>
        {/* Left side - Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className={`font-bold text-2xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Web RTC Application</h1>
        </div>

        {/* Center - Status Badge */}
        <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-yellow-900/30 border-yellow-700/50' : 'bg-yellow-50 border-yellow-200'} border`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>Status:</span>
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-900'}`}>{meetingStatus}</span>
          </div>
          <div className={`w-px h-4 ${isDarkMode ? 'bg-yellow-700' : 'bg-yellow-300'}`}></div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>In Call:</span>
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-900'}`}>{inCall ? "Yes" : "No"}</span>
          </div>
        </div>

        {/* Right side - Room ID */}
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <div>
              <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Room id:</p>
              <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{roomId}</p>
            </div>
          </div>
          <button
            onClick={handleCopyRoomId}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2
              ${copied 
                ? "bg-green-500 text-white" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            `}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className={`h-full flex gap-6 ${inCall ? "" : "justify-center items-center"}`}>
          
          {/* Local Video */}
          <div className={`${inCall ? "w-1/2" : "w-full max-w-4xl"} h-full flex flex-col`}>
            <div className={`px-6 py-3 rounded-t-2xl flex items-center justify-between shadow-lg ${isDarkMode ? 'bg-linear-to-r from-gray-700 to-gray-800' : 'bg-linear-to-r from-gray-600 to-gray-700'}`}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <h2 className="font-bold text-white text-lg">{localUsername || "Me"}</h2>
              </div>
              <div className="flex gap-2">
                {/* Mic Button */}
                <button 
                  onClick={toggleAudio}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                    isMuted 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {isMuted ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
                
                {/* Camera Button */}
                <button 
                  onClick={toggleVideo}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                    isVideoOff 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {isVideoOff ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className={`flex-1 bg-black rounded-b-2xl overflow-hidden shadow-2xl border-4 relative ${isDarkMode ? 'border-gray-700' : 'border-gray-400'}`}>
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                ref={localVideoRef}
              ></video>
            </div>
          </div>

          {/* Remote Video - Only shows when in call */}
          {inCall && (
            <div className="w-1/2 h-full flex flex-col">
              <div className="bg-linear-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-t-2xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <h2 className="font-bold text-white text-lg">{remoteUsername || "User Joined"}</h2>
                </div>
              </div>
              <div className="flex-1 bg-black rounded-b-2xl overflow-hidden shadow-2xl border-4 border-purple-600 relative">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  ref={remoteVideoRef}
                ></video>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar - Redesigned */}
      <div className={`${isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-sm border-t px-8 py-5 shadow-lg`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          
          {/* Left Section - Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {isDarkMode ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  <span className="text-sm font-semibold">Dark Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold">Light Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Center Section - Call Controls */}
          <div className="flex items-center gap-4">
            {/* Mute Button */}
            <button 
              onClick={toggleAudio}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isMuted 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isMuted ? (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>

            {/* End Call Button */}
            <button onClick={() => {
              const leave = window.confirm("Are you sure, Leave to the room ? ")
              if(leave) {
                navigate("/call-end", {replace: true})
              }
            }} className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
            </button>

            {/* Video Toggle Button */}
            <button 
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isVideoOff 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isVideoOff ? (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>

          {/* Right Section - App Info */}
          <div className="flex items-center gap-2">
            <div className={`px-4 py-2.5 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Secure peer-to-peer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;