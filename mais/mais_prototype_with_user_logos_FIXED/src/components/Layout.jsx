
import React, {useState} from 'react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

export default function Layout({children}){
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="app-shell">
      <Sidebar/>
      <Topbar onToggleSidebar={() => setSidebarOpen(s => !s)}/>
      <main className="main">{children}</main>
    </div>
  )
}
