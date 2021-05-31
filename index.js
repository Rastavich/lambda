const fetch = require("node-fetch");

let UP_KEY = process.env.UP_API_KEY;
let NOTION_DB_ID = process.env.NOTION_DB_ID;
let NOTION_API_KEY = process.env.NOTION_API_KEY;

exports.handler = async (event) => {
  let input = JSON.parse(event.body);
  console.log(input);
  let transactionURL = input.data.relationships.transaction.links.related;
  let notionURL = "https://api.notion.com/v1/pages";

  const upRequestHeaders = {
    headers: {
      Authorization: "Bearer " + UP_KEY,
    },
  };

  const upTransaction = await fetch(transactionURL, upRequestHeaders)
    .then((r) => r.text())
    .then((json) => {
      try {
        return JSON.parse(json);
      } catch (err) {
        return json;
      }
    });

  const {
    data: { attributes },
  } = upTransaction;

  const data = JSON.stringify({
    parent: {
      database_id: NOTION_DB_ID,
    },
    properties: {
      Date: {
        id: "MGZE",
        type: "date",
        date: {
          start: attributes.createdAt.toString(),
        },
      },
      Type: {
        id: "[c{o",
        type: "select",
        select: {
          id: "e1661fc5-e5f8-444b-8667-a34c48e419f0",
          name: "Expense",
          color: "yellow",
        },
      },
      Amount: {
        id: "a@LY",
        type: "number",
        number: parseInt(attributes.amount.value),
      },
      Name: {
        id: "title",
        type: "title",
        title: [
          {
            type: "text",
            text: {
              content: attributes.description,
              link: null,
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
            plain_text: attributes.description,
            href: null,
          },
        ],
      },
    },
  });

  const notionRequestHeaders = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + NOTION_API_KEY,
      "Content-Type": "application/json",
      "Notion-Version": "2021-05-13",
    },
    body: data,
  };

  const notionCreate = await fetch(notionURL, notionRequestHeaders)
    .then((r) => r.text())
    .then((json) => {
      try {
        return JSON.parse(json);
      } catch (err) {
        return json;
      }
    });

  let response = {
    statusCode: 200,
    body: notionCreate,
  };

  return response;
};
