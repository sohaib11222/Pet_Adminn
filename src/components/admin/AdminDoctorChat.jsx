import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";

import Header from "../Header";
import Sidebar from "../Sidebar";
import { apiRequest, getApiBaseUrl, getCurrentUser } from "../../api/client";
import { useLanguage } from "../../contexts/LanguageContext";

const avatarInitial = (person) =>
  String(person?.name || person?.fullName || person?.email || "D")
    .trim()
    .charAt(0)
    .toUpperCase();

const displayName = (person, fallback = "Veterinarian") =>
  person?.name || person?.fullName || person?.email || fallback;

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

const AdminDoctorChat = ({ businessMode = false }) => {
  const { translateText: ui } = useLanguage();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const currentUserId = currentUser?._id || currentUser?.id;
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const publicBaseUrl = useMemo(
    () => apiBaseUrl.replace(/\/api\/?$/, ""),
    [apiBaseUrl]
  );

  const [conversations, setConversations] = useState([]);
  const [supportUsers, setSupportUsers] = useState([]);
  const [businessFilter, setBusinessFilter] = useState("PET_STORE");
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const [error, setError] = useState("");

  const conversationTypes = useMemo(
    () =>
      businessMode
        ? [businessFilter === "PARAPHARMACY" ? "ADMIN_PARAPHARMACY" : "ADMIN_PET_STORE"]
        : ["ADMIN_VETERINARIAN"],
    [businessFilter, businessMode]
  );
  const participantField = businessMode ? "businessId" : "veterinarianId";
  const participantLabel = businessMode
    ? businessFilter === "PARAPHARMACY" ? ui("Parapharmacy") : ui("Pharmacy")
    : ui("Veterinarian");
  const messagesTitle = businessMode ? ui("Pharmacy / Parapharmacy Messages") : ui("Doctor Messages");

  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

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
            conversationTypes.includes(conversation?.conversationType)
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
          setError(ui(requestError?.message || "Unable to load admin messages."));
        }
      } finally {
        if (!silent) setLoadingConversations(false);
      }
    },
    [conversationTypes, ui]
  );

  const loadSupportUsers = useCallback(async () => {
    try {
      const response = await apiRequest(
        businessMode ? "/users" : "/users/veterinarians",
        {
          params: businessMode
            ? { page: 1, limit: 100, status: "APPROVED", role: businessFilter }
            : { page: 1, limit: 100, status: "APPROVED" },
        }
      );
      setSupportUsers(response?.data?.users || response?.data?.veterinarians || []);
    } catch {
      // Conversation history remains usable if the picker request is unavailable.
    }
  }, [businessFilter, businessMode]);

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
        setError(ui(requestError?.message || "Unable to load messages."));
      }
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, [ui]);

  useEffect(() => {
    loadConversations();
    loadSupportUsers();
    const intervalId = window.setInterval(() => loadConversations(true), 5000);
    return () => window.clearInterval(intervalId);
  }, [loadConversations, loadSupportUsers]);

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
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const selectedConversation = conversations.find(
    (conversation) =>
      String(conversation?._id) === String(selectedConversationId)
  );

  const startConversation = async (participantId) => {
    if (!participantId) return;
    setStartingConversation(true);
    setError("");
    try {
      const response = await apiRequest("/chat/conversation", {
        method: "POST",
        body: { [participantField]: participantId },
      });
      const conversation = response?.data;
      if (!conversation?._id) {
        throw new Error(ui("The conversation could not be created."));
      }
      setSelectedConversationId(conversation._id);
      await loadConversations(true);
    } catch (requestError) {
      setError(ui(requestError?.message || "Unable to start the conversation."));
    } finally {
      setStartingConversation(false);
    }
  };

  const sendMessage = async (attachments = []) => {
    const text = message.trim();
    if (!text && attachments.length === 0) return;
    const participantId =
      selectedConversation?.[participantField]?._id ||
      selectedConversation?.[participantField];
    if (!selectedConversationId || !participantId) {
      setError(ui("Choose or start a conversation first."));
      return;
    }

    setSending(true);
    setError("");
    try {
      await apiRequest("/chat/send", {
        method: "POST",
        body: {
          conversationId: selectedConversationId,
          [participantField]: participantId,
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
      setError(ui(requestError?.message || "Unable to send the message."));
    } finally {
      setSending(false);
    }
  };

  const handleFileSelection = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (!selectedConversationId) {
      setError(ui("Choose or start a conversation before attaching files."));
      event.target.value = "";
      return;
    }
    if (files.some((file) => file.size > 50 * 1024 * 1024)) {
      setError(ui("Each attachment must be 50 MB or smaller."));
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
        if (!url) throw new Error(ui("Unable to upload file."));
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
      setError(ui(requestError?.message || "Unable to upload the selected files."));
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
            name: chatMessage.fileName || "",
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
                <h3>{messagesTitle}</h3>
                <p>
                  {businessMode
                  ? ui("Secure conversations and file sharing with pharmacies and parapharmacies.")
                  : ui("Secure conversations and file sharing with veterinarians.")}
              </p>
            </div>
            {businessMode ? (
              <select
                className="form-select admin-chat-start-select"
                value={businessFilter}
                onChange={(event) => setBusinessFilter(event.target.value)}
                aria-label={ui("Choose Pharmacy or Parapharmacy conversations")}
              >
                <option value="PET_STORE">{ui("Pharmacy")}</option>
                <option value="PARAPHARMACY">{ui("Parapharmacy")}</option>
              </select>
            ) : null}
            <select
              className="form-select admin-chat-start-select"
              defaultValue=""
              disabled={startingConversation}
              onChange={(event) => {
                const participantId = event.target.value;
                event.target.value = "";
                startConversation(participantId);
              }}
            >
              <option value="">{businessMode ? (businessFilter === "PARAPHARMACY" ? ui("Start a conversation with a parapharmacy") : ui("Start a conversation with a pharmacy")) : ui("Start a conversation with a veterinarian")}</option>
              {supportUsers.map((supportUser) => (
                <option key={supportUser._id} value={supportUser._id}>
                  {displayName(supportUser, participantLabel)}
                </option>
              ))}
            </select>
          </div>

          {error ? <div className="alert alert-danger">{error}</div> : null}

          <div className="admin-chat-layout">
            <aside className="admin-chat-conversation-list">
              <div className="admin-chat-list-title">{ui("Conversations")}</div>
              {loadingConversations ? (
                <div className="admin-chat-empty">{ui("Loading conversations...")}</div>
              ) : conversations.length ? (
                conversations.map((conversation) => {
                  const participant = conversation?.[participantField];
                  const isSelected =
                    String(conversation?._id) === String(selectedConversationId);
                  return (
                    <button
                      className={`admin-chat-conversation ${isSelected ? "is-active" : ""}`}
                      type="button"
                      key={conversation._id}
                      onClick={() => setSelectedConversationId(conversation._id)}
                    >
                      <span className="admin-chat-avatar">{avatarInitial(participant)}</span>
                      <span className="admin-chat-conversation-main">
                        <span className="admin-chat-conversation-name">
                          {displayName(participant, participantLabel)}
                        </span>
                        <span className="admin-chat-conversation-preview">
                          {conversation?.lastMessage?.message || ui("No messages yet")}
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
                  {ui("No messages yet. Start one using the selector above.")}
                </div>
              )}
            </aside>

            <section className="admin-chat-thread">
              {selectedConversation ? (
                <>
                  <header className="admin-chat-thread-header">
                    <span className="admin-chat-avatar">
                      {avatarInitial(selectedConversation[participantField])}
                    </span>
                    <span>
                      <strong>{displayName(selectedConversation[participantField], participantLabel)}</strong>
                      <small>{participantLabel}</small>
                    </span>
                  </header>
                  <div ref={messagesContainerRef} className="admin-chat-messages">
                    {loadingMessages ? (
                      <div className="admin-chat-empty">{ui("Loading messages...")}</div>
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
                                      alt={attachment.name || ui("Attachment")}
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
                                    <span>{attachment.name || ui("Open attachment")}</span>
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
                      <div className="admin-chat-empty">{ui("No messages yet. Say hello.")}</div>
                    )}
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
                      aria-label={ui("Attach files")}
                      disabled={uploading || sending}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="fa-solid fa-paperclip" aria-hidden="true" />
                    </button>
                    <input
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder={ui("Write a secure message...")}
                      disabled={uploading}
                    />
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={sending || uploading || !message.trim()}
                    >
                      {uploading ? ui("Uploading...") : sending ? ui("Sending...") : ui("Send")}
                    </button>
                  </form>
                </>
              ) : (
                <div className="admin-chat-empty admin-chat-empty--thread">
                  {ui("Select a conversation or start a new conversation.")}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

AdminDoctorChat.propTypes = {
  businessMode: PropTypes.bool,
};

export default AdminDoctorChat;
