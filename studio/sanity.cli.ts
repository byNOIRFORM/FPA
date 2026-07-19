import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "o7vy0va0",
    dataset: "production",
  },
  // Hostované Studio — `sanity deploy` ho nasadí na
  // fottapopadic.sanity.studio (prístup len pre pozvaných členov
  // projektu cez manage.sanity.io). 2026-07-19.
  studioHost: "fottapopadic",
  deployment: {
    appId: "o06tfbcdjoilxeihvwykj460",
  },
});
