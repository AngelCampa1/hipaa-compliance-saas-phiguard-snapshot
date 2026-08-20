type ObjectStorageHttpMetadata = {
  contentType?: string;
  contentEncoding?: string;
};

export type ObjectStorageObject = {
  body?: ReadableStream | null;
  httpMetadata?: ObjectStorageHttpMetadata | null;
  size?: number;
  writeHttpMetadata?: (headers: Headers) => void;
};

export type ObjectStorageBucket = {
  get(key: string): Promise<ObjectStorageObject | null>;
  head(key: string): Promise<ObjectStorageObject | null>;
  put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | Blob | ReadableStream,
    options?: {
      httpMetadata?: ObjectStorageHttpMetadata;
      customMetadata?: Record<string, string>;
      onlyIf?: {
        etagDoesNotMatch?: string;
        etagMatches?: string;
        uploadedAfter?: Date;
        uploadedBefore?: Date;
      };
    },
  ): Promise<unknown>;
};

type ObjectStorageBindings = {
  attachments?: ObjectStorageBucket;
  auditExports?: ObjectStorageBucket;
  leadMagnets?: ObjectStorageBucket;
};

const OBJECT_STORAGE_BINDINGS_KEY = "__phiguardObjectStorageBindings";

function getGlobalScope() {
  return globalThis as typeof globalThis & {
    [OBJECT_STORAGE_BINDINGS_KEY]?: ObjectStorageBindings;
  };
}

function getBindings() {
  return getGlobalScope()[OBJECT_STORAGE_BINDINGS_KEY] ?? {};
}

function isObjectStorageBucket(value: unknown): value is ObjectStorageBucket {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    typeof (value as ObjectStorageBucket).get === "function" &&
    typeof (value as ObjectStorageBucket).head === "function" &&
    typeof (value as ObjectStorageBucket).put === "function"
  );
}

export function setObjectStorageBindings(bindings?: ObjectStorageBindings) {
  const normalized: ObjectStorageBindings = {};

  if (isObjectStorageBucket(bindings?.attachments)) {
    normalized.attachments = bindings.attachments;
  }

  if (isObjectStorageBucket(bindings?.auditExports)) {
    normalized.auditExports = bindings.auditExports;
  }

  if (isObjectStorageBucket(bindings?.leadMagnets)) {
    normalized.leadMagnets = bindings.leadMagnets;
  }

  getGlobalScope()[OBJECT_STORAGE_BINDINGS_KEY] = normalized;
}

export function getAttachmentsBucketName() {
  return process.env.ATTACHMENTS_BUCKET_NAME ?? process.env.R2_ATTACHMENTS_BUCKET ?? "";
}

export function getAttachmentsBucketBinding() {
  return getBindings().attachments ?? null;
}

export function getAuditExportsBucketName() {
  return process.env.AUDIT_EXPORTS_BUCKET_NAME ?? process.env.R2_AUDIT_EXPORTS_BUCKET ?? "";
}

export function getAuditExportsBucketBinding() {
  const configuredBinding = getBindings().auditExports;
  if (configuredBinding) {
    return configuredBinding;
  }

  return null;
}

export function getLeadMagnetsBucketName() {
  return process.env.LEAD_MAGNETS_BUCKET ?? process.env.R2_LEAD_MAGNETS_BUCKET ?? "";
}

export function getLeadMagnetsBucketBinding() {
  return getBindings().leadMagnets ?? null;
}

export function getObjectStoragePublicOrigin() {
  if (process.env.OBJECT_STORAGE_PUBLIC_ORIGIN) {
    try {
      return new URL(process.env.OBJECT_STORAGE_PUBLIC_ORIGIN).origin;
    } catch {
      return null;
    }
  }

  if (process.env.R2_PUBLIC_ORIGIN) {
    try {
      return new URL(process.env.R2_PUBLIC_ORIGIN).origin;
    } catch {
      return null;
    }
  }

  return null;
}
