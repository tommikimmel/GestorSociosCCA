import { useState } from "react";
import Sidebar from "../layout/Sidebar";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Contenido */}
      <main 
        className="w-full min-h-screen bg-gray-50 p-6 transition-all duration-300"
        style={{
          marginLeft: isSidebarOpen ? '256px' : '0px'
        }}
      >
        {children}
      </main>
    </div>
  );
}
