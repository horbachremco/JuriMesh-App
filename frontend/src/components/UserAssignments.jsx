import { useState, useEffect } from "react";
import { fetchUsers } from "../services/riskService";

export default function UserAssignments({ riskId, assignedUsers, onAssignUser, onUnassignUser }) {
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      const usersData = await fetchUsers();
      setUsers(usersData);
    }
    loadUsers();
  }, []);

  const assignedUserIds = assignedUsers.map(u => u.id);

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Assigned Users</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-colors w-fit"
        >
          {isOpen ? "Close" : "Manage Users"}
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {assignedUsers.length === 0 ? (
          <p className="text-sm text-gray-500">No users assigned</p>
        ) : (
          assignedUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm">{user.username}</span>
              <button
                onClick={() => onUnassignUser(user.id)}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {isOpen && (
        <div className="mt-4 border rounded p-4 bg-gray-50">
          <h4 className="text-sm font-medium mb-2">Available Users</h4>
          <div className="space-y-2">
            {users
              .filter(user => !assignedUserIds.includes(user.id))
              .map(user => (
                <div key={user.id} className="flex items-center justify-between bg-white p-2 rounded shadow-sm">
                  <span className="text-sm">{user.username}</span>
                  <button
                    onClick={() => {
                      onAssignUser(user.id);
                      setIsOpen(false);
                    }}
                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <p className="text-sm">Assign</p>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
} 