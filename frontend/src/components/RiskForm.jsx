import { useState, useEffect } from "react";
import { addRisk, updateRisk } from "../services/riskService";

export default function RiskForm({ onRiskAdded, onClose, existingRisk, userId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [score, setScore] = useState(1);
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (existingRisk) {
      setTitle(existingRisk.title);
      setDescription(existingRisk.description || "");
      setScore(existingRisk.score);
      setCategory(existingRisk.category);
    }
  }, [existingRisk]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const riskData = {
      title,
      description,
      score: parseInt(score),
      category,
      user_id: userId
    };

    let savedRisk;
    if (existingRisk) {
      savedRisk = await updateRisk(existingRisk.id, riskData);
    } else {
      savedRisk = await addRisk(riskData);
    }

    if (savedRisk) {
      onRiskAdded(savedRisk);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Risk Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
        required
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
        rows={3}
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
        required
      >
        {!category && <option value="" disabled>Select a category</option>}
        <option value="Functionality">Functionality</option>
        <option value="Performance">Performance</option>
        <option value="Security">Security</option>
        <option value="Usability">Usability</option>
      </select>

      <input
        type="number"
        min="1"
        max="10"
        value={score}
        onChange={(e) => setScore(parseInt(e.target.value) || 1)}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
        required
      />

      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors"
        >
          {existingRisk ? "Update Risk" : "Add Risk"}
        </button>
      </div>
    </form>
  );
}
