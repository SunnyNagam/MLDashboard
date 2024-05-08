import { ChatOpenAI } from "@langchain/openai";
import { createOpenAIFunctionsAgent, createReactAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor } from "langchain/agents";
import Cookies from "vue-cookies";
import { Calculator } from "@langchain/community/tools/calculator";
import { DynamicTool, DynamicStructuredTool } from "@langchain/core/tools";
import { useApi } from "@/useAPI.js";
import { pull } from "langchain/hub";
import { z } from "zod";

const { setApiKey, getApiKey } = useApi();

const openRouterApiKey = Cookies.get("OPEN_ROUTER_API_KEY");

if (!openRouterApiKey) {
  console.error("OPEN_ROUTER_API_KEY cookie is not defined.");
  // Handle the missing API key case here
  // You could return or throw an error, or perhaps initialize `llm` with a mock value
  //return;
}

const llm = openRouterApiKey
  ? new ChatOpenAI(
      {
        model: "openai/gpt-3.5-turbo-0125",
        //model: "meta-llama/llama-3-70b-instruct",
        //model: "mistralai/mixtral-8x7b-instruct",
        //model: "mistralai/mistral-7b-instruct:free",
        temperature: 0.2,
        maxTokens: 3000,
        streaming: true,
        openAIApiKey: Cookies.get("OPEN_ROUTER_API_KEY"),
      },
      {
        basePath: "https://openrouter.ai/api/v1",
        baseOptions: {
          headers: {
            "HTTP-Referer": "https://localhost:3000/",
            "X-Title": "Langchain.js Testing",
          },
        },
      }
    )
  : null;

const addItem = async (text, parentId = null) => {
  let endpoint = `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/add?text=${text}`;
  if (parentId) {
    endpoint += `&parent_id=${parentId}`;
  }
  const response = await fetch(endpoint, {
    headers: {
      "X-Api-Key": getApiKey(),
    },
  });
  const data = await response.json();

  return "Added item to list";
};

const removeItem = async (id) => {
  const endpoint = `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/delete?block_id=${id}`;
  const response = await fetch(endpoint, {
    headers: {
      "X-Api-Key": getApiKey(),
    },
  });
  const data = await response.json();
  return "Deleted item";
};

const addSubTaskTool = new DynamicStructuredTool({
  name: "Add_SubTask_To_TodoList",
  description:
    "Inserts a subitem task under a parent item task in the todo list. Example: { 'text': 'Subtask description', 'parentId': 'parentTaskId' }",
  schema: z.object({
    text: z.string().describe("Subtask Title Text"),
    parentId: z.string().describe("Parent Task ID"),
  }),
  func: async ({ text, parentId }) => {
    return addItem(text, parentId);
  },
});

// Define the tools the agent will have access to.
const tools = [
  new DynamicTool({
    name: "None",
    description: "No action is needed",
    func: async (input) => "N/A",
  }),
  new DynamicTool({
    name: "Delete_Task_From_TodoList",
    description: "Deletes a task (id string required) from the todo list.",
    func: async (input) => removeItem(input),
  }),
  new DynamicTool({
    name: "Add_Task_To_TodoList",
    description: "Inserts a task (string required) into the todo list.",
    func: async (input) => addItem(input),
  }),
  addSubTaskTool,
  new Calculator(),
];

// Function to update the API key
export const useAgent = async (context) => {
  if (!llm) {
    return { invoke: async () => "No LLM available" };
  }
  const prompt = ChatPromptTemplate.fromTemplate(`
  You are a highly intelligent personal assistant.
  ${context}
  
  Be sure to be intelligent and thoughtful while following it accurately.
  
  Begin!
  
  Sunny: {input}
  {agent_scratchpad}`);
  console.log(prompt);

  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
    returnIntermediateSteps: true,
  });

  const invoke = async (prompt) =>
    await agentExecutor.invoke({
      input: prompt,
    });

  return { invoke };
};
