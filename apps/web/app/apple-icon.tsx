import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const LOGO_URL = "https://d1rhw9bys454w3.cloudfront.net/library/43810/conversions/logo_465x320-(20)-size-sm.webp";

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
          background: "#07091c",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} width={140} height={140} alt="Eufraat" style={{ objectFit: "contain" }} />
      </div>
    ),
    { ...size },
  );
}
