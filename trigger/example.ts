import { logger, metadata, task, wait } from "@trigger.dev/sdk";

export const helloWorldTask = task({
  id: "hello-world",
  maxDuration: 300,
  run: async (payload: { message: string }, { ctx }) => {
    metadata.set("status", "running");
    logger.log("Hello, world!", { payload, ctx });

    await wait.for({ seconds: 2 });
    metadata.set("progress", 50);

    await wait.for({ seconds: 3 });
    metadata.set("progress", 100).set("status", "completed");

    return {
      message: "Hello, world!",
    }
  },
});