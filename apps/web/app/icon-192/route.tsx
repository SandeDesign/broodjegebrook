import { ImageResponse } from "next/og";

export const runtime = "edge";

const LOGO_URL = "https://d1rhw9bys454w3.cloudfront.net/library/43810/conversions/logo_465x320-(20)-size-sm.webp";

export async function GET() {
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
        <img src={LOGO_URL} width={150} height={150} alt="Eufraat" style={{ objectFit: "contain" }} />
      </div>
    ),
    { width: 192, height: 192 },
  );
}
