import { useState } from 'react'

import './App.css'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import AppLayout from './layout/app-layout'
import LandingPage from './pages/LandingPage'
import DocumentationPage from './pages/DocumentationPage'



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
      ]

  }


])

function App() {
  
  return (
   <RouterProvider router={router}/>
  )
}

export default App