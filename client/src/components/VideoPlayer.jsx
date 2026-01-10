import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../hooks/useSocket";

const VideoPlayer = () => {
  const [stream, setStream] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [inCall, setInCall] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // For debugging

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remotePeerIdRef = useRef(null);

  const { socket, socketError, socketIsConnected } = useSocket();

  // WebRTC Configuration
  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    const getMediaDevices = async () => {
      try {
        const mediaDevicesStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setStream(mediaDevicesStream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaDevicesStream;
        }
      } catch (error) {
        console.log("Error getting media devices:", error);
      }
    };

    getMediaDevices();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  const handleJoinRoom = () => {
    if (socket && roomId) {
      console.log("Joining room:", roomId);
      socket.emit("join-room", roomId);
    }
  };

  const createPeerConnection = () => {
    console.log("Creating peer connection");

    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionRef.current = peerConnection;

    // Add local stream tracks to peer connection
    if (stream) {
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setInCall(true);
      setConnectionStatus("connected");
    };

    // Handle ICE (Interactive Connectivity Establishment) candidates when connection is established
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && remotePeerIdRef.current) {
        console.log("Sending ICE candidate ", remotePeerIdRef);
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          to: remotePeerIdRef.current,
        });
      }
    };

    // Monitor connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log("Connection state:", peerConnection.connectionState);
      if (peerConnection.connectionState === "connected") {
        setInCall(true);
        setConnectionStatus("connected");
      } else if (peerConnection.connectionState === "failed") {
        setConnectionStatus("failed");
        console.log("Connection failed");
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log("ICE Connection state:", peerConnection.iceConnectionState);
      if (peerConnection.iceConnectionState === "connected") {
        setInCall(true);
        setConnectionStatus("connected");
      }
    };

    return peerConnection;
  };

  const createOffer = async () => {
    try {
      console.log("Creating offer...");
      const peerConnection = createPeerConnection();

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      console.log("Sending offer");
      socket.emit("offer", {
        offer: peerConnection.localDescription,
        to: remotePeerIdRef.current,
      });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const createAnswer = async (offer) => {
    try {
      console.log("Creating answer");
      const peerConnection = createPeerConnection();

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      console.log("Sending answer");
      socket.emit("answer", {
        answer: peerConnection.localDescription,
        to: remotePeerIdRef.current,
      });
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  };

  useEffect(() => {
    if (!socket || !socketIsConnected) {
      return;
    }

    socket.on("user-joined", (userId) => {
      console.log("User joined:", userId);
      remotePeerIdRef.current = userId;
      setTimeout(() => createOffer(), 1000);
    });

    socket.on("offer", async ({ offer, from }) => {
      console.log("Received offer from:", from);
      remotePeerIdRef.current = from;
      await createAnswer(offer);
    });

    socket.on("answer", async ({ answer, from }) => {
      console.log("Received answer from:", from);
      remotePeerIdRef.current = from;

      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log("Remote description set successfully");
          setInCall(true);
          setConnectionStatus("connected");
        } catch (error) {
          console.error("Error setting remote description:", error);
        }
      }
    });

    socket.on("ice-candidate", async ({ candidate, from }) => {
      console.log("Received ICE candidate from:", from);

      if (peerConnectionRef.current && candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
          console.log("Added ICE candidate successfully");
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [socket, socketIsConnected, stream]);

  const renderDebugInfo = () => (
    <div className="absolute top-0 left-0 bg-yellow-200 p-2 text-xs">
      Status: {connectionStatus} | In Call: {inCall ? "Yes" : "No"}
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

      <div className="mt-24 w-full h-[calc(100vh-200px)] flex flex-col">
        <div className="w-full flex mb-4">
          <label className="w-full flex justify-around font-bold mr-10">
            Room Id
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="border-2 border-gray-300 pl-2 text-gray-500"
              type="text"
              placeholder="Type Room id"
            />
          </label>
          <button
            onClick={handleJoinRoom}
            className="border-2 rounded border-black h-8 w-20 cursor-pointer"
          >
            Join
          </button>
        </div>

        <div className="w-full flex h-full gap-2">
          <div className="w-1/2 h-full">
            <h2 className="font-semibold text-gray-500 text-center">
              Local Video
            </h2>
            <video
              className="w-full h-full bg-black"
              autoPlay
              muted
              playsInline
              ref={localVideoRef}
            ></video>
          </div>

          <div className="w-1/2 h-full">
            <h2 className="font-semibold text-gray-500 text-center">
              Remote Video {inCall ? "🟢" : "🔴"}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
