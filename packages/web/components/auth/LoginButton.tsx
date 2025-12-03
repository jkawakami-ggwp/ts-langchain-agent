"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <p className="text-lg">
          Signed in as <strong>{session.user?.email}</strong>
        </p>
        <button
          onClick={() => signOut()}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <p className="text-lg">Not signed in</p>
      <button
        onClick={() => signIn()}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Sign in
      </button>
    </div>
  );
}

