"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";

export default function ToastNotice({ message }: { message: string }) {
  useEffect(() => {
    if (message) toast.error(message);
  }, [message]);

  return null;
}
