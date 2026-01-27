import React from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import Header from '../components/Header'

const AppLayout = () => {

  return (
    <div>
        <Header />
        
        <main className='min-h-screen max-w-8xl bg-black mx-auto'>
       
            <Toaster position="bottom-right" />
         
         <Outlet/>

        </main>

    </div>
  )
}

export default AppLayout