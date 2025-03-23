import { useState, useEffect } from "react";
import { FiEdit, FiTrash } from "react-icons/fi";
import RiskForm from "./RiskForm";
import RiskModal from "./RiskModal";
import { fetchRisks, addRisk, updateRisk, deleteRisk } from "../services/riskService";

export default function RiskList({ onSelectRisk, userId, selectedRisk, onRisksUpdated }) {
  const [risks, setRisks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);
  const [showOnlyMyRisks, setShowOnlyMyRisks] = useState(false);

  useEffect(() => {
    loadRisks();
  }, [userId]);

  const loadRisks = async () => {
    const risksData = await fetchRisks();
    setRisks(risksData);
    onRisksUpdated?.();
  };

  const handleRiskAddedOrUpdated = async (risk) => {
    try {
      await loadRisks();
      
      if (editingRisk) {
        const updatedRisk = await fetchRisks().then(risks => 
          risks.find(r => r.id === editingRisk.id)
        );
        if (updatedRisk) {
          onSelectRisk(updatedRisk);
        }
      }
      
      onRisksUpdated?.();
    } catch {
      // Error handled by service layer
    } finally {
      setIsModalOpen(false);
      setEditingRisk(null);
    }
  };
  
  const handleEditClick = (risk) => {
    setEditingRisk(risk);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this risk?")) return;
    await deleteRisk(id);
    await loadRisks();
    
    if (selectedRisk?.id === id) {
      onSelectRisk(null);
    }
    
    onRisksUpdated?.();
  };

  const filteredRisks = showOnlyMyRisks 
    ? risks.filter(risk => {
        const assignments = risk.assigned_user_ids || [];
        return assignments.some(id => Number(id) === userId);
      })
    : risks;

  return (
    <div className="bg-white p-4 rounded-lg shadow w-full h-full space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-bold text-gray-800 leading-none">
          Risks
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnlyMyRisks(!showOnlyMyRisks)}
            className={`text-sm px-3 py-1.5 rounded transition-colors ${
              showOnlyMyRisks
                ? 'bg-gray-200 text-gray-800'
                : 'bg-gray-600 hover:bg-gray-700 text-white transition-colors '
            }`}
          >
            My Risks
          </button>
          <button
            onClick={() => {
              setEditingRisk(null);
              setIsModalOpen(true);
            }}
            className="text-white px-3 py-1.5 rounded bg-gray-600 hover:bg-gray-700 transition-colors text-sm"
          >
            Add Risk
          </button>
        </div>
      </div>

      <RiskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <RiskForm
          onRiskAdded={handleRiskAddedOrUpdated}
          existingRisk={editingRisk}
          userId={userId}
          onClose={() => setIsModalOpen(false)}
        />
      </RiskModal>

      <table className="w-full border-collapse">
        <tbody>
          {filteredRisks.length === 0 ? (
            <tr>
              <td className="text-gray-500 p-2 text-center text-sm" colSpan="3">
                {showOnlyMyRisks ? "No risks assigned to you." : "No risks found."}
              </td>
            </tr>
          ) : (
            filteredRisks.map((risk) => (
              <tr
                key={risk.id}
                className={`cursor-pointer border border-gray-200 rounded-lg my-1.5 flex items-center transition-colors 
                  ${selectedRisk?.id === risk.id ? 'bg-gray-200 border-gray-300' : 'bg-gray-50 hover:bg-gray-100'}`}
                onClick={(e) => {
                  if (!e.target.closest("button")) {
                    onSelectRisk(risk);
                  }
                }}
              >
                <td className="flex items-center py-1 px-2 space-x-2 w-full">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${getRiskColor(
                      risk.score
                    )}`}
                  />
                  <span className="text-sm">{risk.title}</span>
                </td>
                <td className="py-0.5 px-2 text-gray-700 text-xs text-right w-1/4">
                  <span className="bg-sky-200 text-sky-700 px-2 py-0.5 rounded-full">
                    {risk.category}
                  </span>
                </td>
                <td className="text-right flex items-center justify-end space-x-1.5 py-0.5 px-1.5">
                  <button
                    onClick={() => handleEditClick(risk)}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <FiEdit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(risk.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FiTrash size={14} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function getRiskColor(score) {
  if (score >= 7) return "bg-red-500";
  if (score >= 4) return "bg-yellow-500";
  return "bg-green-500";
}
