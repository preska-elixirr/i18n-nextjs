import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withPayload } from "@payloadcms/next/withPayload";

const config: NextConfig = {
  poweredByHeader: false,
  // Payload's admin uses request-time APIs. Keep Cache Components off
  // throughout this combined application rather than isolating a route group.
};
export default withPayload(createNextIntlPlugin()(config));
