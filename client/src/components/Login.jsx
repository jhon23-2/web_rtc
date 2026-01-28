import React from 'react'
import { usePeerContext } from '../hooks/usePeerContext'

 const Login = () => {

  const {roomId, setRoomId, localUsername, setLocalUsername, handleJoinRoom} = usePeerContext()

  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col">
      <h1 className="font-bold text-4xl">Web RTC Application</h1>
       <section className="mt-12 gap-3.5 border w-1/2 h-1/3 flex flex-col justify-center items-center">
        <div>
          <label className="font-semibold text-gray-500 mr-3.5">
            Room id: 
            <input type="text" 
              value={roomId} 
              onChange={(e) => {setRoomId(e.target.value)}} 
              placeholder='type room id' 
              required
              className='border border-black rounded ml-2.5 pl-2.5'
            />
          </label>
        </div>

        <div>
          <label className="font-semibold text-gray-500 mr-7">
            Username:
            <input type="text"
              value={localUsername}
              onChange={(e) => {setLocalUsername(e.target.value)}} 
              placeholder='type your username'
              required
              className='border border-black rounded ml-2.5 pl-2.5'
            />
          </label>
        </div>

        <button onClick={handleJoinRoom} className='border w-1/5 mt-12 cursor-pointer'>
          Join
        </button>
       </section>
    </div>
  )
}


export default Login