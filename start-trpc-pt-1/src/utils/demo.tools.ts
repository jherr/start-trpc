import { experimental_createMCPClient, tool } from "ai";
import { z } from "zod";

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

export default async function getTools() {
  // const mcpTools = await mcpCient.tools()
  return {
    // ...mcpTools,
    getGuitars,
    recommendGuitar,
  };
}
