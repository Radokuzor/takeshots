import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7,
          background: "linear-gradient(135deg, #FF6B35, #FF4500)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 20,
            lineHeight: 1,
          }}
        >
          🥃
        </div>
      </div>
    ),
    { ...size }
  );
}
