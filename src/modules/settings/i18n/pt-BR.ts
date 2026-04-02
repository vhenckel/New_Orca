/** Mensagens do módulo Configurações (empresa). */
export const settingsPtBR = {
  "modules.settings.title": "Configurações",
  "modules.settings.description":
    "Ajustes do agente, regras de renegociação e canais de atendimento.",
  "modules.settings.routes.agent.label": "Agente",
  "modules.settings.routes.agent.description":
    "Nome do agente e descrição da empresa para contexto da conversa.",
  "modules.settings.routes.renegotiation.label": "Renegociação",
  "modules.settings.routes.renegotiation.description":
    "Regras de cálculo e limites aplicados nas dívidas.",
  "modules.settings.routes.channels.label": "Canais",
  "modules.settings.routes.channels.description":
    "Gerencie canais de envio, limites e restrições de mensagem.",
  "modules.settings.channels.pageTitle": "Gerenciamento de canais",
  "modules.settings.channels.loadError": "Não foi possível carregar os canais.",
  "modules.settings.channels.loading": "Carregando canais…",
  "modules.settings.channels.empty": "Nenhum canal encontrado.",
  "modules.settings.channels.metrics.active": "Canais ativos",
  "modules.settings.channels.metrics.messagesToday": "Mensagens hoje",
  "modules.settings.channels.metrics.successRate": "Taxa de sucesso",
  "modules.settings.channels.metrics.atCapacity": "Canais no limite",
  "modules.settings.channels.metrics.blockedToday": "Envios restritos hoje",
  "modules.settings.channels.actions.add": "Adicionar canal",
  "modules.settings.channels.actions.refresh": "Atualizar",
  "modules.settings.channels.actions.edit": "Editar",
  "modules.settings.channels.actions.pause": "Pausar canal",
  "modules.settings.channels.actions.activate": "Ativar canal",
  "modules.settings.channels.actions.cancel": "Cancelar",
  "modules.settings.channels.actions.confirm": "Confirmar",
  "modules.settings.channels.actions.create": "Criar canal",
  "modules.settings.channels.actions.creating": "Criando…",
  "modules.settings.channels.actions.save": "Salvar alterações",
  "modules.settings.channels.actions.saving": "Salvando…",
  "modules.settings.channels.actions.clearCache": "Limpar cache",
  "modules.settings.channels.table.id": "ID",
  "modules.settings.channels.table.name": "Nome",
  "modules.settings.channels.table.number": "Número",
  "modules.settings.channels.table.status": "Status",
  "modules.settings.channels.table.weight": "Peso",
  "modules.settings.channels.table.usageToday": "Uso hoje",
  "modules.settings.channels.table.dailyLimit": "Limite diário",
  "modules.settings.channels.table.msgMin": "Msg/min",
  "modules.settings.channels.table.restrictions": "Restrições",
  "modules.settings.channels.table.actions": "Ações",
  "modules.settings.channels.status.paused": "Pausado",
  "modules.settings.channels.status.at_limit": "No limite",
  "modules.settings.channels.status.near_limit": "Próximo ao limite",
  "modules.settings.channels.status.warmup": "Warmup/Teste",
  "modules.settings.channels.status.normal": "Normal",
  "modules.settings.channels.pagination.total": "Total: {n} canais",
  "modules.settings.channels.pagination.perPage": "página",
  "modules.settings.channels.create.title": "Adicionar novo canal",
  "modules.settings.channels.create.description":
    "Preencha os dados de conexão e limites. O backend pode criar a conexão automaticamente.",
  "modules.settings.channels.edit.title": "Editar canal",
  "modules.settings.channels.edit.titleWithName": "Editar canal: {name}",
  "modules.settings.channels.edit.description": "Ajuste peso, limites e restrições. O nome não é enviado na API de configuração.",
  "modules.settings.channels.edit.nameReadOnlyHint":
    "Somente leitura: o PATCH de configuração não altera o nome (veja documentação da API).",
  "modules.settings.channels.fields.name": "Nome do canal",
  "modules.settings.channels.fields.phoneNumberId": "Phone Number ID (Meta)",
  "modules.settings.channels.fields.phoneNumberIdHint": "Identificador do número na Meta/WhatsApp Business.",
  "modules.settings.channels.fields.phoneNumber": "Número de telefone",
  "modules.settings.channels.fields.bot": "Bot",
  "modules.settings.channels.fields.botPlaceholder": "Selecione o bot",
  "modules.settings.channels.fields.connectionToken": "Token da Meta API",
  "modules.settings.channels.fields.connectionTokenHint": "Token de acesso da API (mantenha em sigilo).",
  "modules.settings.channels.fields.connectionUrl": "URL de conexão",
  "modules.settings.channels.fields.connectionUrlHint": "URL do webhook ou endpoint de conexão informado pela Meta.",
  "modules.settings.channels.fields.weight": "Peso inicial (0–100)",
  "modules.settings.channels.fields.templateDailyLimit": "Limite diário",
  "modules.settings.channels.fields.messagesPerMinute": "Throughput",
  "modules.settings.channels.fields.msgsPerDaySuffix": "msgs/dia",
  "modules.settings.channels.fields.msgsPerMinSuffix": "msgs/min",
  "modules.settings.channels.restrictionsTitle": "Restrições de mensagem",
  "modules.settings.channels.blockMarketing": "Bloquear mensagens MARKETING",
  "modules.settings.channels.blockMarketingHint": "Evita envio de templates classificados como marketing.",
  "modules.settings.channels.blockUtility": "Bloquear mensagens UTILITY",
  "modules.settings.channels.blockUtilityHint": "Evita envio de templates classificados como utilidade.",
  "modules.settings.channels.weightHint.normal": "Carga normal",
  "modules.settings.channels.weightHint.warmup": "Warmup / teste",
  "modules.settings.channels.weightHint.high": "Alta participação na rotação",
  "modules.settings.channels.unlimitedHint": "Dica: use -1 para ilimitado.",
  "modules.settings.channels.usageCurrent": "Uso atual",
  "modules.settings.channels.usageToday": "Hoje",
  "modules.settings.channels.usageThisMinute": "Este minuto",
  "modules.settings.channels.showSecret": "Mostrar token",
  "modules.settings.channels.hideSecret": "Ocultar token",
  "modules.settings.channels.validation.nameMin": "Informe pelo menos 3 caracteres.",
  "modules.settings.channels.validation.required": "Campo obrigatório.",
  "modules.settings.channels.validation.limitMin": "Informe um número ≥ -1.",
  "modules.settings.channels.toast.createSuccess": "Canal criado com sucesso.",
  "modules.settings.channels.toast.createError": "Erro ao criar canal.",
  "modules.settings.channels.toast.updateSuccess": "Configurações salvas.",
  "modules.settings.channels.toast.updateError": "Erro ao salvar configurações.",
  "modules.settings.channels.toast.paused": "Canal pausado.",
  "modules.settings.channels.toast.activated": "Canal ativado.",
  "modules.settings.channels.toast.weightError": "Erro ao atualizar peso.",
  "modules.settings.channels.toast.cacheCleared": "Cache limpo.",
  "modules.settings.channels.toast.cacheError": "Erro ao limpar cache.",
  "modules.settings.channels.confirmPause.title": "Pausar este canal?",
  "modules.settings.channels.confirmPause.description":
    "O peso será definido como 0 e o canal deixa de participar da rotação até ser reativado.",
  "modules.settings.channels.confirmActivate.title": "Ativar este canal?",
  "modules.settings.channels.confirmActivate.description": "O peso será definido como 100 (ativo).",
  "modules.settings.channels.clearCache.title": "Limpar cache do canal?",
  "modules.settings.channels.clearCache.description":
    "Isso pode afetar o envio imediato de mensagens. Deseja continuar?",
  "modules.settings.channels.clearCache.confirm": "Limpar",
  "modules.settings.renegotiationConfig.validation.maxLateFee":
    "O valor máximo permitido é de 2%.",
  "modules.settings.renegotiationConfig.validation.maxMonthlyInterest":
    "O valor máximo permitido é de 1%.",
  "modules.settings.renegotiationConfig.validation.agentNameRequired":
    "Informe o nome do agente.",
  "modules.settings.renegotiationConfig.toast.saving": "Salvando alterações...",
  "modules.settings.renegotiationConfig.toast.success":
    "Configurações salvas com sucesso.",
  "modules.settings.renegotiationConfig.toast.error":
    "Erro ao salvar configurações.",
  "modules.settings.renegotiationConfig.errorLoading":
    "Não foi possível carregar as configurações do agente.",
  "modules.settings.renegotiationConfig.loading": "Carregando...",
  "modules.settings.renegotiationConfig.agentSection.title":
    "Configuração do agente",
  "modules.settings.renegotiationConfig.agentSection.description":
    "Nome do agente e descrição da empresa para contexto da conversa.",
  "modules.settings.renegotiationConfig.debtSection.title":
    "Configuração de renegociação",
  "modules.settings.renegotiationConfig.debtSection.description":
    "Regras de cálculo e limites aplicados nas dívidas.",
  "modules.settings.renegotiationConfig.fields.agentName.label": "Nome do agente",
  "modules.settings.renegotiationConfig.fields.agentName.info":
    "Nome identificador do agente de cobrança",
  "modules.settings.renegotiationConfig.fields.companyDetails.label":
    "Descrição da empresa",
  "modules.settings.renegotiationConfig.fields.companyDetails.info":
    "Texto usado pelo agente para responder perguntas como \"quem é a empresa?\" ou \"quem está me cobrando?\"",
  "modules.settings.renegotiationConfig.fields.lateFee.label":
    "Multa por atraso (%)",
  "modules.settings.renegotiationConfig.fields.lateFee.info":
    "Percentual aplicado quando há atraso no pagamento",
  "modules.settings.renegotiationConfig.fields.monthlyInterest.label":
    "Juros por mês (%)",
  "modules.settings.renegotiationConfig.fields.monthlyInterest.info":
    "Juros mensais aplicados sobre o valor em atraso",
  "modules.settings.renegotiationConfig.fields.serviceFees.label":
    "Honorários (Cobrança Judicial) (%)",
  "modules.settings.renegotiationConfig.fields.serviceFees.info":
    "Percentual de honorários em caso de cobrança judicial",
  "modules.settings.renegotiationConfig.fields.cashDiscount.label":
    "Desconto para pagamento à vista (%)",
  "modules.settings.renegotiationConfig.fields.cashDiscount.info":
    "Desconto aplicado para pagamento em parcela única",
  "modules.settings.renegotiationConfig.fields.applyOver.label": "Aplicar sobre",
  "modules.settings.renegotiationConfig.fields.applyOver.info":
    "Define se os cálculos serão feitos sobre o valor original ou corrigido",
  "modules.settings.renegotiationConfig.fields.applyOver.corrected":
    "Valor corrigido",
  "modules.settings.renegotiationConfig.fields.minInstallmentValue.label":
    "Valor mínimo da parcela (R$)",
  "modules.settings.renegotiationConfig.fields.minInstallmentValue.info":
    "Valor mínimo permitido para cada parcela",
  "modules.settings.renegotiationConfig.fields.maxInstallment.label":
    "Quantidade máxima de parcelas",
  "modules.settings.renegotiationConfig.fields.maxInstallment.info":
    "Número máximo de parcelas permitidas no acordo",
  "modules.settings.renegotiationConfig.fields.prescriptionYears.label":
    "Prazo de prescrição (anos)",
  "modules.settings.renegotiationConfig.fields.prescriptionYears.info":
    "Número de anos após o registro da dívida em que ela será considerada prescrita e não poderá mais ser cobrada",
  "modules.settings.renegotiationConfig.actions.save": "Salvar",
  "modules.settings.renegotiationConfig.actions.saving": "Salvando...",
  "modules.settings.renegotiationConfig.lastUpdate": "Última atualização",
} as const;
