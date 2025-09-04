export default {
  async scheduled(event, env, ctx) {
    if (!env.BUILD_HOOK_URL) {
      console.log("No BUILD_HOOK_URL configured");
      return;
    }
    const res = await fetch(env.BUILD_HOOK_URL, { method: "POST" });
    console.log("Triggered Pages deploy hook", res.status);
  },
};

