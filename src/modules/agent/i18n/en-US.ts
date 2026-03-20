/** Mensagens do módulo Agente. */
export const agentEnUS = {
  "modules.agent.title": "Agent",
  "modules.agent.description": "Renegotiation agent configuration.",
  "modules.agent.routes.renegotiationConfig.label": "Renegotiation settings",
  "modules.agent.routes.renegotiationConfig.description": "Update parameters used by the agent during renegotiations.",
  "modules.agent.renegotiationConfig.validation.maxLateFee":
    "Maximum allowed value is 2%.",
  "modules.agent.renegotiationConfig.validation.maxMonthlyInterest":
    "Maximum allowed value is 1%.",
  "modules.agent.renegotiationConfig.validation.agentNameRequired":
    "Agent name is required.",
  "modules.agent.renegotiationConfig.toast.saving": "Saving changes...",
  "modules.agent.renegotiationConfig.toast.success":
    "Settings saved successfully.",
  "modules.agent.renegotiationConfig.toast.error":
    "Failed to save settings.",
  "modules.agent.renegotiationConfig.errorLoading":
    "Could not load agent settings.",
  "modules.agent.renegotiationConfig.loading": "Loading...",
  "modules.agent.renegotiationConfig.agentSection.title": "Agent settings",
  "modules.agent.renegotiationConfig.agentSection.description":
    "Agent name and company description for conversation context.",
  "modules.agent.renegotiationConfig.debtSection.title":
    "Renegotiation settings",
  "modules.agent.renegotiationConfig.debtSection.description":
    "Calculation rules and limits applied to debts.",
  "modules.agent.renegotiationConfig.fields.agentName.label": "Agent name",
  "modules.agent.renegotiationConfig.fields.agentName.info":
    "Identifier name for the collection agent",
  "modules.agent.renegotiationConfig.fields.companyDetails.label":
    "Company description",
  "modules.agent.renegotiationConfig.fields.companyDetails.info":
    "Text used by the agent to answer questions like \"who is the company?\" or \"who is charging me?\"",
  "modules.agent.renegotiationConfig.fields.lateFee.label": "Late fee (%)",
  "modules.agent.renegotiationConfig.fields.lateFee.info":
    "Percentage applied when payment is overdue",
  "modules.agent.renegotiationConfig.fields.monthlyInterest.label":
    "Monthly interest (%)",
  "modules.agent.renegotiationConfig.fields.monthlyInterest.info":
    "Monthly interest applied over overdue amount",
  "modules.agent.renegotiationConfig.fields.serviceFees.label":
    "Service fees (Judicial collection) (%)",
  "modules.agent.renegotiationConfig.fields.serviceFees.info":
    "Service fee percentage in case of judicial collection",
  "modules.agent.renegotiationConfig.fields.cashDiscount.label":
    "Cash payment discount (%)",
  "modules.agent.renegotiationConfig.fields.cashDiscount.info":
    "Discount applied for one-time payment",
  "modules.agent.renegotiationConfig.fields.applyOver.label": "Apply over",
  "modules.agent.renegotiationConfig.fields.applyOver.info":
    "Defines whether calculations are done over original or corrected amount",
  "modules.agent.renegotiationConfig.fields.applyOver.corrected":
    "Corrected amount",
  "modules.agent.renegotiationConfig.fields.minInstallmentValue.label":
    "Minimum installment value (R$)",
  "modules.agent.renegotiationConfig.fields.minInstallmentValue.info":
    "Minimum allowed value for each installment",
  "modules.agent.renegotiationConfig.fields.maxInstallment.label":
    "Maximum installment count",
  "modules.agent.renegotiationConfig.fields.maxInstallment.info":
    "Maximum number of installments allowed in agreement",
  "modules.agent.renegotiationConfig.fields.prescriptionYears.label":
    "Prescription deadline (years)",
  "modules.agent.renegotiationConfig.fields.prescriptionYears.info":
    "Number of years after debt registration when it becomes prescribed and can no longer be charged",
  "modules.agent.renegotiationConfig.actions.save": "Save",
  "modules.agent.renegotiationConfig.actions.saving": "Saving...",
  "modules.agent.renegotiationConfig.lastUpdate": "Last update",
} as const;

