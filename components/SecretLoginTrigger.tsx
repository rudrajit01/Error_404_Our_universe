
"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

export default function SecretLoginTrigger() {
  const router = useRouter();
  const clickCount = useRef(0);

  function handleSecretClick() {
    clickCount.current += 1;

    if (clickCount.current >= 4) {
      clickCount.current = 0;
      router.push("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleSecretClick}
      className="cursor-default select-none border-0 bg-transparent text-inherit"
      aria-label="Copyright"
    >
      ERROR 404 © 2026 — OUR LITTLE UNIVERSE
    </button>
  );
}
