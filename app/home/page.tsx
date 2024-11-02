"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "authenticated") {
    return <p>Signed in as {session.user.email}</p>;
  } else {
    router.push("/");
  }
};

export default HomePage;
