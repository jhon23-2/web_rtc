export const MEETING_STATUS = {
  CREATED: "created",
  DISCONNECTED: "disconnected",
  CONNECTED: "connected",
  FAILED: "failed",
};

export const CONFIGURATION = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};