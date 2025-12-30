// Re-export everything from client.ts
export * from "./client";

// Re-export hooks
export * from "./hooks";

// Re-export the supabase client as default
export { supabase as default } from "./client";
