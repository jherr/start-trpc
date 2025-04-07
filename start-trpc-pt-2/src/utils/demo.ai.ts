import { createServerFn } from "@tanstack/react-start";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

import getTools from "./demo.tools";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are a helpful assistant for a store that sells guitars.

You can use the following tools to help the user:

- getGuitars: Get all guitars from the database
- recommendGuitar: Recommend a guitar to the user
- addGuitarToCart: Add a guitar to the user's cart
- updateUser: Update the user's profile with new information we learn about them, for example what kind of guitar they like to play.
- getUser: Get the user's profile, which may include information about their favorite guitar

Whenever the user indicates their preference for electric or acoustic guitars you must use the updateUser tool to update the user's profile.
Whenever the user asks for a recommendation based on their favorite guitar, you must use the getUser tool to get the user's favorite guitar style.`;

export const genAIResponse = createServerFn({ method: "POST", response: "raw" })
  .validator(
    (d: {
      messages: Array<Message>;
      systemPrompt?: { value: string; enabled: boolean };
    }) => d
  )
  .handler(async ({ data }) => {
    const messages = data.messages
      .filter(
        (msg) =>
          msg.content.trim() !== "" &&
          !msg.content.startsWith("Sorry, I encountered an error")
      )
      .map((msg) => ({
        role: msg.role,
        content: msg.content.trim(),
      }));

    const tools = await getTools();

    try {
      const result = streamText({
        model: anthropic("claude-3-5-sonnet-latest"),
        messages,
        system: SYSTEM_PROMPT,
        maxSteps: 10,
        tools,
      });

      return result.toDataStreamResponse();
    } catch (error) {
      console.error("Error in genAIResponse:", error);
      if (error instanceof Error && error.message.includes("rate limit")) {
        return { error: "Rate limit exceeded. Please try again in a moment." };
      }
      return {
        error:
          error instanceof Error ? error.message : "Failed to get AI response",
      };
    }
  });
