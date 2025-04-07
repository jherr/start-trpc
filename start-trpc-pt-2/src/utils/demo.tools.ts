import { experimental_createMCPClient, tool } from "ai";
import { z } from "zod";
import { createClerkToolkit } from "@clerk/agent-toolkit/ai-sdk";
import { getAuth } from "@clerk/tanstack-start/server";
import { getWebRequest } from "vinxi/http";

import { trpcClient } from "@/integrations/tanstack-query/root-provider";

const getGuitars = tool({
  description: "Get all products from the database",
  parameters: z.object({}),
  execute: async () => {
    return await trpcClient.guitars.list.query();
  },
});

const recommendGuitar = tool({
  description: "Use this tool to recommend a guitar to the user",
  parameters: z.object({
    id: z.string().describe("The id of the guitar to recommend"),
  }),
});

const addGuitarToCart = tool({
  description: "Use this tool to add a guitar to the user's cart",
  parameters: z.object({
    id: z.string().describe("The id of the guitar to add to the cart"),
  }),
});

export default async function getTools() {
  const clerkTools = await createClerkToolkit({
    authContext: await getAuth(getWebRequest()),
  });
  return {
    ...clerkTools.users(),
    getGuitars,
    addGuitarToCart,
    recommendGuitar,
  };
}
