import { useState } from "react";
import { Bot, Clock, FileText, Megaphone } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import type { ContactActivity } from "@/modules/contact/types";
import { ContactCardHeader } from "@/modules/contact/components/ContactCardHeader";

type ActivityFilter = "all" | "campaigns" | "collection" | "bot";

function getActivityFilter(activity: ContactActivity): ActivityFilter {
  const name = (activity.eventName ?? "").toLowerCase();
  if (name.includes("campanha")) return "campaigns";
  if (name.includes("cobrança")) return "collection";
  if (name.includes("bot") || name.includes("conversa")) return "bot";
  return "all";
}

type ContactActivitiesCardProps = {
  activities: ContactActivity[];
  activitiesTotal: number;
  formatDateTime: (iso: string | null | undefined) => string;
  t: (key: string) => string;
};

export function ContactActivitiesCard({
  activities,
  activitiesTotal,
  formatDateTime,
  t,
}: ContactActivitiesCardProps) {
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");

  return (
    <Card>
      <Tabs value={activityFilter} onValueChange={(v) => setActivityFilter(v as ActivityFilter)}>
        <ContactCardHeader
          title={t("pages.debtNegotiation.contactDetail.activities")}
          rightSlot={
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="h-5 rounded-full border border-border/60 px-2 text-[10px] font-medium"
              >
                {activitiesTotal}
              </Badge>
              <TabsList className="h-9">
                <TabsTrigger value="all" className="px-2 text-xs sm:px-3">
                  {t("pages.debtNegotiation.contactDetail.activitiesFilterAll")}
                </TabsTrigger>
                <TabsTrigger value="campaigns" className="px-2 text-xs sm:px-3">
                  {t("pages.debtNegotiation.contactDetail.activitiesFilterCampaigns")}
                </TabsTrigger>
                <TabsTrigger value="collection" className="px-2 text-xs sm:px-3">
                  {t("pages.debtNegotiation.contactDetail.activitiesFilterCollection")}
                </TabsTrigger>
                <TabsTrigger value="bot" className="px-2 text-xs sm:px-3">
                  {t("pages.debtNegotiation.contactDetail.activitiesFilterBot")}
                </TabsTrigger>
              </TabsList>
            </div>
          }
        />
        <CardContent className="pt-3">
          {(["all", "campaigns", "collection", "bot"] as const).map((tab) => {
            const list =
              tab === "all" ? activities : activities.filter((a) => getActivityFilter(a) === tab);

            return (
              <TabsContent key={tab} value={tab} className="mt-0">
                {list.length === 0 ? (
                  <p className="py-4 text-sm text-muted-foreground">-</p>
                ) : (
                  <ul className="divide-y">
                    {list.map((activity, index) => {
                      const filter = getActivityFilter(activity);
                      const Icon =
                        filter === "campaigns"
                          ? Megaphone
                          : filter === "collection"
                            ? Clock
                            : filter === "bot"
                              ? Bot
                              : FileText;

                      return (
                        <li
                          key={`${activity.eventDate}-${index}`}
                          className="flex items-start gap-3 py-3 first:pt-0"
                        >
                          <span
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-full",
                              filter === "campaigns" && "bg-primary/15 text-primary",
                              filter === "collection" && "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
                              filter === "bot" && "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
                              filter === "all" && "bg-muted text-muted-foreground",
                            )}
                          >
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-foreground">{activity.eventName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(activity.eventDate)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </TabsContent>
            );
          })}
        </CardContent>
      </Tabs>
    </Card>
  );
}
