const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { OpenAI } = require("openai");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const { Pinecone } = require("@pinecone-database/pinecone");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "Woosh";
const DEFAULT_CATEGORY = "unspecified";

const putDynamoData = async (note, category = DEFAULT_CATEGORY) => {
  const timestamp = new Date().toISOString();
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      category: category,
      timetaken: timestamp,
      text: note,
    },
  });

  // Also write to pinecone
  const openai = new OpenAI();
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: note,
    encoding_format: "float",
    dimensions: 1536,
  });

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pc.Index("woosh");
  const timestampMs = Date.now();
  await index.upsert([
    {
      id: timestamp,
      values: embedding.data[0].embedding,
      metadata: {
        category: category,
        timetaken: timestampMs,
        text: note,
      },
    },
  ]);

  try {
    const response = await docClient.send(command);
    return response;
  } catch (error) {
    //console.error("Error saving data:", error);
    throw error;
  }
};

const getDynamoData = async (category = DEFAULT_CATEGORY, start, end) => {
  let params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "category = :category",
    ExpressionAttributeValues: {
      ":category": category,
    },
    ScanIndexForward: false, // To get the most recent items first
  };

  if (end) {
    params.KeyConditionExpression += " AND timetaken BETWEEN :start AND :end";
    params.ExpressionAttributeValues[":start"] = start;
    params.ExpressionAttributeValues[":end"] = end;
  } else if (start) {
    params.KeyConditionExpression += " AND timetaken >= :start";
    params.ExpressionAttributeValues[":start"] = start;
  }

  const command = new QueryCommand(params);

  try {
    const response = await docClient.send(command);
    return response.Items;
  } catch (error) {
    //console.error("Error fetching data:", error);
    throw error;
  }
};

const searchPinecone = async (query, topK = 3) => {
  const openai = new OpenAI();
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query,
    encoding_format: "float",
    dimensions: 1536,
  });

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pc.Index("woosh");

  const queryResponse = await index.query({
    vector: embedding.data[0].embedding,
    topK: parseInt(topK),
    includeMetadata: true,
  });

  return queryResponse;
};

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body);

    if (!body.text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Text is required" }),
        headers,
      };
    }

    try {
      const data = await putDynamoData(body.text, body.category);
      return {
        statusCode: 200,
        body: JSON.stringify(data),
        headers,
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.toString() }),
        headers,
      };
    }
  } else if (event.httpMethod === "GET") {
    const { start, end, category, query, topK } =
      event.queryStringParameters || {};

    if (query) {
      try {
        const searchResults = await searchPinecone(query, topK);
        return {
          statusCode: 200,
          body: JSON.stringify(searchResults),
          headers,
        };
      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: error.toString() }),
          headers,
        };
      }
    } else {
      let startDate, endDate;

      if (start) {
        startDate = new Date(start);
      } else {
        // Default to 3 days ago if start is not specified
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 3);
      }

      if (end) {
        endDate = new Date(end);
      }

      try {
        const data = await getDynamoData(
          category,
          startDate.toISOString(),
          endDate ? endDate.toISOString() : undefined
        );
        return {
          statusCode: 200,
          body: JSON.stringify(data),
          headers,
        };
      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: error.toString() }),
          headers,
        };
      }
    }
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
      headers,
    };
  }
};
