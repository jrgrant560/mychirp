import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import type { Post } from "@prisma/client";


const addUserDataToPosts = async (posts: Post[]) => {
  // array of users
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId); //author may be undefined here

    if (!author)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      }); //error check confirms author is not undefined, and can be passed through

    return {
      post,
      author: {
        ...author,
        username: author.username!, //asserts that author.username is not undefined
      },
    };
  });
};

// Theo tip: "there are no type definitions in this file. All typechecks are performed by the TRPC validators, which enforce typechecks through strict validation and inference.""

// Ratelimiter that allows 2 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

// this file runs on the server end

export const postsRouter = createTRPCRouter({
  // hello: publicProcedure
  //   .input(z.object({ text: z.string() }))
  //   .query(({ input }) => {
  //     return {
  //       greeting: `Hello ${input.text}`,
  //     };
  //   }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return addUserDataToPosts(posts);
  }),

  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.db.post.findMany({
        where: {
          authorId: input.userId,
        },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
      })
      .then(addUserDataToPosts),
    ),

  create: privateProcedure
    //using trpc's Zod to validate input type is correct
    .input(
      z.object({
        content: z
          .string()
          .emoji("Only emojis are allowed bro! 👎") //custom error message if input is not correct
          .min(1)
          .max(280),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser.userId!;

      // ratelimit the user
      const { success } = await ratelimit.limit(authorId);
      if (!success) {
        // TASK: need Zod error here to be sent to toast, so the user knows they are posting too frequently
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You are posting too frequently",
        });
      }

      const post = await ctx.db.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),
});
