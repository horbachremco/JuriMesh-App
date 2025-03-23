import { useState, useEffect } from "react";
import RiskComments from "./RiskComments";
import UserAssignments from "./UserAssignments";
import { fetchAssignedUsers, assignUser, unassignUser } from "../services/riskService";

function getRiskLevel(score) {
  if (score >= 7) return { level: "High", color: "text-red-600 bg-red-100" };
  if (score >= 4) return { level: "Moderate", color: "text-yellow-600 bg-yellow-100" };
  return { level: "Low", color: "text-green-600 bg-green-100" };
}

export default function RiskDetails({ risk, userId, onSelectRisk }) {
  const [assignedUsers, setAssignedUsers] = useState([]);

  useEffect(() => {
    async function loadAssignedUsers() {
      if (risk) {
        const users = await fetchAssignedUsers(risk.id);
        setAssignedUsers(users);
      }
    }
    loadAssignedUsers();
  }, [risk]);

  if (!risk) return <p className="text-gray-500">Select a risk to view details.</p>;

  const riskLevel = getRiskLevel(risk.score);

  const handleAssignUser = async (newUserId) => {
    const result = await assignUser(risk.id, newUserId);
    if (result) {
      const users = await fetchAssignedUsers(risk.id);
      setAssignedUsers(users);
    }
  };

  const handleUnassignUser = async (userIdToRemove) => {
    const result = await unassignUser(risk.id, userIdToRemove);
    if (result) {
      const users = await fetchAssignedUsers(risk.id);
      setAssignedUsers(users);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{risk.title}</h2>
      <p className="mb-1 text-sm text-gray-700">{risk.description}</p>
      <div className="space-y-2 mb-4">
        <p className="text-sm">
          <span className={`px-2 py-1 rounded-full ${riskLevel.color} font-medium`}>
            {riskLevel.level} Risk
          </span>
        </p>
      </div>

      <UserAssignments
        riskId={risk.id}
        assignedUsers={assignedUsers}
        onAssignUser={handleAssignUser}
        onUnassignUser={handleUnassignUser}
      />

      <RiskComments riskId={risk.id} userId={userId} />
    </div>
  );
}
