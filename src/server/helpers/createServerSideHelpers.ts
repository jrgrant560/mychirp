import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import superjson from "superjson";

export const generateSSHelper = () => createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null }, //currentUser is null because we are not using authentication?
    transformer: superjson,
  });
