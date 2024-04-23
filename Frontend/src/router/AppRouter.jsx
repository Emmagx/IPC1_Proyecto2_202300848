import React from 'react'
import { Route, Routes } from "react-router-dom"
import Login from '../pages/Login/login'
import Register from '../pages/Register/register'
import AdminDashboard from '../pages/adminDashboard/adminDashboard'
export const AppRouter = () => {
  return (

      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/admin' element={<AdminDashboard/>}/>
        
        
    </Routes>
)
}
