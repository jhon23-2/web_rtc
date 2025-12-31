# WebRTC Integration Guide

This guide explains how the WebRTC signaling is integrated into the React frontend application.

## Overview

The application uses **WebRTC** (Web Real-Time Communication) for peer-to-peer video/audio streaming between users. WebRTC requires a signaling mechanism to exchange connection information, which is handled through **Socket.IO**.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client 1  │◄───────►│ Socket Server│◄───────►│  Client 2   │
│  (React)    │         │  (Node.js)   │         │  (React)    │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                        │
      │                        │                        │
      └────────────────────────┴────────────────────────┘
                    WebRTC Peer Connection
              (Direct video/audio streaming)
```

## How It Works

### 1. Socket.IO Connection (`useSocket.js`)

The `useSocket` hook establishes a connection to your Socket.IO server:

```javascript
const { socket, isConnected } = useSocket("http://localhost:5001");
```

- Connects to the server on port 5001
- Manages connection state
- Provides the socket instance for emitting/receiving events

### 2. WebRTC Hook (`useWebRTC.js`)

The `useWebRTC` hook handles all WebRTC peer connection logic:

#### Key Functions:

- **`startLocalStream()`**: Requests access to user's camera and microphone
- **`createPeerConnection()`**: Creates an RTCPeerConnection with STUN servers
- **`createOffer()`**: Creates and sends a WebRTC offer (initiator)
- **`handleOffer()`**: Receives offer and creates an answer (receiver)
- **`handleAnswer()`**: Receives and sets the answer
- **`handleIceCandidate()`**: Handles ICE candidates for network connectivity

### 3. Signaling Flow (Lines 103-116 in `index.js`)

The server handles three critical WebRTC signaling events:

#### **Offer** (Initiator → Receiver)

```javascript
socket.on("offer", (data) => {
  const { meetingId, offer, sender } = data;
  socket.to(meetingId).emit("offer", { offer, sender });
});
```

**What happens:**

1. Client A creates a WebRTC offer
2. Client A emits `offer` event to server
3. Server forwards offer to Client B in the same meeting room
4. Client B receives offer and creates an answer

#### **Answer** (Receiver → Initiator)

```javascript
socket.on("answer", (data) => {
  const { meetingId, answer, sender } = data;
  socket.to(meetingId).emit("answer", { answer, sender });
});
```

**What happens:**

1. Client B creates an answer to the offer
2. Client B emits `answer` event to server
3. Server forwards answer back to Client A
4. Client A sets the answer, establishing connection

#### **ICE Candidates** (Both ways)

```javascript
socket.on("ice-candidate", (data) => {
  const { meetingId, candidate, sender } = data;
  socket.to(meetingId).emit("ice-candidate", { candidate, sender });
});
```

**What happens:**

1. Each client discovers network information (ICE candidates)
2. Clients exchange ICE candidates through the server
3. This helps establish the best network path for peer-to-peer connection

## Integration in React Components

### VideoCall Component

The `VideoCall` component integrates everything:

1. **Initialization**: Requests camera/microphone access
2. **Socket Listeners**: Listens for `offer`, `answer`, and `ice-candidate` events
3. **Auto-start**: Automatically initiates call when 2+ participants join
4. **UI**: Displays local and remote video streams

### Complete Flow Example

```
1. User A creates meeting → Server creates meeting room
2. User A joins meeting → Added to participants
3. User B joins meeting → Server emits 'participant-joined'
4. User A receives event → Creates WebRTC offer
5. Server forwards offer → User B receives offer
6. User B creates answer → Server forwards answer to User A
7. Both exchange ICE candidates → Direct peer connection established
8. Video/audio streams flow directly between clients (peer-to-peer)
```

## Key Concepts

### STUN Servers

- Used to discover public IP addresses
- Google's public STUN servers are used (free, no setup required)
- For production, consider using TURN servers for better connectivity

### Peer Connection States

- `new`: Initial state
- `connecting`: Establishing connection
- `connected`: Connection established
- `disconnected`: Connection lost
- `failed`: Connection failed

### Media Tracks

- Video tracks: Camera stream
- Audio tracks: Microphone stream
- Can be enabled/disabled independently

## Testing

1. **Start the server**: `npm start` (from root directory)
2. **Start the client**: `cd client && npm run dev`
3. **Open two browser windows**:
   - Window 1: Create a meeting
   - Window 2: Join with the meeting ID
4. **Allow camera/microphone permissions** in both windows
5. **Video should appear** in both windows!

## Troubleshooting

- **No video**: Check browser permissions for camera/microphone
- **Connection fails**: Check firewall settings, try different network
- **Audio issues**: Check browser audio settings
- **ICE candidates failing**: May need TURN servers for NAT traversal

## Next Steps

- Add screen sharing functionality
- Implement chat alongside video
- Add recording capabilities
- Use TURN servers for better connectivity
- Add connection quality indicators
