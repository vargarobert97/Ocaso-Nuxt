import { env } from "@strapi/utils";

export default [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "img-src": [
            "'self'",
            env("VERCEL_BLOB_DOMAIN", ""),
            "data:",
            "blob:"
          ],
          "media-src": ["'self'", env("VERCEL_BLOB_DOMAIN", ""), "data:"]
        }
      }
    }
  },
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public"
];
