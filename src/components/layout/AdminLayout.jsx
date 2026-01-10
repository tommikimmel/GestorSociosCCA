import { useState } from "react";
import Sidebar from "../layout/Sidebar";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Contenido */}
      <main 
        className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 transition-all duration-300"
        style={{
          marginLeft: window.innerWidth >= 1024 && isSidebarOpen ? '256px' : '0px'
        }}
      >
        {children}
      </main>
    </div>
  );
}
