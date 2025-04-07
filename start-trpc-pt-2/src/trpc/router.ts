import { TRPCError } from "@trpc/server";
import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { getAuth } from "@clerk/tanstack-start/server";
import { getWebRequest } from "vinxi/http";

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

type Cart = {
  guitars: Array<number>;
};

const cartsByUser = new Map<string, Cart>();

const cartRouter = {
  get: publicProcedure.query(async () => {
    const { userId } = await getAuth(getWebRequest());
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return cartsByUser.get(userId) || { guitars: [] };
  }),
  add: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { userId } = await getAuth(getWebRequest());
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      let cart = cartsByUser.get(userId);
      if (!cart) {
        cartsByUser.set(userId, { guitars: [] });
        cart = cartsByUser.get(userId);
      }
      const guitar = guitars.find((guitar) => guitar.id === input.id);
      if (!guitar) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (!cart) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      cart.guitars.push(guitar.id);
      return cart;
    }),
};

export const trpcRouter = createTRPCRouter({
  guitars: guitarRouter,
  cart: cartRouter,
});
export type TRPCRouter = typeof trpcRouter;
