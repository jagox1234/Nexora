// Mensajería interna (chat negocio-cliente)
export const chats = [];

export function sendMessage({ from, to, message }) {
  const chat = { id: Date.now().toString(), from, to, message, sentAt: new Date().toISOString() };
  chats.push(chat);
  return chat;
}

export function listMessages(userId) {
  return chats.filter(c => c.from === userId || c.to === userId);
}
