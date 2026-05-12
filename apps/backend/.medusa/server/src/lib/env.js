"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = env;
exports.hasEnv = hasEnv;
exports.requireEnv = requireEnv;
exports.backendUrl = backendUrl;
function env(name, legacyName) {
    return process.env[name] || (legacyName ? process.env[legacyName] || "" : "");
}
function hasEnv(name, legacyName) {
    return Boolean(env(name, legacyName));
}
function requireEnv(name, legacyName) {
    const value = env(name, legacyName);
    if (!value) {
        const suffix = legacyName ? ` or ${legacyName}` : "";
        throw new Error(`Missing required environment variable ${name}${suffix}`);
    }
    return value;
}
function backendUrl() {
    return env("MEDUSA_BACKEND_URL") || `http://localhost:${process.env.PORT || 9000}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9lbnYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrQkFFQztBQUVELHdCQUVDO0FBRUQsZ0NBT0M7QUFFRCxnQ0FFQztBQW5CRCxTQUFnQixHQUFHLENBQUMsSUFBWSxFQUFFLFVBQW1CO0lBQ25ELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQy9FLENBQUM7QUFFRCxTQUFnQixNQUFNLENBQUMsSUFBWSxFQUFFLFVBQW1CO0lBQ3RELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQTtBQUN2QyxDQUFDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLElBQVksRUFBRSxVQUFtQjtJQUMxRCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFBO0lBQ25DLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNYLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO1FBQ3BELE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLElBQUksR0FBRyxNQUFNLEVBQUUsQ0FBQyxDQUFBO0lBQzNFLENBQUM7SUFDRCxPQUFPLEtBQUssQ0FBQTtBQUNkLENBQUM7QUFFRCxTQUFnQixVQUFVO0lBQ3hCLE9BQU8sR0FBRyxDQUFDLG9CQUFvQixDQUFDLElBQUksb0JBQW9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFBO0FBQ3BGLENBQUMifQ==