import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor } from "langchain/agents";
import Cookies from "vue-cookies";
import { Calculator } from "@langchain/community/tools/calculator";
import { DynamicTool, DynamicStructuredTool } from "@langchain/core/tools";
import { useApi } from "@/useAPI.js";

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
        //model: "openai/gpt-3.5-turbo-0125",
        model: "meta-llama/llama-3-70b-instruct",
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

const addItem = async (text) => {
  let endpoint = `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/add?text=${text}`;
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

// Define the tools the agent will have access to.
const tools = [
  new DynamicTool({
    name: "None",
    description: "No action is needed",
    func: async (input) => "N/A",
  }),
  new DynamicTool({
    name: "DeleteTaskFromTodoList",
    description: "Deletes a task (id string) from the todo list",
    func: async (input) => removeItem(input),
  }),
  new DynamicTool({
    name: "AddTaskToTodoList",
    description: "Inserts a task (string) into the todo list",
    func: async (input) => addItem(input),
  }),
  new Calculator(),
];

// Function to update the API key
export const useAgent = async (context) => {
  const prompt = ChatPromptTemplate.fromTemplate(`
You are a highly intelligent personal assistant.
${context}

Obey the following instructions as best you can. You have access to the following tools which you may use only if helpful:

{tools}

Use the following format:

Sunny: the input prompt you will be provided to answer

Thought: your current thoughts on the state of your answer and what to do next

Action: the action to take, should be one of the tools ({tool_names})

Action Input: the input to the action

Observation: the result of the action

... (this Thought/Action/Action Input/Observation can repeat N times as needed)

Final Response: (insert the final response to the original input prompt when finished)

Great that's the format, be sure to be intelligent and thoughtful while following it accurately.

Begin!

Sunny: {input}

Thought: {agent_scratchpad}`);

  const agent = await createReactAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    //verbose: true,
    returnIntermediateSteps: true,
  });

  const invoke = async (prompt) =>
    await agentExecutor.invoke({
      input: prompt,
    });

  return { invoke };
};
