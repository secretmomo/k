export interface LarkMessageReceiveEvent {
  event_id?: string;
  app_id?: string;
  event_type?: string;
  tenant_key?: string;
  message?: {
    chat_id: string;
    chat_type: string;
    content: string;
    message_id: string;
    message_type: string;
  };
  sender?: {
    sender_id?: {
      open_id?: string;
      union_id?: string;
      user_id?: string;
    };
    sender_type?: string;
    tenant_key?: string;
  };
}
