"use client";

import { useSession } from "next-auth/react";

export default function AccessToken() {
  const { data } = useSession();
  const accessToken = (data as any)?.accessToken;

  if (!accessToken) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
      <p className="text-sm text-gray-600 dark:text-gray-400">Access Token:</p>
      <p className="text-xs font-mono break-all">{accessToken}</p>
    </div>
  );
}

