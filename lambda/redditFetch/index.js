const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB Document Client with AWS SDK v3
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Function to retrieve data from DynamoDB for a given date
const fetchDataForDate = async (date) => {
  const command = new GetCommand({
    TableName: "RedditSummary",
    Key: {
      date: date,
    },
  });

  try {
    const { Item } = await docClient.send(command);
    return Item ? Item.data : null; // Return the stored data or null if not found
  } catch (error) {
    console.error("Error retrieving data:", error);
    throw error;
  }
};

// Main Lambda handler
exports.handler = async (event) => {
  // Extract date from the query string parameters or use today's date
  const today = new Date().toISOString().split("T")[0];
  const date = event.queryStringParameters
    ? event.queryStringParameters.date
    : today;

  try {
    const data = await fetchDataForDate(date);
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
          message: "No data found for the specified date",
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
