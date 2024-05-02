const { Client, collectPaginatedAPI } = require("@notionhq/client");

// Initialize a client
const notion = new Client({
  auth: process.env.NOTION_KEY,
});

exports.handler = async (event) => {
  const blockId = process.env.NOTION_TODO_BLOCK_ID;
  const headingTarget = event.queryStringParameters
    ? event.queryStringParameters.list_name
    : undefined;

  try {
    const items = await collectPaginatedAPI(notion.blocks.children.list, {
      block_id: blockId,
    });
    if (!items.length)
      throw new Error("No items found in the requested block.");
    const processedData = await processData(items, headingTarget);
    return buildResponse(200, processedData);
  } catch (error) {
    console.error("Error processing Notion API data:", error);
    return buildResponse(500, {
      error: error.message || "An unknown error occurred",
    });
  }
};

async function processData(items, headingTarget) {
  let lists = [];
  let list_ind = -1;
  let response = {};
  let subTasksPromises = [];
  let taskDetails = [];

  items.forEach((block, index) => {
    if (block.type === "divider") list_ind++;
    if (list_ind === -1) return;

    processBlock(
      block,
      list_ind,
      lists,
      response,
      headingTarget,
      subTasksPromises,
      taskDetails
    );
  });

  const allSubtasks = await Promise.all(subTasksPromises);
  allSubtasks.forEach((subTasks, index) => {
    const detail = taskDetails[index];
    response[lists[detail.listIndex]].push(createTaskEntry(detail, subTasks));
  });

  return response;
}

function processBlock(
  block,
  listIndex,
  lists,
  response,
  headingTarget,
  subTasksPromises,
  taskDetails
) {
  switch (block.type) {
    case "heading_2":
      handleHeading(block, listIndex, lists, response);
      break;
    case "toggle":
      handleToggle(
        block,
        listIndex,
        lists,
        response,
        headingTarget,
        subTasksPromises,
        taskDetails
      );
      break;
  }
}

function handleHeading(block, listIndex, lists, response) {
  const headingText = block["heading_2"]["rich_text"][0]["plain_text"];
  response[headingText] = [];
  lists.push(headingText);
}

function handleToggle(
  block,
  listIndex,
  lists,
  response,
  headingTarget,
  subTasksPromises,
  taskDetails
) {
  if (!headingTarget || lists[listIndex] === headingTarget) {
    if (block["has_children"]) {
      subTasksPromises.push(collectSubtasks(block["id"]));
      taskDetails.push({
        listIndex,
        toggleText: block["toggle"]["rich_text"][0]["plain_text"],
        blockId: block["id"],
        createdTime: block["created_time"],
      });
    } else {
      response[lists[listIndex]].push(
        createTaskEntry(
          {
            toggleText: block["toggle"]["rich_text"][0]["plain_text"],
            blockId: block["id"],
            createdTime: block["created_time"],
          },
          []
        )
      );
    }
  }
}

function buildResponse(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: { "Access-Control-Allow-Origin": "*" },
  };
}

async function collectSubtasks(blockId) {
  const subItems = await collectPaginatedAPI(notion.blocks.children.list, {
    block_id: blockId,
  });
  return subItems.map((item) => ({
    text: item[item["type"]]["rich_text"][0]["plain_text"],
    checked: item["type"] === "to_do" ? item["to_do"]["checked"] : false,
    id: item["id"],
  }));
}

function createTaskEntry(taskDetail, subTasks) {
  return {
    text: taskDetail.toggleText,
    id: taskDetail.blockId,
    created: taskDetail.createdTime,
    subTasks: subTasks,
  };
}
