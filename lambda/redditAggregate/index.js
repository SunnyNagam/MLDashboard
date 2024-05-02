const axios = require("axios");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
// Initialize DynamoDB Document Client with AWS SDK v3
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

//zip -r ./redditAggregate *

const postsPerSub = 10;
const commentsPerPost = 20;
const appName = "Dashboard";

// Function to fetch top posts from a subreddit
const fetchTopPosts = async (subreddit, timeFrame = "day") => {
  const url = `https://oauth.reddit.com/r/${subreddit}/top/.json?limit=${postsPerSub}&t=${timeFrame}`;
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": appName,
        Authorization: process.env.REDDIT_KEY,
      },
    });
    return response.data.data.children.map((child) => child.data);
  } catch (error) {
    console.error("Error fetching top posts:", error);
    throw error;
  }
};

// Function to fetch top comments for a post
const fetchTopComments = async (sub, article) => {
  const url = `https://oauth.reddit.com/r/${sub}/comments/article/.json?article=${article}&limit=${commentsPerPost}&sort=top`;
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": appName,
        Authorization: process.env.REDDIT_KEY,
      },
    });
    // Return top comments from the first listing (comments listing)
    return response.data[1].data.children.slice(0, -1).map((child) => ({
      body: child.data.body_html,
      author: child.data.author,
    }));
  } catch (error) {
    console.error("Error fetching top comments:", error);
    throw error;
  }
};

// Function to store data in DynamoDB
const storeData = async (data, timeFrame = "day") => {
  const command = new PutCommand({
    TableName: "RedditSummary",
    Item: {
      timeFrame: timeFrame,
      data: data,
    },
  });

  try {
    const response = await docClient.send(command);
    console.log("Data stored:", response);
  } catch (error) {
    console.error("Error storing data:", error);
    throw error;
  }
};

// Main Lambda handler
exports.handler = async (event) => {
  const subreddits = [
    "machinelearning",
    "calgary",
    "localllama",
    "economics",
    "cscareerquestions",
    "personalfinancecanada",
    "mlscaling",
    "singularity",
  ]; // Modify as needed
  let aggregatedData = [];
  const timeFrame = event.queryStringParameters
    ? event.queryStringParameters.timeFrame
    : "day";
  console.log(timeFrame);
  try {
    for (const subreddit of subreddits) {
      let postsData = [];
      const posts = await fetchTopPosts(subreddit, timeFrame);
      for (const post of posts) {
        const comments = await fetchTopComments(subreddit, post.id);
        postsData.push({
          title: post.title,
          description: post.selftext_html,
          url: post.url,
          permalink: post.permalink,
          comments: comments,
        });
      }
      aggregatedData.push({
        subreddit: subreddit,
        posts: postsData,
      });
    }

    // Store the aggregated data once per day
    await storeData(aggregatedData, timeFrame);
    //console.log(JSON.stringify(aggregatedData));

    return {
      statusCode: 200,
      body: JSON.stringify("Data fetched and stored successfully!"),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify("Failed to fetch or store data"),
    };
  }
};
