/** Mensagens do módulo Settings (empresa). */
export const settingsEnUS = {
  "modules.settings.title": "Settings",
  "modules.settings.description":
    "Agent profile, renegotiation rules, and communication channels.",
  "modules.settings.routes.agent.label": "Agent",
  "modules.settings.routes.agent.description":
    "Agent name and company description for conversation context.",
  "modules.settings.routes.renegotiation.label": "Renegotiation",
  "modules.settings.routes.renegotiation.description":
    "Calculation rules and limits applied to debts.",
  "modules.settings.routes.channels.label": "Channels",
  "modules.settings.routes.channels.description":
    "Manage sending channels, limits, and message restrictions.",
  "modules.settings.channels.pageTitle": "Channel management",
  "modules.settings.channels.loadError": "Could not load channels.",
  "modules.settings.channels.loading": "Loading channels…",
  "modules.settings.channels.empty": "No channels found.",
  "modules.settings.channels.metrics.active": "Active channels",
  "modules.settings.channels.metrics.messagesToday": "Messages today",
  "modules.settings.channels.metrics.successRate": "Success rate",
  "modules.settings.channels.metrics.atCapacity": "Channels at capacity",
  "modules.settings.channels.metrics.blockedToday": "Restricted sends today",
  "modules.settings.channels.actions.add": "Add channel",
  "modules.settings.channels.actions.refresh": "Refresh",
  "modules.settings.channels.actions.edit": "Edit",
  "modules.settings.channels.actions.pause": "Pause channel",
  "modules.settings.channels.actions.activate": "Activate channel",
  "modules.settings.channels.actions.cancel": "Cancel",
  "modules.settings.channels.actions.confirm": "Confirm",
  "modules.settings.channels.actions.create": "Create channel",
  "modules.settings.channels.actions.creating": "Creating…",
  "modules.settings.channels.actions.save": "Save changes",
  "modules.settings.channels.actions.saving": "Saving…",
  "modules.settings.channels.actions.clearCache": "Clear cache",
  "modules.settings.channels.table.id": "ID",
  "modules.settings.channels.table.name": "Name",
  "modules.settings.channels.table.number": "Number",
  "modules.settings.channels.table.status": "Status",
  "modules.settings.channels.table.weight": "Weight",
  "modules.settings.channels.table.usageToday": "Usage today",
  "modules.settings.channels.table.dailyLimit": "Daily limit",
  "modules.settings.channels.table.msgMin": "Msg/min",
  "modules.settings.channels.table.restrictions": "Restrictions",
  "modules.settings.channels.table.actions": "Actions",
  "modules.settings.channels.status.paused": "Paused",
  "modules.settings.channels.status.at_limit": "At limit",
  "modules.settings.channels.status.near_limit": "Near limit",
  "modules.settings.channels.status.warmup": "Warmup/Test",
  "modules.settings.channels.status.normal": "Normal",
  "modules.settings.channels.pagination.total": "Total: {n} channels",
  "modules.settings.channels.pagination.perPage": "page",
  "modules.settings.channels.create.title": "Add new channel",
  "modules.settings.channels.create.description":
    "Fill connection data and limits. The backend may create the connection automatically.",
  "modules.settings.channels.edit.title": "Edit channel",
  "modules.settings.channels.edit.titleWithName": "Edit channel: {name}",
  "modules.settings.channels.edit.description":
    "Adjust weight, limits, and restrictions. Name is not sent to the config API.",
  "modules.settings.channels.edit.nameReadOnlyHint":
    "Read-only: the config PATCH does not update the name (see API docs).",
  "modules.settings.channels.fields.name": "Channel name",
  "modules.settings.channels.fields.phoneNumberId": "Phone number ID (Meta)",
  "modules.settings.channels.fields.phoneNumberIdHint": "Identifier of the number in Meta/WhatsApp Business.",
  "modules.settings.channels.fields.phoneNumber": "Phone number",
  "modules.settings.channels.fields.bot": "Bot",
  "modules.settings.channels.fields.botPlaceholder": "Select a bot",
  "modules.settings.channels.fields.connectionToken": "Meta API token",
  "modules.settings.channels.fields.connectionTokenHint": "Access token (keep it secret).",
  "modules.settings.channels.fields.connectionUrl": "Connection URL",
  "modules.settings.channels.fields.connectionUrlHint": "Webhook or connection URL from Meta.",
  "modules.settings.channels.fields.weight": "Initial weight (0–100)",
  "modules.settings.channels.fields.templateDailyLimit": "Daily limit",
  "modules.settings.channels.fields.messagesPerMinute": "Throughput",
  "modules.settings.channels.fields.msgsPerDaySuffix": "msgs/day",
  "modules.settings.channels.fields.msgsPerMinSuffix": "msgs/min",
  "modules.settings.channels.restrictionsTitle": "Message restrictions",
  "modules.settings.channels.blockMarketing": "Block MARKETING messages",
  "modules.settings.channels.blockMarketingHint": "Blocks templates classified as marketing.",
  "modules.settings.channels.blockUtility": "Block UTILITY messages",
  "modules.settings.channels.blockUtilityHint": "Blocks templates classified as utility.",
  "modules.settings.channels.weightHint.normal": "Normal load",
  "modules.settings.channels.weightHint.warmup": "Warmup / test",
  "modules.settings.channels.weightHint.high": "High rotation share",
  "modules.settings.channels.unlimitedHint": "Tip: use -1 for unlimited.",
  "modules.settings.channels.usageCurrent": "Current usage",
  "modules.settings.channels.usageToday": "Today",
  "modules.settings.channels.usageThisMinute": "This minute",
  "modules.settings.channels.showSecret": "Show token",
  "modules.settings.channels.hideSecret": "Hide token",
  "modules.settings.channels.validation.nameMin": "Enter at least 3 characters.",
  "modules.settings.channels.validation.required": "Required field.",
  "modules.settings.channels.validation.limitMin": "Enter a number ≥ -1.",
  "modules.settings.channels.toast.createSuccess": "Channel created.",
  "modules.settings.channels.toast.createError": "Failed to create channel.",
  "modules.settings.channels.toast.updateSuccess": "Settings saved.",
  "modules.settings.channels.toast.updateError": "Failed to save settings.",
  "modules.settings.channels.toast.paused": "Channel paused.",
  "modules.settings.channels.toast.activated": "Channel activated.",
  "modules.settings.channels.toast.weightError": "Failed to update weight.",
  "modules.settings.channels.toast.cacheCleared": "Cache cleared.",
  "modules.settings.channels.toast.cacheError": "Failed to clear cache.",
  "modules.settings.channels.confirmPause.title": "Pause this channel?",
  "modules.settings.channels.confirmPause.description":
    "Weight will be set to 0 and the channel stops rotating until reactivated.",
  "modules.settings.channels.confirmActivate.title": "Activate this channel?",
  "modules.settings.channels.confirmActivate.description": "Weight will be set to 100 (active).",
  "modules.settings.channels.clearCache.title": "Clear channel cache?",
  "modules.settings.channels.clearCache.description":
    "This may affect immediate message delivery. Continue?",
  "modules.settings.channels.clearCache.confirm": "Clear",
  "modules.settings.renegotiationConfig.validation.maxLateFee":
    "Maximum allowed value is 2%.",
  "modules.settings.renegotiationConfig.validation.maxMonthlyInterest":
    "Maximum allowed value is 1%.",
  "modules.settings.renegotiationConfig.validation.agentNameRequired":
    "Agent name is required.",
  "modules.settings.renegotiationConfig.toast.saving": "Saving changes...",
  "modules.settings.renegotiationConfig.toast.success":
    "Settings saved successfully.",
  "modules.settings.renegotiationConfig.toast.error":
    "Failed to save settings.",
  "modules.settings.renegotiationConfig.errorLoading":
    "Could not load agent settings.",
  "modules.settings.renegotiationConfig.loading": "Loading...",
  "modules.settings.renegotiationConfig.agentSection.title": "Agent settings",
  "modules.settings.renegotiationConfig.agentSection.description":
    "Agent name and company description for conversation context.",
  "modules.settings.renegotiationConfig.debtSection.title":
    "Renegotiation settings",
  "modules.settings.renegotiationConfig.debtSection.description":
    "Calculation rules and limits applied to debts.",
  "modules.settings.renegotiationConfig.fields.agentName.label": "Agent name",
  "modules.settings.renegotiationConfig.fields.agentName.info":
    "Identifier name for the collection agent",
  "modules.settings.renegotiationConfig.fields.companyDetails.label":
    "Company description",
  "modules.settings.renegotiationConfig.fields.companyDetails.info":
    "Text used by the agent to answer questions like \"who is the company?\" or \"who is charging me?\"",
  "modules.settings.renegotiationConfig.fields.lateFee.label": "Late fee (%)",
  "modules.settings.renegotiationConfig.fields.lateFee.info":
    "Percentage applied when payment is overdue",
  "modules.settings.renegotiationConfig.fields.monthlyInterest.label":
    "Monthly interest (%)",
  "modules.settings.renegotiationConfig.fields.monthlyInterest.info":
    "Monthly interest applied over overdue amount",
  "modules.settings.renegotiationConfig.fields.serviceFees.label":
    "Service fees (Judicial collection) (%)",
  "modules.settings.renegotiationConfig.fields.serviceFees.info":
    "Service fee percentage in case of judicial collection",
  "modules.settings.renegotiationConfig.fields.cashDiscount.label":
    "Cash payment discount (%)",
  "modules.settings.renegotiationConfig.fields.cashDiscount.info":
    "Discount applied for one-time payment",
  "modules.settings.renegotiationConfig.fields.applyOver.label": "Apply over",
  "modules.settings.renegotiationConfig.fields.applyOver.info":
    "Defines whether calculations are done over original or corrected amount",
  "modules.settings.renegotiationConfig.fields.applyOver.corrected":
    "Corrected amount",
  "modules.settings.renegotiationConfig.fields.minInstallmentValue.label":
    "Minimum installment value (R$)",
  "modules.settings.renegotiationConfig.fields.minInstallmentValue.info":
    "Minimum allowed value for each installment",
  "modules.settings.renegotiationConfig.fields.maxInstallment.label":
    "Maximum installment count",
  "modules.settings.renegotiationConfig.fields.maxInstallment.info":
    "Maximum number of installments allowed in agreement",
  "modules.settings.renegotiationConfig.fields.prescriptionYears.label":
    "Prescription deadline (years)",
  "modules.settings.renegotiationConfig.fields.prescriptionYears.info":
    "Number of years after debt registration when it becomes prescribed and can no longer be charged",
  "modules.settings.renegotiationConfig.actions.save": "Save",
  "modules.settings.renegotiationConfig.actions.saving": "Saving...",
  "modules.settings.renegotiationConfig.lastUpdate": "Last update",
} as const;

