import { useEffect, useMemo, useState } from "react";
import { Ban } from "lucide-react";

import type { PersonContactListItem } from "@/modules/contact/types/person-contact";
import {
  useAddContactsToBlocklist,
  useContactBlacklistReasons,
} from "@/modules/contact/hooks";
import { formatWhatsApp } from "@/modules/contact/utils/format-whatsapp";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { toast } from "@/shared/ui/sonner";
import { cn } from "@/shared/lib/utils";

export interface AddToBlocklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorContactId: number;
  candidates: PersonContactListItem[];
}

export function AddToBlocklistDialog({
  open,
  onOpenChange,
  anchorContactId,
  candidates,
}: AddToBlocklistDialogProps) {
  const { t } = useI18n();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [reasonId, setReasonId] = useState<string>("");

  const { data: reasons, isPending: reasonsPending } =
    useContactBlacklistReasons(open);
  const addMutation = useAddContactsToBlocklist({ anchorContactId });

  const eligible = useMemo(
    () => candidates.filter((c) => !c.isInBlackList),
    [candidates],
  );

  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
      setReasonId("");
    }
  }, [open]);

  const toggleId = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canSubmit =
    selectedIds.size > 0 &&
    reasonId !== "" &&
    !addMutation.isPending &&
    eligible.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await addMutation.mutateAsync({
        contactIds: Array.from(selectedIds),
        contactBlockListReasonIds: [Number(reasonId)],
      });
      toast.success(t("pages.contact.addToBlocklist.success"));
      onOpenChange(false);
    } catch {
      toast.error(t("pages.contact.addToBlocklist.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("pages.contact.addToBlocklist.title")}</DialogTitle>
          <DialogDescription>
            {t("pages.contact.addToBlocklist.description")}
          </DialogDescription>
        </DialogHeader>

        {eligible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("pages.contact.addToBlocklist.noEligible")}
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <Label>{t("pages.contact.addToBlocklist.numbersLabel")}</Label>
              <ul className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-md border border-border p-3">
                {candidates.map((c) => {
                  const disabled = c.isInBlackList;
                  const label = c.appkey
                    ? formatWhatsApp(c.appkey)
                    : c.name || `#${c.id}`;
                  return (
                    <li
                      key={c.id}
                      className={cn(
                        "flex items-center gap-3",
                        disabled && "opacity-60",
                      )}
                    >
                      <Checkbox
                        id={`bl-c-${c.id}`}
                        checked={selectedIds.has(c.id)}
                        disabled={disabled}
                        onCheckedChange={() => {
                          if (!disabled) toggleId(c.id);
                        }}
                      />
                      <label
                        htmlFor={`bl-c-${c.id}`}
                        className={cn(
                          "flex min-w-0 flex-1 cursor-pointer text-sm",
                          disabled && "cursor-not-allowed",
                        )}
                      >
                        {disabled ? (
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-foreground">{label}</span>
                            {c.main ? (
                              <span className="text-xs text-muted-foreground">
                                ({t("pages.debtNegotiation.contactDetail.mainContact")})
                              </span>
                            ) : null}
                            <span className="flex items-center gap-1 text-xs text-destructive">
                              <Ban className="size-3.5 shrink-0" />
                              {t("pages.contact.addToBlocklist.inBlocklistHint")}
                            </span>
                          </span>
                        ) : (
                          <>
                            {label}
                            {c.main ? (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({t("pages.debtNegotiation.contactDetail.mainContact")})
                              </span>
                            ) : null}
                          </>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="blocklist-reason">
                {t("pages.contact.addToBlocklist.selectReason")}
              </Label>
              <Select
                value={reasonId}
                onValueChange={setReasonId}
                disabled={reasonsPending || !reasons?.length}
              >
                <SelectTrigger id="blocklist-reason">
                  <SelectValue
                    placeholder={t(
                      "pages.contact.addToBlocklist.reasonPlaceholder",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(reasons ?? []).map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.description || r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={addMutation.isPending}
          >
            {t("pages.contact.addToBlocklist.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!canSubmit}
            onClick={() => void handleSubmit()}
          >
            {addMutation.isPending
              ? t("pages.contact.addToBlocklist.submitting")
              : t("pages.contact.addToBlocklist.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
