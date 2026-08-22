import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

import { apiRequest, getCurrentUser } from "../../api/client";

const AdminNotificationsContext = createContext({
  indicators: {},
  markSectionSeen: () => {},
  refreshIndicators: () => {},
});

const seenStorageKey = () => {
  const user = getCurrentUser();
  const identifier = user?._id || user?.id || user?.email || "admin";
  return `pa_admin_seen_sections_${identifier}`;
};

const readSeenSections = () => {
  try {
    return JSON.parse(localStorage.getItem(seenStorageKey()) || "{}");
  } catch {
    return {};
  }
};

const writeSeenSections = (markers) => {
  try {
    localStorage.setItem(seenStorageKey(), JSON.stringify(markers));
  } catch {
    // A full or disabled local storage should not affect normal admin use.
  }
};

const getIndicatorState = (sections, seenMarkers) =>
  Object.entries(sections || {}).reduce((result, [key, value]) => {
    const latestAt = value?.latestAt || null;
    const pendingCount = Number(value?.pendingCount || 0);
    const seenAt = seenMarkers[key] || null;
    const isNew = Boolean(
      latestAt &&
        seenAt &&
        new Date(latestAt).getTime() > new Date(seenAt).getTime()
    );

    result[key] = {
      latestAt,
      pendingCount,
      tone: pendingCount > 0 ? "red" : isNew ? "blue" : null,
    };
    return result;
  }, {});

export function AdminNotificationsProvider({ children }) {
  const [sections, setSections] = useState({});
  const [indicators, setIndicators] = useState({});

  const refreshIndicators = useCallback(async () => {
    const user = getCurrentUser();
    if (!user || String(user.role || "").toUpperCase() !== "ADMIN") return;

    try {
      const payload = await apiRequest("/admin/sidebar-indicators", { timeoutMs: 10000 });
      const nextSections = payload?.data?.sections || {};
      const seenMarkers = readSeenSections();
      let changed = false;

      Object.entries(nextSections).forEach(([key, value]) => {
        if (!seenMarkers[key] && value?.latestAt) {
          seenMarkers[key] = value.latestAt;
          changed = true;
        }
      });

      if (changed) writeSeenSections(seenMarkers);
      setSections(nextSections);
      setIndicators(getIndicatorState(nextSections, seenMarkers));
    } catch {
      // Indicators are intentionally non-blocking; page data continues to work
      // even if this lightweight background request is temporarily unavailable.
    }
  }, []);

  const markSectionSeen = useCallback(
    (sectionKey) => {
      if (!sectionKey || !sections[sectionKey]) return;
      const seenMarkers = readSeenSections();
      const latestAt = sections[sectionKey]?.latestAt;
      if (latestAt) {
        seenMarkers[sectionKey] = latestAt;
        writeSeenSections(seenMarkers);
      }
      setIndicators(getIndicatorState(sections, seenMarkers));
    },
    [sections]
  );

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshIndicators();
    };
    const refreshAfterDataChange = () => refreshIndicators();

    refreshIndicators();
    const intervalId = window.setInterval(refreshWhenVisible, 30000);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("pa-auth-changed", refreshIndicators);
    window.addEventListener("pa-admin-data-changed", refreshAfterDataChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("pa-auth-changed", refreshIndicators);
      window.removeEventListener("pa-admin-data-changed", refreshAfterDataChange);
    };
  }, [refreshIndicators]);

  const value = useMemo(
    () => ({ indicators, markSectionSeen, refreshIndicators }),
    [indicators, markSectionSeen, refreshIndicators]
  );

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export const useAdminNotifications = () => useContext(AdminNotificationsContext);

AdminNotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
