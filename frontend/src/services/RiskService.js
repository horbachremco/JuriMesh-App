const API_URL = "http://localhost:3000";

export async function fetchUsers() {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return await response.json();
  } catch {
    return [];
  }
}

export async function fetchRisks() {
  try {
    const response = await fetch(`${API_URL}/risks`);
    if (!response.ok) throw new Error("Failed to fetch risks");
    return await response.json();
  } catch {
    return [];
  }
}

export async function addRisk(risk) {
  try {
    const response = await fetch(`${API_URL}/risks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(risk),
    });
    if (!response.ok) throw new Error("Failed to add risk");
    return await response.json();
  } catch {
    return null;
  }
}

export async function updateRisk(id, updatedRisk) {
  try {
    const response = await fetch(`${API_URL}/risks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedRisk),
    });
    if (!response.ok) throw new Error("Failed to update risk");
    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function deleteRisk(id) {
  try {
    const response = await fetch(`${API_URL}/risks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete risk");
    return true;
  } catch (error) {
    return false;
  }
}

export async function fetchComments(riskId) {
  try {
    const response = await fetch(`${API_URL}/risks/${riskId}/comments`);
    if (!response.ok) throw new Error("Failed to fetch comments");
    return await response.json();
  } catch (error) {
    return [];
  }
}

export async function addComment(riskId, userId, comment) {
  try {
    const response = await fetch(`${API_URL}/risks/${riskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, comment }),
    });
    if (!response.ok) throw new Error("Failed to add comment");
    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function deleteComment(riskId, commentId) {
  try {
    const response = await fetch(`${API_URL}/risks/${riskId}/comments/${commentId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete comment");
    return true;
  } catch (error) {
    return false;
  }
}

export async function fetchAssignedUsers(riskId) {
  try {
    const response = await fetch(`${API_URL}/risks/${riskId}/assignments`);
    if (!response.ok) throw new Error("Failed to fetch assigned users");
    return await response.json();
  } catch (error) {
    return [];
  }
}

export async function assignUser(riskId, userId) {
  try {
    const response = await fetch(`${API_URL}/risks/${riskId}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!response.ok) throw new Error("Failed to assign user");
    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function unassignUser(riskId, userId) {
  try {
    const response = await fetch(`${API_URL}/risks/${riskId}/assignments/${userId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to unassign user");
    return true;
  } catch (error) {
    return false;
  }
}
