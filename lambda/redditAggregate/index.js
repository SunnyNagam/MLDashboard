const axios = require("axios");
const AWS = require("aws-sdk");
//zip -r ./redditAggregate *

// Initialize DynamoDB Document Client
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Function to fetch top posts from a subreddit
const fetchTopPosts = async (subreddit) => {
  const url = `https://www.reddit.com/r/${subreddit}/top/.json?limit=5`;
  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "YourAppName" },
    });
    return response.data.data.children.map((child) => child.data);
  } catch (error) {
    console.error("Error fetching top posts:", error);
    throw error;
  }
};

// Function to store posts in DynamoDB
const storePost = async (post) => {
  const params = {
    TableName: "YourDynamoDBTable",
    Item: {
      post_id: post.id,
      title: post.title,
      subreddit: post.subreddit,
    },
  };
  return dynamoDB.put(params).promise();
};

// Main Lambda handler
exports.handler = async (event) => {
  const subreddits = ["technology", "science", "news"]; // List of subreddits you want to fetch from

  try {
    for (const subreddit of subreddits) {
      const posts = await fetchTopPosts(subreddit);
      for (const post of posts) {
        await storePost(post);
        // Optionally, fetch and store comments here
      }
    }
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
