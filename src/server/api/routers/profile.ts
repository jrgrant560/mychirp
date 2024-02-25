import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";


//server-side route
export const profileRouter = createTRPCRouter({

    // response method to get user by username
    getUserByUsername: publicProcedure
        .input(z.object({ username: z.string() }))
        .query(async ({ input }) => {

            //get user by username
            const [user] = await clerkClient.users.getUserList({

                username: [input.username],

            });

            if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

            return filterUserForClient(user);
        })

});
