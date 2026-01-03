import { useState } from "react";

/**
 * Component for creating or joining meetings
 */
export const MeetingForm = ({
  onCreateMeeting,
  onJoinMeeting,
  isConnectedSocket,
  isErrorSocket,
}) => {
  const [meetingId, setMeetingId] = useState("");
  const [userName, setUserName] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [mode, setMode] = useState("create"); // 'create' or 'join'

  const handleCreate = (e) => {
    e.preventDefault();
    if (!userName.trim() || !scheduledTime) {
      alert("Please fill in all fields");
      return;
    }
    onCreateMeeting({ creatorName: userName, scheduledTime });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!meetingId.trim() || !userName.trim()) {
      alert("Please fill in all fields");
      return;
    }
    onJoinMeeting({ meetingId: meetingId.trim().toUpperCase(), userName });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          WebRTC Meeting
        </h1>

        {/* Connection Status */}
        <div className="mb-6">
          <div
            className={`flex items-center gap-2 ${
              isConnectedSocket ? "text-green-600" : "text-red-600"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full ${
                isConnectedSocket ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm font-medium">
              {isConnectedSocket
                ? "Connected"
                : "Disconnected " + isErrorSocket}
            </span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setMode("create")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              mode === "create"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Create Meeting
          </button>
          <button
            onClick={() => setMode("join")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              mode === "join"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Join Meeting
          </button>
        </div>

        {/* Create Meeting Form */}
        {mode === "create" && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                required
                disabled={!isConnectedSocket}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Time
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!isConnectedSocket}
              />
            </div>
            <button
              type="submit"
              disabled={!isConnectedSocket}
              className="w-full  bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Create Meeting
            </button>
          </form>
        )}

        {/* Join Meeting Form */}
        {mode === "join" && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting ID
              </label>
              <input
                type="text"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="Enter meeting ID"
                required
                disabled={!isConnectedSocket}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                required
                disabled={!isConnectedSocket}
              />
            </div>
            <button
              type="submit"
              disabled={!isConnectedSocket}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Join Meeting
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
