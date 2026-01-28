import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../components/Login'
import VideoPlayer from '../components/VideoPlayer'
import PrivateRoute from './PrivateRoute'

const RoutesComponent = () => {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/call-end" element={<div className="w-screen h-screen justify-center items-center text-3xl font-semibold text-amber-600">Call Ended Thanks for use our Web RTC Application</div>} />
        <Route 
          path="/meeting" 
          element={
          <PrivateRoute> 
            <VideoPlayer /> 
          </PrivateRoute>} 
        />

        <Route path="*" element={<h1 className="w-screen h-screen flex flex-col justify-center items-center relative font-bold text-red-500 text-3xl">404 - Page Not Found</h1>} />
      </Routes>
  )
}

export default RoutesComponent
