Up+Notion lambda which takes an up transaction webhook and adds the data into notion.

# Pre Config

- Clone this repo locally
- Confirm you have nodejs and npm install locally
- Install the AWS CLI - https://aws.amazon.com/cli/
- Create an aws account
- Sign in via the aws CLI with your aws credentials.

# Setup the lambda function:

## Complete the pre config steps and then run:
```npm i```

----------------------
## Create the lambda in your AWS account with the following commands depending on your OS:
- Windows: 
  ```npm run windowsZip```
-Linux: 
  ```npm run linuxZip```

## Create lambda function
```zsh 
    aws lambda \
    --create-function \
    --function-name up-notion \
    --environment variables={'UP_KEY'='your_up_api_key','NOTION_DB_KEY'='your_notion_db_page','NOTION_API_KEY'='your_notion_api_key' \
    --zip-file fileb:///home/$USER/path/to/cloned/repo/lambda.zip
```

## List the lambda you have created and copy the ARN

``` bash
  aws lambda list-functions | grep arn
```
- Copy and paste the "FunctionArn" value from the list for the next step.

## Create the API gateway for the lambda using the ARN
```bash
  aws apigatewayv2 create-api \ 
    --name up-notion-api \
    --protocol-type http \ 
    -- target {$YOUR_LAMDA_ARN}
```

-----------------------
# Up API webhook setup

- Get your up api key https://developer.up.com.au/#welcome
- Create the UP API webhook
- Substitute the "url" with the API gateway url for your lambda function and add your up api key
  ```bash
  curl https://api.up.com.au/api/v1/webhooks \ 
    -XPOST \ 
    -H 'Authorization: Bearer {{YOUR_UP_API_KEY}}' \ 
    -H 'Content-Type: application/json' 
    \ --data-binary '{ "data": { "attributes": { "url": "http://example.com/webhook", "description": "Example webhook" } } }
  ```

# Making changes to suit your personal notion environment

- Update the package.json "push" script
  - point to your specific lambda '--function-name {{your-name}}'
  - change file path of your code --zip-file fileb://C:/path/to/your/code"

- Make code changes locally.
- ```npm run linuxZip```
- ```npm run push```
