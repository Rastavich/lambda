const fetch = require('node-fetch');
const winston = require('winston');
const { Client } = require('@notionhq/client');

let UP_KEY = process.env.UP_API_KEY;
let NOTION_DB_ID = process.env.NOTION_DB_ID;
let NOTION_API_KEY = process.env.NOTION_API_KEY;
let NOTION_DB_ID_TWO_UP = process.env.NOTION_DB_ID_TWO_UP;
let TWO_UP_ACCOUNT_ID = process.env.TWO_UP_ACCOUNT_ID;

let coverRegex = new RegExp(/\b(\w*Cover\w*)\b/);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const upRequestHeaders = {
  headers: {
    Authorization: 'Bearer ' + UP_KEY,
  },
};
// Initialize notion client instance
const notion = new Client({ auth: NOTION_API_KEY });

exports.handler = async (event, context) => {
  logger.defaultMeta = { requestId: context.awsRequestId };
  let input = JSON.parse(event.body);
  // TODO add automatic amountType check and pass to the transaction
  // let amountType = 'expense';
  logger.info('Transaction Created', input);

  let transactionURL = input.data.relationships.transaction.links.related;
  // Get the Up transactino information from the API using the webhook data.
  const upTransaction = await fetch(transactionURL, upRequestHeaders)
    .then((r) => r.text())
    .then((json) => {
      try {
        return JSON.parse(json);
      } catch (err) {
        return json;
      }
    });

  // Transaction data
  const {
    data: { attributes, relationships },
  } = upTransaction;

  let accountType = relationships.account.data.id;
  logger.info('Transaction Type', accountType);

  // Filter out any transactions we dont want
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
      body: 'Exclude Transfers, Held transactions, Round Up"s and Covers',
    };
  }

  logger.info('AccountType', { accountType });
  // Check if transaction is from 2UP account or not.
  let databaseId =
    accountType === TWO_UP_ACCOUNT_ID ? NOTION_DB_ID_TWO_UP : NOTION_DB_ID;

  logger.info('AccountOrigin', { databaseId });
  // Create the data object of the page for notion.
  const notionData = {
    parent: {
      database_id: databaseId,
    },
    properties: {
      Date: {
        type: 'date',
        date: {
          start: attributes.createdAt.toString(),
        },
      },
      Type: {
        type: 'select',
        select: {
          name: 'Expense',
        },
      },
      Amount: {
        type: 'number',
        number: parseFloat(attributes.amount.value),
      },
      Name: {
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
  };

  logger.info('Data to push to notion', notionData);

  await createPage(notionData);
  /**
   * Creates new page in Notion.
   *
   * https://developers.notion.com/reference/post-page
   *
   * @param {Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>} pagesToCreate
   */
  async function createPage(data) {
    const response = await notion.pages.create(data);
  }

  return {
    statusCode: 200,
    body: 'Notion Page Created successfully',
  };
};
