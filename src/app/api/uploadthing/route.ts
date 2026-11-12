import { createRouteHandler } from "uploadthing/next";

import { resumeRouter } from "@/features/profile/services/upload-router";

export const { GET, POST } = createRouteHandler({ router: resumeRouter, config: { logLevel: "None" } });
