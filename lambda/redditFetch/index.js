const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB Document Client with AWS SDK v3
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const fetchDynamoData = async (timeFrame) => {
  const command = new QueryCommand({
    TableName: "RedditSummary",
    KeyConditionExpression: "timeFrame = :timeFrame",
    ExpressionAttributeValues: {
      ":timeFrame": timeFrame,
    },
  });

  try {
    const { Items } = await docClient.send(command);
    if (Items && Items.length > 0) {
      // Restructure the data to match the original format
      return Items.map((item) => ({
        subreddit: item.subreddit,
        posts: item.data,
      }));
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error retrieving data:", error);
    throw error;
  }
};

exports.handler = async (event) => {
  const timeFrame = event.queryStringParameters
    ? event.queryStringParameters.timeFrame
    : "day";

  try {
    const data = await fetchDynamoData(timeFrame);
    if (data) {
      return {
        statusCode: 200,
        body: JSON.stringify(data),
        headers: {
          "Access-Control-Allow-Origin": "*", // Adjust this as needed for security
          "Content-Type": "application/json",
        },
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "No data found for the specified timeframe",
        }),
        headers: {
          "Access-Control-Allow-Origin": "*", // Adjust this as needed for security
          "Content-Type": "application/json",
        },
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
      headers: {
        "Access-Control-Allow-Origin": "*", // Adjust this as needed for security
        "Content-Type": "application/json",
      },
    };
  }
};
