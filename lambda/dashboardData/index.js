const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB Document Client with AWS SDK v3
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const fetchDynamoData = async (key) => {
  const command = new GetCommand({
    TableName: "DashboardData",
    Key: {
      key: key,
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

const putDynamoData = async (key, data) => {
  const command = new PutCommand({
    TableName: "DashboardData",
    Item: {
      key: key,
      data: data,
    },
  });

  try {
    const response = await docClient.send(command);
    return response;
  } catch (error) {
    console.error("Error retrieving data:", error);
    throw error;
  }
};

const updateDynamoData = async (key, fieldPath, newItem) => {
  const command = new UpdateCommand({
    TableName: "DashboardData",
    Key: {
      key: key,
    },
    UpdateExpression: "SET #field = list_append(if_not_exists(#field, :empty_list), :newItem)",
    ExpressionAttributeNames: {
      "#field": fieldPath,
    },
    ExpressionAttributeValues: {
      ":newItem": [newItem],
      ":empty_list": [],
    },
    ReturnValues: "UPDATED_NEW",
  });

  try {
    const response = await docClient.send(command);
    return response.Attributes;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};

const mergeDynamoData = async (key, newData) => {
  try {
    // First get the existing data
    const existingData = await fetchDynamoData(key);

    // Merge the existing data with new data
    // If existingData is null, just use the new data
    const mergedData = existingData ? { ...existingData, ...newData } : newData;

    // Save the merged data back
    return await putDynamoData(key, mergedData);
  } catch (error) {
    console.error("Error merging data:", error);
    throw error;
  }
};

const removeItemFromDynamoData = async (key, itemId) => {
  try {
    // First get the existing data
    const existingData = await fetchDynamoData(key);

    if (!existingData || !Array.isArray(existingData)) {
      return null;
    }

    // Find the index of the item with matching id
    const index = existingData.findIndex((item) => item.id === itemId);

    if (index === -1) {
      // Item not found - return unchanged data
      return existingData;
    }

    // Remove the item
    existingData.splice(index, 1);

    // Save the updated data back
    return await putDynamoData(key, existingData);
  } catch (error) {
    console.error("Error removing item:", error);
    throw error;
  }
};

exports.handler = async (event) => {
  const queryParams = event.queryStringParameters || {};
  const key = queryParams.key;
  const body = event.body ? JSON.parse(event.body) : {};

  // Parameter checks
  const addTo = queryParams.addTo || body.addTo;
  const merge = queryParams.merge === "true" || queryParams.merge === true;
  const removeById = queryParams.removeById;

  console.log("Query params:", queryParams);
  console.log("Body:", body);

  try {
    let data = "";

    // Check if we're removing an item by id
    if (removeById) {
      data = await removeItemFromDynamoData(key, removeById);
    }
    // Check if we're adding to a list using the addTo parameter
    else if (addTo && event.body) {
      // Use the entire body as the item to add
      data = await updateDynamoData(key, addTo, body);
    }
    // Merge with root object
    else if (merge && event.body) {
      data = await mergeDynamoData(key, body);
    }
    // Standard put operation for full object updates
    else if (body && Object.keys(body).length > 0 && !addTo) {
      data = await putDynamoData(key, body);
    }
    // Get operation
    else {
      data = await fetchDynamoData(key);
    }

    console.log(data);

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
          message: "No data found for the specified key",
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
