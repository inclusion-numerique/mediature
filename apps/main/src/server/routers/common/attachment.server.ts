// A few browsers were throwing `TextEncoder is not defined`
// and since we use it only on the server we isolate the usage of it
export const fileAuthSecret = new TextEncoder().encode(process.env.FILE_AUTH_SECRET);
