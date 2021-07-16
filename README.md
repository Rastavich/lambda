Up+Notion lambda which takes an up transaction webhook and adds the data into notion.

# Pre Config

- Install the AWS CLI - https://aws.amazon.com/cli/
- Create an aws account
- Setup a nodejs lambda function
- Create an API gateway for your lamda function to expose itself
- Update the package.json "push" script
  - point to your specific lambda `--function-name {{your-name}}`
  - change file path of your code --zip-file fileb://C:/path/to/your/code"

# Up API webhook setup

- Get your up api key https://developer.up.com.au/#welcome
- Create the UP API webhook
- Substitute the "url" with the API gateway url for your lambda function and add your up api key
  `curl https://api.up.com.au/api/v1/webhooks \ -XPOST \ -H 'Authorization: Bearer {{YOUR_UP_API_KEY}}' \ -H 'Content-Type: application/json' \ --data-binary '{ "data": { "attributes": { "url": "http://example.com/webhook", "description": "Example webhook" } } }'`

# To Use:

- Complete the pre config steps
- Clone project
- `npm i`
- `npm run windowsZip` || `npm run linuxZip`
- `npm run push`
