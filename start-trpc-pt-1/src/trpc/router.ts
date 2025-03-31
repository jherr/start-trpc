import { TRPCError } from "@trpc/server";
import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./init";

import guitars from "@/data/example-guitars";

const guitarRouter = {
  list: publicProcedure.query(async () => guitars),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const guitar = guitars.find((guitar) => guitar.id === input.id);
      if (!guitar) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return guitar;
    }),
} satisfies TRPCRouterRecord;

export const trpcRouter = createTRPCRouter({
  guitars: guitarRouter,
});
export type TRPCRouter = typeof trpcRouter;
