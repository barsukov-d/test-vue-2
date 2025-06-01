// API Configuration
export const API_BASE_URL =
  process.env.VUE_APP_API_BASE_URL || "https://dev-api.aiscreen.io";

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: "/api/v1/login",
  TEMPLATES: "/api/v1/canvas_templates",
  TEMPLATES_TAGS: "/api/v1/canvas_templates/tags/list",
};
