Up+Notion lambda which takes an up transaction webhook and adds the data into notion.

# Pre Config

- Install the AWS CLI - https://aws.amazon.com/cli/
- Create an aws account
- Setup a nodejs lambda function
- Update the package.json "push" script
  - point to your specific lambda `--function-name {{your-name}}`
  - change file path of your code --zip-file fileb://C:/path/to/your/code"

# To Use:

- Complete the pre config steps
- Clone project
- `npm i`
- `npm run windowsZip` || `npm run linuxZip`
- `npm run push`
