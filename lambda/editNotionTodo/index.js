const { Client } = require("@notionhq/client");

// Initialize a client
const notion = new Client({
  auth: process.env.NOTION_KEY, // Ensure you set this in your Lambda environment variables
});

exports.handler = async (event) => {
  const blockId = event.queryStringParameters.block_id;
  const text = event.queryStringParameters.text;
  const todoVal = event.queryStringParameters.todoToggle;
  try {
    let response = "";
    if (todoVal != undefined) {
      response = await notion.blocks.update({
        block_id: blockId,
        todo: {
          rich_text: [
            {
              text: {
                content: text,
              },
            },
          ],
          checked: todoVal,
        },
      });
    } else {
      response = await notion.blocks.update({
        block_id: blockId,
        toggle: {
          rich_text: [
            {
              text: {
                content: text,
              },
            },
          ],
        },
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        "Access-Control-Allow-Origin": "*", // Adjust this to match your domain for better security
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
      headers: {
        "Access-Control-Allow-Origin": "*", // Adjust this to match your domain for better security
      },
    };
  }
};
