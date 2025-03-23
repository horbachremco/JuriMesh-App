import { useEffect, useState } from "react";
import { fetchComments, addComment, fetchUsers, deleteComment } from "../services/riskService";

export default function RiskComments({ riskId, userId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function loadUsers() {
      const usersData = await fetchUsers();
      setUsers(usersData);
    }
    loadUsers();
  }, []);

  useEffect(() => {
    async function loadComments() {
      if (!riskId) return;
      const commentsData = await fetchComments(riskId);
      setComments(commentsData);
      setLoading(false);
    }
    loadComments();
  }, [riskId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const user = users.find((u) => u.id === userId);
    const username = user ? user.username : "Unknown User";

    const added = await addComment(riskId, userId, newComment);
    if (added) {
      setComments([...comments, { ...added, username }]);
      setNewComment("");
    }
  };

  return (
    <div className="mt-6 pt-4">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>

      {loading ? (
        <p className="text-sm text-gray-500">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="relative bg-gray-100 p-3 rounded-md">
              {c.user_id === userId && (
                <button
                  onClick={async () => {
                    const ok = await deleteComment(riskId, c.id);
                    if (ok)
                      setComments(
                        comments.filter((comment) => comment.id !== c.id)
                      );
                  }}
                  className="absolute top-1 right-2 text-sm text-gray-400 hover:text-red-500"
                  title="Delete comment"
                >
                  ✕
                </button>
              )}

              <div className="text-sm text-gray-700 font-medium">
                {c.username || "Anonymous"}
              </div>
              <div className="text-sm text-gray-800">{c.comment}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Intl.DateTimeFormat('nl-BE', {
                  timeZone: 'Europe/Brussels',
                  dateStyle: 'short',
                  timeStyle: 'medium',
                  hour12: false
                }).format(new Date(c.created_at))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddComment} className="mt-4 space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full border rounded p-2 text-sm"
          rows={3}
        />
        <button
          type="submit"
          className="bg-gray-600 text-white px-4 py-2 text-sm rounded hover:bg-gray-700 transition-colors"
        >
          Post comment
        </button>
      </form>
    </div>
  );
}
