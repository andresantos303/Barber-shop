"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// swagger-ui-react reaches for `window` at import time, so it can only ever render client-side,
// and it's heavy enough that it shouldn't be in the main admin bundle.
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export function SwaggerUiClient() {
  return <SwaggerUI url="/api/docs/spec" />;
}
