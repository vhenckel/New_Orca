import { apiRequest } from "@/shared/api/http-client";

export async function uploadNfeFiles(files: File[]): Promise<string> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  const blob = await apiRequest<Blob>("/nfe/upload", {
    method: "POST",
    body: formData,
  });

  return blob.text();
}

export function buildNfeDownloadFilename(): string {
  return `nfe-${new Date().toISOString()}.csv`;
}
