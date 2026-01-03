import React, { useEffect, useState } from "react";
import { MeetingForm } from "../components/MeetingForm";
import { useSocket } from "../hooks/useSocket";

export const App = () => {
  const {
    socket,
    isConnected,
    error: socketError,
  } = useSocket("http://localhost:3000");

  const [currentMeetting, setCurrentMeetting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Listen when meetting is created
    socket.on("meeting-created", ({ meeting }) => {
      console.log("Meetting Created");
      setCurrentMeetting(meeting);
      setParticipants(meeting.participants || []);
      setError(null);
    });

    // Listen when meetting is joined

    socket.on("meeting-joined", ({ meeting }) => {
      console.log("Meetting joined");
      setCurrentMeetting(meeting);
      setParticipants(meeting.participants || []);
      setError(null);
    });

    // When someone joined to the call

    socket.on("participant-joined", ({ participants }) => {
      console.log("participant joined: ", participants);
      setParticipants(participants || []);
    });

    // when someone left the call or meetting

    socket.on("participant-left", ({ participantId }) => {
      console.log("Participant left:", participantId);
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    });

    // when Meeting is not found

    socket.on("meeting-not-found", () => {
      setError("Meeting not found please provide valid meetting id");
    });

    return () => {
      socket.off("meeting-created");
      socket.off("meeting-joined");
      socket.off("participant-joined");
      socket.off("participant-left");
      socket.off("meeting-not-found");
      socket.off("meeting-expired");
    };
  }, [socket]);

  const handleCreateMeetting = (data) => {
    if (socket) {
      socket.emit("create-meeting", data);
    }
  };

  const handleJoinMeeting = (data) => {
    if (socket) {
      socket.emit("join-meeting", data);
    }
  };

  // when everybody leave the meeting

  const handleLeaveMeetting = () => {
    setCurrentMeetting(null);
    setParticipants([]);
    setError(null);
  };

  return (
    <div className="App">
      {!currentMeetting ? (
        <div>
          <MeetingForm
            onCreateMeeting={handleCreateMeetting}
            onJoinMeeting={handleJoinMeeting}
            isConnectedSocket={isConnected}
            isErrorSocket={socketError}
          />
          {error && (
            <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
              {error}
              <button onClick={() => setError(null)} className="ml-4 font-bold">
                ×
              </button>
            </div>
          )}
        </div>
      ) : (
        <VideoCall
          socket={socket}
          meetingId={currentMeetting.id}
          participants={participants}
          onLeave={handleLeaveMeetting}
        />
      )}
    </div>
  );
};

export default App;
