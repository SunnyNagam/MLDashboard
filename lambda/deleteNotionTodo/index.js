const { Client } = require("@notionhq/client");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

// Initialize a client
const notion = new Client({
  auth: process.env.NOTION_KEY,
});

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  const blockIdParam = event.queryStringParameters.block_id;
  const blockIds = blockIdParam
    ? blockIdParam.includes(",")
      ? blockIdParam.split(",")
      : [blockIdParam]
    : [];
  const defer = event.queryStringParameters.defer === "true";
  const deferWeek = event.queryStringParameters.deferWeek === "true";

  try {
    if (blockIds.length === 0) {
      throw new Error("No block IDs provided");
    }

    // Retrieve all blocks in one API call
    const blocksPromises = blockIds.map((blockId) =>
      notion.blocks.retrieve({ block_id: blockId })
    );
    const blocks = await Promise.all(blocksPromises);

    if (defer || deferWeek) {
      for (const block of blocks) {
        const newBlock = await notion.blocks.children.append({
          block_id: process.env.NOTION_TODO_BLOCK_ID,
          children: [{ toggle: block.toggle }],
          after: deferWeek
            ? process.env.NOTION_EVENTUALLY_ID
            : process.env.NOTION_SOON_ID,
        });

        if (block.has_children) {
          const children = await notion.blocks.children.list({
            block_id: block.id,
          });

          await notion.blocks.children.append({
            block_id: newBlock.results[0]["id"],
            children: children.results.map((child) => ({ to_do: child.to_do })),
          });
        }
      }
    } else {
      // Store deleted items in DynamoDB
      const mountainTime = new Date().toLocaleString("en-US", {
        timeZone: "America/Denver",
      });
      const today = new Date(mountainTime).toISOString().split("T")[0];
      const completedTasks = blocks.map((block) => ({
        TaskName: block.toggle.rich_text[0].plain_text,
      }));

      await updateCompletedTasksHistory(today, completedTasks);
    }

    // Delete all blocks using Promise.all
    const deletePromises = blockIds.map((blockId) =>
      notion.blocks.delete({ block_id: blockId })
    );
    await Promise.all(deletePromises);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Blocks processed successfully." }),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  }
};

async function updateCompletedTasksHistory(date, newTasks) {
  const getCommand = new GetCommand({
    TableName: "TodoHistory",
    Key: { Date: date },
  });

  try {
    const { Item } = await docClient.send(getCommand);
    const existingTasks = Item ? Item.Tasks : [];
    const updatedTasks = [...existingTasks, ...newTasks];

    const putCommand = new PutCommand({
      TableName: "TodoHistory",
      Item: {
        Date: date,
        Tasks: updatedTasks,
      },
    });

    await docClient.send(putCommand);
  } catch (error) {
    console.error("Error updating DynamoDB:", error);
    throw error;
  }
}
