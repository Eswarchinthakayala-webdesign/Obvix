import { useState } from 'react'

import './App.css'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import AppLayout from './layout/app-layout'
import LandingPage from './pages/LandingPage'
import DocumentationPage from './pages/DocumentationPage'
import StartDetectionPage from './pages/StartDetectionPage'
import SessionsDashboard from './pages/SessionsDashboard'
import SessionData from './pages/SessionData'
import FaceDetectionPage from './pages/FaceDetectionPage'
import HandTrackingPage from './pages/HandTrackingPage'


const router=createBrowserRouter([
  {

    element:<AppLayout/>,
    children:[
      {
        path:"/",
        element:<LandingPage/>
      },
      {
        path:"/docs",
        element:<DocumentationPage/>
      },
      {
        path:"/start-detection",
        element:<StartDetectionPage/>
      },
      {
        path:"/face-detection",
        element:<FaceDetectionPage />
      },
      {
        path:"/hand-tracking",
        element:<HandTrackingPage />
      },
      {
        path:"/dashboard",
        element:<SessionsDashboard/>
      },
      {
        path:"/session/:id",
        element:<SessionData/>
      }
      ]

  }


])

function App() {
  
  return (
   <RouterProvider router={router}/>
  )
}

export default App