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
import PoseDetectionPage from './pages/PoseDetectionPage'
import TextDetection from './pages/TextDetection'
import ImageClassification from './pages/ImageClassification'
import TextDetectionDashboard from './pages/TextDetectionDashboard'
import TextSessionData from './pages/TextSessionData'
import ImageClassificationDashboard from './pages/ImageClassificationDashboard'
import ImageClassificationSession from './pages/ImageClassificationSession'
import FaceLandmark from './pages/FaceLandmark'
import FaceLandmarkDashboard from './pages/FaceLandmarkDashboard'
import FaceLandmarkSession from './pages/FaceLandmarkSession'
import SettingsPage from './pages/SettingsPage'

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
         path:"/face-landmark",
         element:<FaceLandmark/>
      },
      {
         path:"/face-landmark-dashboard",
         element:<FaceLandmarkDashboard/>
      },
      {
         path:"/face-landmark-session/:id",
         element:<FaceLandmarkSession/>
      },
      {
        path:"/hand-tracking",
        element:<HandTrackingPage />
      },
      {
        path:"/pose-detection",
        element:<PoseDetectionPage />
      },
      {
        path:"/text-detection",
        element:<TextDetection />
      },
      {
        path:"/image-classification",
        element:<ImageClassification />
      },
      {
        path:"/dashboard",
        element:<SessionsDashboard/>
      },
      {
        path:"/session/:id",
        element:<SessionData/>
      },
      {
        path:"/text-dashboard",
        element:<TextDetectionDashboard/>
      },
      {
        path:"/text-session/:id",
        element:<TextSessionData/>
      },
      {
        path:"/image-dashboard",
        element:<ImageClassificationDashboard/>
      },
      {
        path:"/image-session/:id",
        element:<ImageClassificationSession/>
      },
      {
        path:"/settings",
        element:<SettingsPage/>
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