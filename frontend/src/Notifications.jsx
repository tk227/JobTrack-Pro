
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  Bell,
  CalendarDays,
  Clock,
  X,
  ArrowRight,
  CheckCheck,
} from "lucide-react";

const STORAGE_KEY = "jobtrack_read_notifications";

function Notifications({ interviews = [], onViewInterviews }) {
  const [isOpen, setIsOpen] = useState(false);

  // Load previously read notification IDs.
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save read notification IDs whenever they change.
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(readIds)
    );
  }, [readIds]);

  const notifications = useMemo(() => {
    const now = new Date();

    return interviews
      .filter((item) => {
        if (!item.scheduledAt) return false;

        const interviewDate = new Date(item.scheduledAt);

        return (
          !Number.isNaN(interviewDate.getTime()) &&
          item.status === "scheduled" &&
          interviewDate >= now
        );
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledAt) -
          new Date(b.scheduledAt)
      )
      .map((item) => {
        const interviewDate = new Date(item.scheduledAt);

        const hoursRemaining =
          (interviewDate.getTime() - now.getTime()) /
          (1000 * 60 * 60);

        let message = "Upcoming interview";

        if (hoursRemaining <= 24) {
          message = "Interview within 24 hours!";
        } else if (hoursRemaining <= 48) {
          message = "Interview within 48 hours";
        }

        return {
          ...item,
          message,
        };
      });
  }, [interviews]);

  const unreadCount = notifications.filter(
    (item) => !readIds.includes(item.id)
  ).length;

  function markAllAsRead() {
    setReadIds((previous) => [
      ...new Set([
        ...previous,
        ...notifications.map((item) => item.id),
      ]),
    ]);
  }

  function markAsRead(id) {
    setReadIds((previous) =>
      previous.includes(id)
        ? previous
        : [...previous, id]
    );
  }

  function handleViewInterviews() {
    setIsOpen(false);

    if (onViewInterviews) {
      onViewInterviews();
    }
  }

  function formatInterviewDate(value) {
    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="relative">
      {/* Notification button */}
      <button
        onClick={() => setIsOpen((previous) => !previous)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Notification panel */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="absolute right-0 z-50 mt-3 w-[min(350px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#121326] shadow-2xl shadow-black/40"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 p-4">
                <div>
                  <h3 className="font-bold text-white">
                    Notifications
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {unreadCount} unread notification(s)
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                  aria-label="Close notifications"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Notification list */}
              {notifications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
                    <Bell size={23} />
                  </div>

                  <p className="font-semibold text-white">
                    You're all caught up!
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    No upcoming scheduled interviews.
                  </p>
                </div>
              ) : (
                <>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((item) => {
                      const isRead = readIds.includes(item.id);

                      return (
                        <button
                          key={item.id}
                          onClick={() => markAsRead(item.id)}
                          className={`flex w-full gap-3 border-b border-white/5 p-4 text-left transition hover:bg-white/5 ${
                            !isRead
                              ? "bg-purple-500/[0.04]"
                              : ""
                          }`}
                        >
                          <div className="mt-1 rounded-xl bg-purple-500/10 p-2 text-purple-300">
                            <CalendarDays size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-white">
                                {item.company || "Interview"}
                              </p>

                              {!isRead && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-purple-400" />
                              )}
                            </div>

                            <p className="mt-1 text-xs text-purple-300">
                              {item.message}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {item.roundName}
                            </p>

                            <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                              <Clock size={12} />
                              {formatInterviewDate(item.scheduledAt)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer actions */}
                  <div className="space-y-2 p-3">
                    <button
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <CheckCheck size={15} />
                      Mark all as read
                    </button>

                    <button
                      onClick={handleViewInterviews}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600/20 px-3 py-2 text-xs font-semibold text-purple-300 transition hover:bg-purple-600/30"
                    >
                      View all interviews
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>

            {/* Outside-click overlay */}
            <button
              aria-label="Close notifications"
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 cursor-default"
              style={{ background: "transparent" }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Notifications;
