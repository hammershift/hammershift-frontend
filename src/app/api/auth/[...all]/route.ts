import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/betterAuth";

export const { POST, GET } = toNextJsHandler(auth);
