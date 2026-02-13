"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function BookmarkForm({ user }: any) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!title || !url) {
      setError("Please fill in all fields");
      return;
    }

    // Basic URL validation
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("bookmarks").insert([
      {
        title,
        url: url.startsWith('http') ? url : `https://${url}`,
        user_id: user.id,
      },
    ]);

    setLoading(false);

    if (insertError) {
      setError("Failed to add bookmark");
      return;
    }

    setTitle("");
    setUrl("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Title
        </label>
        <input
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400"
          placeholder="My favorite article"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          URL
        </label>
        <input
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={loading || !title || !url}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Adding...
          </>
        ) : (
          <>
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Bookmark
          </>
        )}
      </button>
    </div>
  );
}