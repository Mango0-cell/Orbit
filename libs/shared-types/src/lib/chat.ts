/** Chat-domain contract types (direct conversations + messages). Framework-agnostic. */

export interface ConversationResponse {
  conversationId: string;
  /** The two participants (logical refs to db_users), ordered. */
  participantIds: [string, string];
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  messageId: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  body: string;
  createdAt: string;
}
