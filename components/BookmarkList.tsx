"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function BookmarkList({ user }: any) {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

useEffect(() => {
  if (!user?.id) return;

  const fetchBookmarks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookmarks:", error);
    } else {
      setBookmarks(data || []);
    }
    setLoading(false);
  };

  fetchBookmarks();

  // ────────────────────────────────────────────────
  // Realtime subscription
  // ────────────────────────────────────────────────
const channel = supabase
  .channel("bookmarks-changes") // keep shared name
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "bookmarks",
      filter: `user_id=eq.${user.id}`,
    },
    (payload) => {
      console.log("[Realtime INSERT]", payload);
      setBookmarks((prev) => [payload.new, ...prev]);
    }
  )
  .on(
    "postgres_changes",
    {
      event: "DELETE",
      schema: "public",
      table: "bookmarks",
      filter: `user_id=eq.${user.id}`,
    },
    (payload) => {
      console.log("[Realtime DELETE]", payload);
      setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
    }
  )
  .subscribe((status, err) => {
    console.log("[Realtime Status]", status);
    if (err) {
      console.error("[Realtime Error]", err);
    }
    if (status === "SUBSCRIBED") {
      console.log("[Realtime] Successfully connected – waiting for changes");
    }
    if (status === "CLOSED") {
      console.warn("[Realtime] Channel closed – possible reasons: realtime not enabled, duplicate channel, or connection lost");
    }
    if (status === "CHANNEL_ERROR") {
      console.error("[Realtime] Channel error – check policies or table config");
    }
  });
  return () => {
    supabase.removeChannel(channel);
  };
}, [user?.id]);   


const handleDelete = async (id: string) => {
  // Optimistic update – remove immediately
  const deletedBookmark = bookmarks.find(b => b.id === id);
  if (!deletedBookmark) return;

  setBookmarks(prev => prev.filter(b => b.id !== id));
  setDeletingId(id);

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id);

  setDeletingId(null);

  if (error) {
    console.error("Delete failed:", error);
    // Rollback: add it back
    setBookmarks(prev => [...prev, deletedBookmark].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
    // Optional: show toast/notification "Failed to delete"
  }
  // No need to refetch full list – optimistic + RLS guarantees only own deletes succeed
};

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-600">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          No bookmarks yet
        </h3>
        <p className="text-slate-600">
          Start by adding your first bookmark using the form on the left.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="group border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all bg-white hover:border-slate-300"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Favicon */}
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                {getFavicon(bookmark.url) ? (
                  <img
                    src={getFavicon(bookmark.url)!}
                    alt=""
                    className="w-5 h-5"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <svg
                  className={getFavicon(bookmark.url) ? "hidden w-5 h-5 text-slate-400" : "w-5 h-5 text-slate-400"}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                
                  <a href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group-hover:text-blue-600 transition-colors"
                >
                  <h3 className="font-medium text-slate-900 group-hover:text-blue-600 truncate">
                    {bookmark.title}
                  </h3>
                  <p className="text-sm text-slate-500 truncate mt-1 flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    {getDomain(bookmark.url)}
                  </p>
                </a>
                
                {/* Timestamp */}
                <p className="text-xs text-slate-400 mt-2">
                  Added {new Date(bookmark.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(bookmark.id)}
              disabled={deletingId === bookmark.id}
              className="flex-shrink-0 text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all disabled:opacity-50"
              title="Delete bookmark"
            >
              {deletingId === bookmark.id ? (
                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}