/** Mensagem de texto. */
export interface ChatMessageText {
  type: "text";
  text: string;
}

/** Item de botão/quick reply. */
export interface ChatMessageButtonItem {
  title: string;
  type?: string;
}

/** Mensagem com título e botões (quick replies). */
export interface ChatMessageButton {
  type: "button";
  title: string;
  items?: ChatMessageButtonItem[];
}

/** Mensagem com imagem (anexo). */
export interface ChatMessageImage {
  type: "image";
  mediaId?: string;
  url?: string;
}

/** Mensagem com documento/PDF (anexo). */
export interface ChatMessageDocument {
  type: "document";
  mediaId?: string;
  url?: string;
  fileName?: string;
}

/** Mensagem de áudio (ex.: WhatsApp .ogg). */
export interface ChatMessageAudio {
  type: "audio";
  mediaId?: string;
  url?: string;
  fileName?: string;
  transcription?: string;
}

export interface ChatMessagePixData {
  code?: string;
  company?: string;
  key?: string;
  keyType?: string;
  expiration?: string;
}

export interface ChatMessagePixDynamicCodeItem {
  id?: string;
  title?: string;
  amount?: number;
  pixData?: ChatMessagePixData;
}

/** Mensagem com dados de Pix dinâmico para copiar e pagar. */
export interface ChatMessagePixDynamicCode {
  type: "pix_dynamic_code" | "dynamic_pix_message";
  text?: string;
  items?: ChatMessagePixDynamicCodeItem[];
}

export type ChatMessage =
  | ChatMessageText
  | ChatMessageButton
  | ChatMessageImage
  | ChatMessageDocument
  | ChatMessageAudio
  | ChatMessagePixDynamicCode;

/** Um chat na lista do histórico. sender 1 = usuário, 2 = bot. */
export interface ConversationChat {
  id: string;
  date: string;
  message: ChatMessage;
  sender: number;
  conversationId: string;
  tag: string | null;
  status: number;
  error: string | null;
}

/** Anexo de mídia retornado na resposta (permite resolver URL por mediaId). */
export interface MediaAtt {
  id: string;
  mediaId: string;
  conversationId: string;
  fileName?: string;
  publicUrl?: string;
  type?: string;
}

export interface ConversationHistoryResponse {
  total: number;
  count: number;
  chats: ConversationChat[];
  chatType: string;
  mediasAtt: MediaAtt[];
  conversations: Array<{
    id: string;
    createdAt: string;
    updatedAt: string;
    companyId: string;
  }>;
}
