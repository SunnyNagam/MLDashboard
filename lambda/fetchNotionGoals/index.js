// Import necessary modules
const { Client } = require("@notionhq/client");

// Initialize a new Notion client
const notion = new Client({
  auth: process.env.NOTION_KEY,
});

const databaseId = process.env.NOTION_GOAL_DB_ID;

const getBlocks = async () => {
  const response = await notion.databases.query({
    database_id: databaseId,
  });

  const goals = [];

  for (const page of response.results) {
    const goal = {
      id: page.id,
      name: page.properties.Name.title[0].plain_text,
      description: page.properties.Description.rich_text[0].plain_text,
      status: page.properties.Status.status.name,
      difficulty: page.properties.Difficulty.number,
      reward: page.properties.Reward.number,
      createdAt: page.properties["Created time"].created_time,
    };
    goals.push(goal);
  }
  return goals;
};

function buildResponse(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: { "Access-Control-Allow-Origin": "*" },
  };
}

exports.handler = async (event) => {
  try {
    const items = await getBlocks();
    if (!items.length)
      throw new Error("No items found in the requested block.");
    return buildResponse(200, items);
  } catch (error) {
    console.error("Error processing Notion API data:", error);
    return buildResponse(500, {
      error: error.message || "An unknown error occurred",
    });
  }
};
