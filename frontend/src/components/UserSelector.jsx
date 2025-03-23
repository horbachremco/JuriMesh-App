import { useState, useEffect } from "react";


export default function UserSelector({ onUserSelect }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(1);
  useEffect(() => {
    fetch("http://localhost:3000/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const handleChange = (e) => {
    const userId = parseInt(e.target.value);
    setSelected(userId);
    onUserSelect(userId);
  };

  return (
    <div className="mb-4">
      <select
        value={selected}
        onChange={handleChange}
        className="p-2 border rounded w-full text-sm"
      >
        <option value="">Choose a user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </select>
    </div>
  );
}
