import React from 'react'
import { usePeerContext } from '../hooks/usePeerContext'

 const Login = () => {

  const {roomId, setRoomId, localUsername, setLocalUsername, handleJoinRoom} = usePeerContext()

  return (
    <div>
      <h1>Web RTC Application</h1>
       <section>
        <div>
          <label>
            Room id: 
            <input type="text" 
              value={roomId} 
              onChange={(e) => {setRoomId(e.target.value)}} 
              placeholder='type room id' 
            />
          </label>
        </div>

        <div>
          <label>
            Username:
            <input type="text"
            value={localUsername}
            onChange={(e) => {setLocalUsername(e.target.value)}} 
            placeholder='type your username'/>
          </label>
        </div>

        <button onClick={handleJoinRoom}>
          Join
        </button>
       </section>
    </div>
  )
}


export default Login