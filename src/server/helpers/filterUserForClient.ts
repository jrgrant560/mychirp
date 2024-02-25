import type { User } from "@clerk/nextjs/server";

// server-side filter that limits how much data is sent to the client, maintaining security and reducing network load
export const filterUserForClient = (user: User) => {

  return { id: user.id, username: user.username, imageUrl: user.imageUrl };
}
