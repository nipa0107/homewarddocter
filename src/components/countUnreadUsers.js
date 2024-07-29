export const countUnreadUsers = (allUsers, data) => {
  const unreadUsers = allUsers.filter((user) => {
    const lastMessage = user.lastMessage;
    return (
      lastMessage &&
      lastMessage.senderModel === "User" &&
      lastMessage.sender._id !== data._id && // Exclude messages sent by the current user
      !lastMessage.isRead
    );
  });
  return unreadUsers.length;
};