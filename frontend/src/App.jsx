import { useState } from "react";
import Sidebar from "./components/Sidebar";
import RiskList from "./components/RiskList";
import RiskDetails from "./components/RiskDetails";
import UserSelector from "./components/UserSelector";

export default function App() {
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(1);

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
  };

  const handleRiskSelect = (risk) => {
    setSelectedRisk(risk);
  };

  return (
    <div className="grid grid-cols-4 h-screen gap-4 bg-gray-100 text-gray-800">
      <aside className="col-span-1 bg-white p-4 shadow-sm">
        <Sidebar />
      </aside>

      <main className="col-span-2 p-4 flex flex-col gap-4 overflow-auto">
        <div className="flex justify-end">
          <UserSelector onUserSelect={handleUserSelect} />
        </div>

        <RiskList
          onSelectRisk={handleRiskSelect}
          selectedRisk={selectedRisk}
          userId={selectedUserId}
        />
      </main>

      <section className="col-span-1 bg-white p-6 overflow-auto shadow-sm">
        {selectedRisk ? (
          <RiskDetails risk={selectedRisk} userId={selectedUserId} />
        ) : (
          <div className="text-gray-500 italic">
            Select a risk to view details
          </div>
        )}
      </section>
    </div>
  );
}
