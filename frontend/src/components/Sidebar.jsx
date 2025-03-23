import { FiHome, FiFileText, FiMessageSquare, FiAlertTriangle, FiBarChart2, FiSettings } from "react-icons/fi";

export default function Sidebar() {
  return (
    <div className="h-full w-64 bg-white p-6 flex flex-col">

      <nav className="flex-1 space-y-4">
        <SidebarItem icon={FiHome} text="Start analysis" />
        <SidebarItem icon={FiFileText} text="Documents" />
        <SidebarItem icon={FiMessageSquare} text="Chat" />
        <SidebarItem icon={FiAlertTriangle} text="Risks" active />
        <SidebarItem icon={FiBarChart2} text="Analysis results" />
      </nav>
      <SidebarItem icon={FiSettings} text="Settings" />
    </div>
  );
}

function SidebarItem({ icon: Icon, text, active }) {
  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg ${active ? "bg-gray-200 font-semibold" : "hover:bg-gray-100 cursor-pointer"}`}>
      <Icon size={20} className="text-gray-600" />
      <span className="text-gray-700">{text}</span>
    </div>
  );
}
