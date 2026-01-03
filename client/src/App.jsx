import React from "react";
import { useSocket } from "../hooks/useSocket";

export const App = () => {
  const { socket, isConnected, error } = useSocket();

  if (error) {
    return <div>Socket Connection Error {error}</div>;
  }

  return (
    <div>
      <h1>Web RTC Application</h1>
      {isConnected && <p>Socket is connected succesfully </p>}
    </div>
  );
};

export default App;
