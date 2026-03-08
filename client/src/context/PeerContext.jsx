import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PeerContext } from '../hooks/usePeerContext';
import { useSocket } from '../hooks/useSocket';
import { CONFIGURATION, MEETING_STATUS } from "../tools/tools";


export const PeerContextProvider = ({ children }) => {

  const [stream, setStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [roomId, setRoomId] = useState("")
  const [inCall, setInCall] = useState(false)
  const [localUsername, setLocalUsername] = useState("")
  const [remoteUsername, setRemoteUsername] = useState("")
  const [meetingStatus, setMeetingStatus] = useState(MEETING_STATUS.DISCONNECTED)
  const [permissionsGranted, setPermissionsGranted] = useState(false); 
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const remotePeerIdRef = useRef(null) // store remote id
  const navigate = useNavigate()

  const { socket, socketError, socketIsConnected } = useSocket();

  const toggleAudio = () => {
    const audioTrack = stream.getAudioTracks()[0]

    if(audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  }

  const toggleVideo = () => {
    const videoTrack = stream.getVideoTracks()[0]

    if(videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  }

  const getMediaDevices = async () => {
    try {
      
      const streamMediaDevices = await window.navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      setStream(streamMediaDevices);
      setPermissionsGranted(true); 
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = streamMediaDevices;
      }
      
      return streamMediaDevices;
    } catch (error) {
      console.error("Error getting media devices:", error);
      setMeetingStatus(MEETING_STATUS.PERMISSION_DENIED);
      throw error;
    }
  };

  const handleJoinRoom =  () => {
    if (!socket || !roomId.trim() || !localUsername.trim()) return;  
    console.log("Joining room:", roomId);
    socket.emit("join-room", { roomId, username: localUsername });
    navigate("/meeting", {replace: true});
  };

  const handleParticipantLeft = (participantId) => {
    console.log("Cleaning up connection for participant:", participantId);

    // Close peer connection if it belongs to this participant
    if (
      remotePeerIdRef.current === participantId &&
      peerConnectionRef.current
    ) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      remotePeerIdRef.current = null;

      // Reset UI state
      setInCall(false);
      setMeetingStatus(MEETING_STATUS.DISCONNECTED);

      // Clear remote video
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [stream]);

  // useEffect to listen socket event 
  useEffect(() => {
    if (!socket || !socketIsConnected) {
      return;
    }

    // PeerConnection RTCPeerConnection (https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection)
    const createPeerConnection = () => {
      console.log("Creating peer connection");

      const peerConnection = new RTCPeerConnection(CONFIGURATION);
      peerConnectionRef.current = peerConnection;

      // Add local stream tracks to peer connection
      if (stream) {
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
      }

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        setRemoteStream(event.streams[0])
        setInCall(true);
        setMeetingStatus(MEETING_STATUS.CONNECTED);
      };

      // Handle ICE (Interactive Connectivity Establishment) candidates when connection is established
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && remotePeerIdRef.current) {
          console.log("Sending ICE candidate ", remotePeerIdRef.current);
          socket.emit("ice-candidate", {
            sender: localUsername,
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
          setMeetingStatus(MEETING_STATUS.CONNECTED);
        } else if (peerConnection.connectionState === "failed") {
          setMeetingStatus(MEETING_STATUS.FAILED);
          console.log("Connection failed");
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE Connection state:", peerConnection.iceConnectionState);
        if (peerConnection.iceConnectionState === "connected") {
          setInCall(true);
          setMeetingStatus(MEETING_STATUS.CONNECTED);
        }
      };

      return peerConnection;
    };

    const getOrCreatePeerConnection = () => {
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = createPeerConnection();
      }
      return peerConnectionRef.current;
    };

    const createOffer = async () => {
      try {
        console.log("Creating offer...");
        const peerConnection = getOrCreatePeerConnection();

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        console.log("Sending offer");
        socket.emit("offer", {
          sender: localUsername,
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
        const peerConnection = getOrCreatePeerConnection();

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        console.log("Sending answer");
        socket.emit("answer", {
          answer: peerConnection.localDescription,
          to: remotePeerIdRef.current,
          sender: localUsername,
        });
      } catch (error) {
        console.error("Error creating answer:", error);
      }
    };


    socket.on("user-joined", ({ userId, username }) => {
      console.log("User joined: ", { userId, username });
      remotePeerIdRef.current = userId;
      setRemoteUsername(username);
      setTimeout(() => createOffer(), 1000);

      toast.info(`${username} join to your room 👤`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: `${isDarkMode ? "dark" : "light" }`,
        });
    });

    socket.on("meeting-creted", ({ meeting }) => {
      console.log("Meeting Created succesfully: ", meeting);
      setInCall(false);
      setMeetingStatus(MEETING_STATUS.CREATED);

      toast.success('Room Created 🥳!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: `${isDarkMode ? "dark" : "light" }`,
        });
    });

    socket.on("offer", async ({ offer, from, sender }) => {
      console.log("Received offer from:", from);
      remotePeerIdRef.current = from;
      setRemoteUsername(sender)
      await createAnswer(offer);
    });

    socket.on("answer", async ({ answer, from, sender }) => {
      console.log("Received answer from:", from);
      setRemoteUsername(sender)
      remotePeerIdRef.current = from;

      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log("Remote description set successfully");
          setInCall(true);
          setMeetingStatus(MEETING_STATUS.CONNECTED);
        } catch (error) {
          console.error("Error setting remote description:", error);
        }
      }
    });

    socket.on("ice-candidate", async ({ candidate, from, sender }) => {
      console.log("Received ICE candidate from:", { from, sender });

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

    socket.on("participant-left", ({ participantId, participants, username }) => {
      console.log(
        "Participant left:",
        participantId,
        "Remaining:",
        participants
      );

      handleParticipantLeft(participantId);
      toast.info(`${username} Leave the Room 👋`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        });
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("meeting-creted");
      socket.off("participant-left");
    };
  }, [socket, socketIsConnected, stream, localUsername]);

  //useEffect to listen when remoteVideoRef is mounted  
  useEffect(() => {
    if(remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteVideoRef, remoteStream])


  const valuesProvider = {
    handleJoinRoom,
    handleParticipantLeft,
    roomId,
    setRoomId,
    localUsername,
    setLocalUsername,
    inCall,
    remoteUsername,
    meetingStatus,
    socketError,
    localVideoRef,
    remoteVideoRef,
    permissionsGranted,
    getMediaDevices,
    isVideoOff,
    isMuted,
    toggleAudio,
    toggleVideo,
    isDarkMode,
    setIsDarkMode
  }

  return <PeerContext.Provider value={valuesProvider}>
    {children}
  </PeerContext.Provider>
}
