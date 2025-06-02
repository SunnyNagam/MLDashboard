const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly", "https://www.googleapis.com/auth/tasks"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the user's task lists.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listTaskLists(auth) {
  const tasks = google.tasks({ version: "v1", auth });
  const res = await tasks.tasklists.list();
  return res.data;
}

/**
 * Lists tasks in a specific task list.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} tasklistId The ID of the task list.
 */
async function listTasks(auth, tasklistId) {
  const tasks = google.tasks({ version: "v1", auth });
  const res = await tasks.tasks.list({
    tasklist: tasklistId,
    showCompleted: true,
    showHidden: false,
  });
  return res.data;
}

/**
 * Creates a new task in a specific task list.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} tasklistId The ID of the task list.
 * @param {Object} taskData The task data to create.
 */
async function createTask(auth, tasklistId, taskData) {
  const tasks = google.tasks({ version: "v1", auth });
  const res = await tasks.tasks.insert({
    tasklist: tasklistId,
    requestBody: taskData,
  });
  return res.data;
}

/**
 * Updates a task in a specific task list.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} tasklistId The ID of the task list.
 * @param {string} taskId The ID of the task to update.
 * @param {Object} taskData The task data to update.
 */
async function updateTask(auth, tasklistId, taskId, taskData) {
  const tasks = google.tasks({ version: "v1", auth });
  const res = await tasks.tasks.patch({
    tasklist: tasklistId,
    task: taskId,
    requestBody: taskData,
  });
  return res.data;
}

/**
 * Deletes a task from a specific task list.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} tasklistId The ID of the task list.
 * @param {string} taskId The ID of the task to delete.
 */
async function deleteTask(auth, tasklistId, taskId) {
  const tasks = google.tasks({ version: "v1", auth });
  await tasks.tasks.delete({
    tasklist: tasklistId,
    task: taskId,
  });
  return { success: true };
}

/**
 * Routes the request to the appropriate Google Tasks API function
 */
async function routeRequest(auth, event) {
  const httpMethod = event.httpMethod;
  const path = event.path;

  console.log(`Routing: ${httpMethod} ${path}`);

  // Parse the path to extract components
  const pathParts = path.split("/").filter((part) => part !== "");

  try {
    // GET /getTasks/v1/users/@me/lists - List task lists
    if (httpMethod === "GET" && path.includes("/v1/users/@me/lists")) {
      return await listTaskLists(auth);
    }

    // GET /getTasks/v1/lists/{tasklist}/tasks - List tasks in a task list
    if (httpMethod === "GET" && path.includes("/v1/lists/") && path.endsWith("/tasks")) {
      const tasklistId = pathParts[3]; // Extract tasklist ID from path
      if (!tasklistId) {
        throw new Error("Task list ID is required");
      }
      return await listTasks(auth, tasklistId);
    }

    // POST /getTasks/v1/lists/{tasklist}/tasks - Create a new task
    if (httpMethod === "POST" && path.includes("/v1/lists/") && path.endsWith("/tasks")) {
      const tasklistId = pathParts[3]; // Extract tasklist ID from path
      if (!tasklistId) {
        throw new Error("Task list ID is required");
      }

      let taskData;
      try {
        taskData = JSON.parse(event.body);
      } catch (e) {
        throw new Error("Invalid JSON in request body");
      }

      if (!taskData.title) {
        throw new Error("Task title is required");
      }

      return await createTask(auth, tasklistId, taskData);
    }

    // PATCH /getTasks/v1/lists/{tasklist}/tasks/{task} - Update a task
    if (httpMethod === "PATCH" && path.includes("/v1/lists/") && pathParts.length >= 6) {
      const tasklistId = pathParts[3]; // Extract tasklist ID from path
      const taskId = pathParts[5]; // Extract task ID from path

      if (!tasklistId || !taskId) {
        throw new Error("Task list ID and task ID are required");
      }

      let taskData;
      try {
        taskData = JSON.parse(event.body);
      } catch (e) {
        throw new Error("Invalid JSON in request body");
      }

      return await updateTask(auth, tasklistId, taskId, taskData);
    }

    // DELETE /getTasks/v1/lists/{tasklist}/tasks/{task} - Delete a task
    if (httpMethod === "DELETE" && path.includes("/v1/lists/") && pathParts.length >= 6) {
      const tasklistId = pathParts[3]; // Extract tasklist ID from path
      const taskId = pathParts[5]; // Extract task ID from path

      if (!tasklistId || !taskId) {
        throw new Error("Task list ID and task ID are required");
      }

      return await deleteTask(auth, tasklistId, taskId);
    }

    // If no route matches
    throw new Error(`Unsupported endpoint: ${httpMethod} ${path}`);
  } catch (error) {
    throw error;
  }
}

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    const auth = await authorize();
    const result = await routeRequest(auth, event);

    // Determine status code based on method
    let statusCode = 200;
    if (event.httpMethod === "POST") {
      statusCode = 201; // Created
    } else if (event.httpMethod === "DELETE") {
      statusCode = 204; // No Content
    }

    return {
      statusCode: statusCode,
      body: JSON.stringify(result),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Api-Key",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      },
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Api-Key",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      },
    };
  }
};
