import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const LOGO_URL = "https://d1rhw9bys454w3.cloudfront.net/library/43810/conversions/logo_465x320-(20)-size-sm.webp";

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
          background: "#07091c",
          borderRadius: "50%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} width={26} height={26} alt="Eufraat" style={{ objectFit: "contain" }} />
      </div>
    ),
    { ...size },
  );
}
