import type { User } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {

  return { id: user.id, username: user.username, imageUrl: user.imageUrl };
}

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
      orderBy: [{createdAt: "desc"}],
    });

    // array of users
    const users = (await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })).map(filterUserForClient);

    console.log(users);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId); //author may be undefined here

      if (!author) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Author for post not found" }); //error check confirms author is not undefined, and can be passed through

      return {
        post,
        author: {
          ...author,
          username: author.username!, //asserts that author.username is not undefined
        }
      }
    });
  }),

  create: privateProcedure
    .input(
      z.object({ content: z.string().emoji().min(1).max(280) }) //using trpc's Zod to validate input type is correct
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser.userId!;

      const post = await ctx.db.post.create({
        data: {
          authorId,
          content: input.content,
        }
      });

      return post;
    }),
});
