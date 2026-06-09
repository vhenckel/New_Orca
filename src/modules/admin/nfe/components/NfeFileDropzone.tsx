import { FileText, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { toast } from "@/shared/ui/sonner";

const FILE_ACCEPT =
  ".xml,.zip,application/xml,text/xml,application/zip,application/x-zip-compressed";
const MAX_FILE_BYTES = 100 * 1024 * 1024;

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".xml") || name.endsWith(".zip");
}

type NfeFileDropzoneProps = {
  files: File[];
  disabled?: boolean;
  onFilesChange: (files: File[]) => void;
};

export function NfeFileDropzone({ files, disabled = false, onFilesChange }: NfeFileDropzoneProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const addFiles = (incoming: File[]) => {
    const accepted: File[] = [];

    for (const file of incoming) {
      if (!isAcceptedFile(file)) {
        toast.error(t("modules.admin.nfe.errors.fileTypeRejected", { name: file.name }));
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error(t("modules.admin.nfe.errors.fileTooLarge", { name: file.name }));
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) return;
    onFilesChange([...files, ...accepted]);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files ? Array.from(event.target.files) : [];
    addFiles(selected);
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    if (disabled) return;
    addFiles(Array.from(event.dataTransfer.files));
  };

  const handleRemove = (index: number) => {
    onFilesChange(files.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDragActive && "border-muted-foreground/50 bg-muted/25",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={FILE_ACCEPT}
          disabled={disabled}
          className="sr-only"
          onChange={handleInputChange}
        />

        <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
          <div className="rounded-full border border-dashed p-3">
            <Upload className="size-7 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium text-muted-foreground">
              {isDragActive
                ? t("modules.admin.nfe.dropzoneActive")
                : t("modules.admin.nfe.dropzonePrompt")}
            </p>
            <p className="text-sm text-muted-foreground/70">{t("modules.admin.nfe.dropzoneLimit")}</p>
          </div>
        </div>
      </div>

      {files.length > 0 ? (
        <ScrollArea className="h-fit w-full">
          <div className="flex max-h-48 flex-col gap-3 pr-3">
            {files.map((file, index) => (
              <div key={`${file.name}-${file.size}-${index}`} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <p className="truncate text-sm">{file.name}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled}
                  aria-label={t("modules.admin.nfe.removeFile")}
                  onClick={() => handleRemove(index)}
                >
                  <X />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
}
