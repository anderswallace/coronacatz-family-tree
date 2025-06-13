import { trace } from "@opentelemetry/api";

export const tracer = trace.getTracer("discord-bot", "1.0.0");
