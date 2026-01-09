import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { useSocket } from "../hooks/useSocket";

const VideoPlayer = () => {
  const [stream, setStream] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [inCall, setInCall] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  const { socket, socketError, socketIsConnected } = useSocket();

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
        console.log("Error Media Devices ", error);
      }
    };

    getMediaDevices();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle joining a room
  const handleJoinRoom = () => {
    if (socket && roomId) {
      console.log("Joining room:", roomId);
      socket.emit("join-room", roomId);
    }
  };

  // useEffect to listen offer and answerd event and establish the peer connection
  useEffect(() => {
    if (!socket || !socketIsConnected || !stream) {
      return;
    }

    const createPeer = (userId, isInitiator, offerData = null) => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }

      if (stream) {
        console.error("Cannot create peer: stream is not ready yet");
        return;
      }

      const peer = new Peer({
        initiator: isInitiator,
        trickle: false,
        stream,
      });

      peerRef.current = peer;

      // when peer generates a signal
      peer.on("signal", (data) => {
        if (data.type === "offer") {
          // offer is generated AUTOMATICALLY when initiator: true
          socket.emit("offer", { offer: data, to: userId });
        }

        if (data.type === "answer") {
          // offer is generated AUTOMATICALLY when initiator: false
          socket.emit("answer", { answer: data, to: userId });
        }
      });

      peer.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setInCall(true);
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
      });

      if (offerData) {
        peerRef.current.signal(offerData);
      }
    };

    socket.on("user-joined", (userJoinedId) => {
      console.log("User joined: ", userJoinedId);
      createPeer(userJoinedId, true);
    });

    socket.on("offer", ({ offer, from }) => {
      console.log("Received offer from:", from);
      createPeer(from, false, offer);
    });

    socket.on("answer", ({ answer, from }) => {
      console.log("Received answer from:", from);
      if (peerRef.current) {
        peerRef.current.signal(answer);
      }
      setInCall(true);
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
    };
  }, [socket, socketIsConnected, stream]);

  if (socketError) {
    return (
      <div className="text-2xl  flex justify-center items-center w-screen h-screen font-bold">
        socket Error: <p className="text-red-600"> {socketError}</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <h1 className="text-center font-bold text-3xl">Web RTC Application</h1>

      {localVideoRef && (
        <div className="mt-24 w-full h-[calc(100vh-200px)] flex flex-col">
          <div className="w-full flex">
            <label className="w-full flex justify-around mb-10 font-bold mr-10">
              Room Id
              <input
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                }}
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
            <div className="w-full h-full">
              <h2 className="font-semibold text-gray-500 text-center">
                Video Screen
              </h2>
              <video
                className="w-full h-full"
                autoPlay
                muted
                playsInline
                ref={localVideoRef}
              ></video>
            </div>

            {inCall && (
              <div className="w-full h-full">
                <h2 className="font-semibold text-gray-500 text-center">
                  Remote Screen
                </h2>
                <video
                  className="w-full h-full"
                  autoPlay
                  muted
                  playsInline
                  ref={remoteVideoRef}
                ></video>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
