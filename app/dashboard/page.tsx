"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkList from "@/components/BookmarkList";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  if (!user) return <p className="p-10">Loading...</p>;

  return (
    <div>
      <Navbar />
      <div className="p-10">
        <BookmarkForm user={user} />
        <BookmarkList user={user} />
      </div>
    </div>
  );
}
