"use client";

import { Copy, Check, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function JoinQR({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState("");

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/play/join?code=${code}`
      : "";

  useEffect(() => {
    if (!joinUrl) return;
    QRCode.toDataURL(joinUrl, {
      margin: 1,
      width: 320,
      color: { dark: "#1A1A1A", light: "#F5F4F0" },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [joinUrl]);

  function copy() {
    navigator.clipboard.writeText(joinUrl || code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      {open && dataUrl && (
        <div className="card p-4 flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUrl}
            alt={`QR code to join game ${code}`}
            width={200}
            height={200}
            className="rounded-lg"
          />
          <p className="text-xs font-bold text-[#1A1A1A]/60">
            Scan to join — code{" "}
            <span className="tracking-widest text-[#1A1A1A]">{code}</span>
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs font-bold text-[#1A1A1A]/50">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 hover:text-[#1A1A1A]/80 transition"
        >
          <QrCode size={13} />
          {open ? "Hide QR code" : "Show QR code"}
        </button>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 hover:text-[#1A1A1A]/80 transition"
        >
          Copy join link
          {copied ? (
            <Check size={14} className="text-green-600" />
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>
    </div>
  );
}
