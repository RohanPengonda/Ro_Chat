const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

export async function fetchUsers(loggedInUserId) {
  const token = getToken();
  const resUser = await fetch(`${API_URL}/api/users?exclude=${loggedInUserId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return resUser.json();
}

export async function fetchSelf(loggedInUserId) {
  const token = getToken();
  const resSelf = await fetch(`${API_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const allUsers = await resSelf.json();
  return allUsers.find((u) => u._id === loggedInUserId);
}

export async function fetchConversations(userId) {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/conversations?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchOrCreateConversation(userIds) {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userIds }),
  });
  return res.json();
}

export async function fetchMessages(conversationId) {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/messages?conversationId=${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function sendMessage(conversationId, senderId, text) {
  const token = getToken();
  return fetch(`${API_URL}/api/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId, senderId, text }),
  });
}

export async function deleteConversation(conversationId) {
  const token = getToken();
  return fetch(`${API_URL}/api/conversations/${conversationId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function markMessagesAsRead(conversationId, userId) {
  const token = getToken();
  return fetch(`${API_URL}/api/messages/read`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId, userId }),
  });
}

export async function getUnreadCounts(userId) {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/messages/unread-counts?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function updateUserProfile(userId, data) {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteUser(userId) {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
} 