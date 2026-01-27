import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePeerContext } from '../hooks/usePeerContext';

const PrivateRoute = ({children}) => {

  const {roomId, localUsername} = usePeerContext()

  const isAuthenticated = roomId && roomId.trim().length > 5 && 
  localUsername && localUsername.trim().length > 5;
  
  console.log({roomId,localUsername})

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
   
}


export default PrivateRoute