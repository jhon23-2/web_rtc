import { useCallback, useEffect, useRef, useState } from "react"
import Peer from "simple-peer"

export const useSimplePeer = (socket, meetingId, localVideoRef, remoteVideoRef) => {
  const [isCallActive, setIsCallActive] = useState(false)
  const [localStream, setLocalStream] = useState(null)
  const [isVideoEnable, setIsVideoEnable] = useState(true)
  const [isAudioEnable, setIsAudioEnable] = useState(true)
  const [error, setError] = useState(null)

  const peerRef = useRef(null)

  // -> allow and Start local stream   
  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      return stream

    } catch (error) {
      console.log(error);
      alert("Could not access camera/microphone. please check and allow permissions")
    }
  }

  const createPeerAsInitiator = (stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    })

    // When signal is ready, send it to the backend webSocket service 

    peer.on("signal", (data) => {
      console.log("Sending offer signal")
      socket.emit("offer", {
        meetingId,
        offer: data,
        sender: socket.id
      })
    })

    // when connection is established

    peer.on("connect", () => {
      console.log("Peer connection is established")
      setIsCallActive(true)
    })

    // handle when remote stream answered and when is ready 

    peer.on("stream", (stream) => {
      console.log("Received remote stream")
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream
      }
    })

    //handle errors 

    peer.on("error", (error) => {
      console.log("Error Peer connection: ", error)
      setError(error)
    })

    peerRef.current = peer
    return peer
  }

  const createPeerAsReceiver = (stream, offerData) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    })

    // Signal the offer immediately
    peer.signal(offerData);

    // When signal is ready, send answer to backend
    peer.on('signal', (data) => {
      console.log('Sending answer signal');
      socket.emit('answer', {
        meetingId: meetingId,
        answer: data,
        sender: socket.id,
      });
    });


    // When connection is established
    peer.on('connect', () => {
      console.log('Peer connection established');
      setIsCallActive(true);
    });


    // Handle remote stream
    peer.on('stream', (stream) => {
      console.log('Received remote stream');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });


    // Handle errors
    peer.on('error', (error) => {
      console.error('Peer error:', error);
      setError(error)
    });

    peerRef.current = peer;
    return peer;

  }


  // Handle incoming answer (for initiator)

  const handleAnswer = (answerData) => {
    if (peerRef.current) {
      console.log("Received answer, signaling peer")
      peerRef.current.signal(answerData)
    }
  }

  // toggle audio and video 

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnable
        setIsAudioEnable(!isAudioEnable)
      }
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnable
        setIsVideoEnable(!isVideoEnable)
      }
    }
  }

  // Clean up -> test it out this function below 

  const cleanUp = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (peerRef.current) {
      peerRef.current.destroy()
      peerRef.current = null
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsCallActive(false)
  }, [localStream, localVideoRef, remoteVideoRef])

  useEffect(() => {
    return () => {
      cleanUp()
    }
  }, [cleanUp])

  return {
    startLocalStream,
    createPeerAsInitiator,
    createPeerAsReceiver,
    handleAnswer,
    toggleAudio,
    toggleVideo,
    cleanUp,
    localStream,
    isVideoEnable,
    isAudioEnable,
    isCallActive,
    error
  }
}
