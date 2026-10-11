import type { Conversation } from "@/types/domain";

/** The other person in a two-party conversation. */
export function otherParticipant(conversation: Conversation, userId: string | undefined) {
  return conversation.participants.find((p) => p.userId !== userId)?.user;
}

/** Display name from public profile fields only — never an email address. */
export function participantName(user: ReturnType<typeof otherParticipant>, fallback: string): string {
  return (
    [user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(" ") ||
    user?.profile?.company ||
    fallback
  );
}
