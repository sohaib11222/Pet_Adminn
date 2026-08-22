import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Header from "../Header";
import Sidebar from "../Sidebar";
import { apiRequest, getApiBaseUrl, getCurrentUser } from "../../api/client";

const avatarInitial = (person) =>
  String(person?.name || person?.fullName || person?.email || "D")
    .trim()
    .charAt(0)
    .toUpperCase();

const displayName = (person) =>
  person?.name || person?.fullName || person?.email || "Veterinarian";

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isImage = (attachment) => {
  if (String(attachment?.mimeType || "").startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(
    String(attachment?.url || "")
  );
};

const AdminDoctorChat = () => {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const currentUserId = currentUser?._id || currentUser?.id;
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const publicBaseUrl = useMemo(
    () => apiBaseUrl.replace(/\/api\/?$/, ""),
    [apiBaseUrl]
  );

  const [conversations, setConversations] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const toFileUrl = useCallback(
    (value) => {
      if (!value) return "";
      const path = String(value);
      if (/^https?:\/\//i.test(path)) return path;
      if (path.startsWith("/uploads/")) {
        return `${apiBaseUrl}/uploads/${path.slice("/uploads/".length)}`;
      }
      return path.startsWith("/") ? `${publicBaseUrl}${path}` : `${publicBaseUrl}/${path}`;
    },
    [apiBaseUrl, publicBaseUrl]
  );

  const loadConversations = useCallback(
    async (silent = false) => {
      if (!silent) setLoadingConversations(true);
      try {
        const response = await apiRequest("/chat/conversations", {
          params: { page: 1, limit: 100 },
        });
        const list = response?.data?.conversations || [];
        const adminConversations = list.filter(
          (conversation) =>
            conversation?.conversationType === "ADMIN_VETERINARIAN"
        );
        setConversations(adminConversations);
        setSelectedConversationId((current) => {
          if (
            current &&
            adminConversations.some(
              (conversation) => String(conversation?._id) === String(current)
            )
          ) {
            return current;
          }
          return adminConversations[0]?._id || "";
        });
      } catch (requestError) {
        if (!silent) {
          setError(requestError?.message || "Unable to load admin messages.");
        }
      } finally {
        if (!silent) setLoadingConversations(false);
      }
    },
    []
  );

  const loadVeterinarians = useCallback(async () => {
    try {
      const response = await apiRequest("/users/veterinarians", {
        params: { page: 1, limit: 100, status: "APPROVED" },
      });
      setVeterinarians(response?.data?.veterinarians || []);
    } catch {
      // Conversation history remains usable if the picker request is unavailable.
    }
  }, []);

  const loadMessages = useCallback(async (conversationId, silent = false) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    if (!silent) setLoadingMessages(true);
    try {
      const response = await apiRequest(`/chat/messages/${conversationId}`, {
        params: { page: 1, limit: 100 },
      });
      setMessages(response?.data?.messages || []);
    } catch (requestError) {
      if (!silent) {
        setError(requestError?.message || "Unable to load messages.");
      }
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    loadVeterinarians();
    const intervalId = window.setInterval(() => loadConversations(true), 5000);
    return () => window.clearInterval(intervalId);
  }, [loadConversations, loadVeterinarians]);

  useEffect(() => {
    loadMessages(selectedConversationId);
    if (!selectedConversationId) return undefined;
    const intervalId = window.setInterval(
      () => loadMessages(selectedConversationId, true),
      2500
    );
    return () => window.clearInterval(intervalId);
  }, [loadMessages, selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) return;
    const selected = conversations.find(
      (conversation) =>
        String(conversation?._id) === String(selectedConversationId)
    );
    if (!selected?.unreadCount) return;

    apiRequest(`/chat/conversations/${selectedConversationId}/read`, {
      method: "POST",
      body: {},
    })
      .then(() => loadConversations(true))
      .catch(() => {});
  }, [conversations, loadConversations, selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const selectedConversation = conversations.find(
    (conversation) =>
      String(conversation?._id) === String(selectedConversationId)
  );

  const startConversation = async (veterinarianId) => {
    if (!veterinarianId) return;
    setStartingConversation(true);
    setError("");
    try {
      const response = await apiRequest("/chat/conversation", {
        method: "POST",
        body: { veterinarianId },
      });
      const conversation = response?.data;
      if (!conversation?._id) {
        throw new Error("The conversation could not be created.");
      }
      setSelectedConversationId(conversation._id);
      await loadConversations(true);
    } catch (requestError) {
      setError(requestError?.message || "Unable to start the conversation.");
    } finally {
      setStartingConversation(false);
    }
  };

  const sendMessage = async (attachments = []) => {
    const text = message.trim();
    if (!text && attachments.length === 0) return;
    const veterinarianId =
      selectedConversation?.veterinarianId?._id ||
      selectedConversation?.veterinarianId;
    if (!selectedConversationId || !veterinarianId) {
      setError("Choose or start a veterinarian conversation first.");
      return;
    }

    setSending(true);
    setError("");
    try {
      await apiRequest("/chat/send", {
        method: "POST",
        body: {
          conversationId: selectedConversationId,
          veterinarianId,
          message: text || undefined,
          type: attachments.length ? "FILE" : "TEXT",
          attachments,
        },
      });
      setMessage("");
      await Promise.all([
        loadMessages(selectedConversationId, true),
        loadConversations(true),
      ]);
    } catch (requestError) {
      setError(requestError?.message || "Unable to send the message.");
    } finally {
      setSending(false);
    }
  };

  const handleFileSelection = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (!selectedConversationId) {
      setError("Choose or start a veterinarian conversation before attaching files.");
      event.target.value = "";
      return;
    }
    if (files.some((file) => file.size > 50 * 1024 * 1024)) {
      setError("Each attachment must be 50 MB or smaller.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError("");
    try {
      const attachments = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("chat", file, file.name);
        const response = await apiRequest("/upload/chat", {
          method: "POST",
          body: formData,
          timeoutMs: 120000,
        });
        const url = response?.data?.url || response?.url;
        if (!url) throw new Error(`Unable to upload ${file.name}.`);
        attachments.push({
          type: file.type?.startsWith("image/") ? "image" : "file",
          url,
          name: file.name,
          size: file.size,
          mimeType: file.type || null,
        });
      }
      await sendMessage(attachments);
    } catch (requestError) {
      setError(requestError?.message || "Unable to upload the selected files.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getAttachments = (chatMessage) => {
    if (Array.isArray(chatMessage?.attachments) && chatMessage.attachments.length) {
      return chatMessage.attachments;
    }
    return chatMessage?.fileUrl
      ? [
          {
            url: chatMessage.fileUrl,
            name: chatMessage.fileName || "Attachment",
            type: "file",
          },
        ]
      : [];
  };

  return (
    <>
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content admin-chat-page">
          <div className="page-header">
            <div>
              <h3>Doctor Messages</h3>
              <p>Secure conversations and file sharing with veterinarians.</p>
            </div>
            <select
              className="form-select admin-chat-start-select"
              defaultValue=""
              disabled={startingConversation}
              onChange={(event) => {
                const veterinarianId = event.target.value;
                event.target.value = "";
                startConversation(veterinarianId);
              }}
            >
              <option value="">Start a conversation with a veterinarian</option>
              {veterinarians.map((veterinarian) => (
                <option key={veterinarian._id} value={veterinarian._id}>
                  {displayName(veterinarian)}
                </option>
              ))}
            </select>
          </div>

          {error ? <div className="alert alert-danger">{error}</div> : null}

          <div className="admin-chat-layout">
            <aside className="admin-chat-conversation-list">
              <div className="admin-chat-list-title">Conversations</div>
              {loadingConversations ? (
                <div className="admin-chat-empty">Loading conversations…</div>
              ) : conversations.length ? (
                conversations.map((conversation) => {
                  const veterinarian = conversation?.veterinarianId;
                  const isSelected =
                    String(conversation?._id) === String(selectedConversationId);
                  return (
                    <button
                      className={`admin-chat-conversation ${isSelected ? "is-active" : ""}`}
                      type="button"
                      key={conversation._id}
                      onClick={() => setSelectedConversationId(conversation._id)}
                    >
                      <span className="admin-chat-avatar">{avatarInitial(veterinarian)}</span>
                      <span className="admin-chat-conversation-main">
                        <span className="admin-chat-conversation-name">
                          {displayName(veterinarian)}
                        </span>
                        <span className="admin-chat-conversation-preview">
                          {conversation?.lastMessage?.message || "No messages yet"}
                        </span>
                      </span>
                      <span className="admin-chat-conversation-meta">
                        <small>{formatTime(conversation?.lastMessageAt || conversation?.updatedAt)}</small>
                        {conversation?.unreadCount ? (
                          <b>{conversation.unreadCount}</b>
                        ) : null}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="admin-chat-empty">
                  No Doctor messages yet. Start one using the selector above.
                </div>
              )}
            </aside>

            <section className="admin-chat-thread">
              {selectedConversation ? (
                <>
                  <header className="admin-chat-thread-header">
                    <span className="admin-chat-avatar">
                      {avatarInitial(selectedConversation.veterinarianId)}
                    </span>
                    <span>
                      <strong>{displayName(selectedConversation.veterinarianId)}</strong>
                      <small>Veterinarian</small>
                    </span>
                  </header>
                  <div className="admin-chat-messages">
                    {loadingMessages ? (
                      <div className="admin-chat-empty">Loading messages…</div>
                    ) : messages.length ? (
                      messages.map((chatMessage) => {
                        const ownMessage =
                          String(chatMessage?.senderId?._id || chatMessage?.senderId) ===
                          String(currentUserId);
                        const attachments = getAttachments(chatMessage);
                        return (
                          <div
                            className={`admin-chat-message ${ownMessage ? "is-own" : ""}`}
                            key={chatMessage._id}
                          >
                            <div className="admin-chat-bubble">
                              {chatMessage?.message ? <p>{chatMessage.message}</p> : null}
                              {attachments.map((attachment, index) =>
                                isImage(attachment) ? (
                                  <a
                                    href={toFileUrl(attachment.url)}
                                    target="_blank"
                                    rel="noreferrer"
                                    key={`${chatMessage._id}-${index}`}
                                  >
                                    <img
                                      src={toFileUrl(attachment.url)}
                                      alt={attachment.name || "Attachment"}
                                    />
                                  </a>
                                ) : (
                                  <a
                                    className="admin-chat-file"
                                    href={toFileUrl(attachment.url)}
                                    target="_blank"
                                    rel="noreferrer"
                                    key={`${chatMessage._id}-${index}`}
                                  >
                                    <i className="fa-solid fa-paperclip" aria-hidden="true" />
                                    <span>{attachment.name || "Open attachment"}</span>
                                    <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                                  </a>
                                )
                              )}
                              <small>{formatTime(chatMessage?.createdAt)}</small>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="admin-chat-empty">No messages yet. Say hello.</div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <form
                    className="admin-chat-compose"
                    onSubmit={(event) => {
                      event.preventDefault();
                      sendMessage();
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="d-none"
                      onChange={handleFileSelection}
                    />
                    <button
                      type="button"
                      className="admin-chat-icon-button"
                      aria-label="Attach files"
                      disabled={uploading || sending}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="fa-solid fa-paperclip" aria-hidden="true" />
                    </button>
                    <input
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Write a secure message…"
                      disabled={uploading}
                    />
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={sending || uploading || !message.trim()}
                    >
                      {uploading ? "Uploading…" : sending ? "Sending…" : "Send"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="admin-chat-empty admin-chat-empty--thread">
                  Select a conversation or start a new Doctor conversation.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDoctorChat;
