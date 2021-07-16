const fetch = require('node-fetch');
const winston = require('winston');

let UP_KEY = process.env.UP_API_KEY;
let NOTION_DB_ID = process.env.NOTION_DB_ID;
let NOTION_API_KEY = process.env.NOTION_API_KEY;

let coverRegex = new RegExp(/\b(\w*Cover\w*)\b/);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

exports.handler = async (event, context) => {
  logger.defaultMeta = { requestId: context.awsRequestId };
  let input = JSON.parse(event.body);

  logger.info('Transaction Created', input);

  let transactionURL = input.data.relationships.transaction.links.related;
  let notionURL = 'https://api.notion.com/v1/pages';

  const upRequestHeaders = {
    headers: {
      Authorization: 'Bearer ' + UP_KEY,
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

  logger.info('Transaction Type', attributes);

  if (
    attributes.status === 'HELD' ||
    attributes.description === 'Quick save transfer from Spending' ||
    attributes.description === 'Quick save transfer to Savings' ||
    attributes.description === 'Round Up' ||
    attributes.description.match(coverRegex)
  ) {
    logger.info('Transaction NOT added to notion', attributes);
    return {
      statusCode: 200,
      body: {
        message: 'Exclude Transfers, Held transactions, Round Up"s and Covers',
      },
    };
  }

  const data = JSON.stringify({
    parent: {
      database_id: NOTION_DB_ID,
    },
    properties: {
      Date: {
        id: 'MGZE',
        type: 'date',
        date: {
          start: attributes.createdAt.toString(),
        },
      },
      Type: {
        id: '[c{o',
        type: 'select',
        select: {
          id: 'e1661fc5-e5f8-444b-8667-a34c48e419f0',
          name: 'Expense',
          color: 'yellow',
        },
      },
      Amount: {
        id: 'a@LY',
        type: 'number',
        number: parseFloat(attributes.amount.value),
      },
      Name: {
        id: 'title',
        type: 'title',
        title: [
          {
            type: 'text',
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
              color: 'default',
            },
            plain_text: attributes.description,
            href: null,
          },
        ],
      },
    },
  });

  logger.info('Data to push to notion', data);

  const notionRequestHeaders = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + NOTION_API_KEY,
      'Content-Type': 'application/json',
      'Notion-Version': '2021-05-13',
    },
    body: data,
  };

  const notionCreate = await fetch(notionURL, notionRequestHeaders)
    .then((r) => r.text())
    .then((json) => {
      try {
        return JSON.parse(json);
      } catch (err) {
        return { statusCode: 400, body: json };
      }
    });

  logger.info('Added to Notion', notionCreate);

  let response = {
    statusCode: 200,
    body: attributes,
  };

  return response;
};
