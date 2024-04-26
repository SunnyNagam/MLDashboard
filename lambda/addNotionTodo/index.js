const { Client } = require("@notionhq/client");

// Initialize a client
const notion = new Client({
  auth: process.env.NOTION_KEY, // Ensure you set this in your Lambda environment variables
});

exports.handler = async (event) => {
  const blockId = event.queryStringParameters.parent_id
    ? event.queryStringParameters.parent_id
    : process.env.NOTION_TODO_BLOCK_ID;
  const afterId = event.queryStringParameters.after_id;
  const text = event.queryStringParameters.text;

  try {
    let response = null;
    if (event.queryStringParameters.parent_id) {
      response = await notion.blocks.children.append({
        block_id: blockId,
        children: [
          {
            todo: {
              rich_text: [
                {
                  text: {
                    content: text,
                  },
                },
              ],
            },
          },
        ],
        after: afterId,
      });
    } else {
      response = await notion.blocks.children.append({
        block_id: blockId,
        children: [
          {
            toggle: {
              rich_text: [
                {
                  text: {
                    content: text,
                  },
                },
              ],
            },
          },
        ],
        after: afterId,
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
