const { Client } = require("@notionhq/client");

// Initialize a client
const notion = new Client({
  auth: process.env.NOTION_KEY, // Ensure you set this in your Lambda environment variables
});

exports.handler = async (event) => {
  const blockId = event.queryStringParameters.block_id;

  try {
    const response = await notion.blocks.delete({
      block_id: blockId,
    });
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
