import { NodeSDK } from "@opentelemetry/sdk-node";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
} from "@opentelemetry/sdk-logs";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PrismaInstrumentation } from "@prisma/instrumentation";

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: "discord-bot",
  [ATTR_SERVICE_VERSION]: "1.0.0",
});

const traceExporter = new OTLPTraceExporter();

const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter(),
  exportIntervalMillis: 30_000,
});

const logProcessors = [new BatchLogRecordProcessor(new OTLPLogExporter())];

// If not running in prod, make sure logs are pushed to console
if (process.env.NODE_ENV !== "production") {
  logProcessors.push(
    new BatchLogRecordProcessor(new ConsoleLogRecordExporter()),
  );
}

const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReader,
  logRecordProcessors: logProcessors,
  instrumentations: [new PrismaInstrumentation({})], // Tracing for Prisma Operations
});

sdk.start();

process.on("SIGTERM", () => sdk.shutdown());
process.on("SIGINT", () => sdk.shutdown());
