import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from "@opentelemetry/sdk-metrics";
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

// Toggle logging inside application when in dev mode
const isProd = process.env.NODE_ENV === "production";

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: "discord-bot",
  [ATTR_SERVICE_VERSION]: "1.0.0",
});

const traceExporter = isProd
  ? new OTLPTraceExporter()
  : new ConsoleSpanExporter();

const metricReader = new PeriodicExportingMetricReader({
  exporter: isProd ? new OTLPMetricExporter() : new ConsoleMetricExporter(),
  exportIntervalMillis: 30_000,
});

const logProcessors = [new BatchLogRecordProcessor(new OTLPLogExporter())];

if (!isProd) {
  logProcessors.push(
    new BatchLogRecordProcessor(new ConsoleLogRecordExporter()),
  );
}

const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReader,
  logRecordProcessors: logProcessors,
});

sdk.start();

process.on("SIGTERM", () => sdk.shutdown());
process.on("SIGINT", () => sdk.shutdown());
