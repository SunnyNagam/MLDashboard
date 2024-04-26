const {
  Client,
  iteratePaginatedAPI,
  collectPaginatedAPI,
} = require("@notionhq/client");

// Initialize a client
const notion = new Client({
  auth: process.env.NOTION_KEY, // Ensure you set this in your Lambda environment variables
});

exports.handler = async (event) => {
  const blockId = process.env.NOTION_TODO_BLOCK_ID; // Set this in your environment variables

  try {
    let lists = [];
    let list_ind = -1;
    let response = {};

    for await (const block of iteratePaginatedAPI(notion.blocks.children.list, {
      block_id: blockId,
    })) {
      if (block.type == "divider") {
        list_ind += 1;
      }
      if (list_ind > -1) {
        if (block.type == "heading_2") {
          response[block["heading_2"]["rich_text"][0]["plain_text"]] = [];
          lists.push(block["heading_2"]["rich_text"][0]["plain_text"]);
        }
        if (block.type == "toggle") {
          let subTasks = [];
          if (block["has_children"]) {
            const subItems = await collectPaginatedAPI(
              notion.blocks.children.list,
              {
                block_id: block["id"],
              }
            );
            subTasks = subItems.map((item) => {
              return {
                text: item[item["type"]]["rich_text"][0]["plain_text"],
                checked:
                  item["type"] == "to_do" ? item["to_do"]["checked"] : false,
                id: item["id"],
              };
            });
          }
          response[lists[list_ind]].push({
            text: block["toggle"]["rich_text"][0]["plain_text"],
            id: block["id"],
            created: block["created_time"],
            subTasks: subTasks,
          });
        }
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
    };
  }
};
