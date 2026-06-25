import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#E8500A",
          borderRadius: "32px",
        }}
      >
        <span style={{ fontSize: 120, lineHeight: 1 }}>🥪</span>
      </div>
    ),
    { ...size },
  );
}
