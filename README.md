# D3-Chart-AWS-Nodejs
D3 chart is a powerful tool to render custom charts in your website. It also supports server side rendering. 
This sample demonstrates server side rendering, using AWS Lambda and Layers.

Dependancies:
- d3-node
- html-pdf

To reduce size of Lambda function, I have used AWS Layers for all dependancies. So when you import any external dependancies, you have to append Layers directory path with it, which is "/opt/node_modules/" in my case. But you can deploy dependancies with Lambda function also, in that case, just remove "/opt/node_modules/" from "index.js" file and it will work.

For pdf export, I have used 'html-pdf', which has a dependancy of phantomjs-prebuilt. so I have manually included executable of phantomjs into dependancies. You can find executable file here 'https://github.com/TylerPachal/lambda-node-phantom'. Download "phantomjs_linux-x86_64" file from it, copy that into new folder "phantomjs_lambda", then put that folder into "node_modules" folder.

This sample also demonstrates how to upload file to S3 bucket. Into "index.js" file, just replace "{BUCKET NAME}" with your S3 bucket name, and it will upload generated pdf file into your bucket.

How to deploy into AWS:
- 
- In your terminal, use "cd" command to set this project folder as your current directory
- Execute "npm install" command to install all dependancies (This will generate "node_modules" folder)
- If you want to use Layers, zip "node_modules" folder and upload into your AWS Layer
- Remove "node_modules" folder once it is uploaded to AWS Layer
- Execute "npm run deploy" command. This will generate "Lambda-Deployment.zip" file, which you can upload into Lambda function

Reference:
-
- https://www.npmjs.com/package/d3-node
- https://www.npmjs.com/package/html-pdf
- https://www.dashingd3js.com/table-of-contents
- http://techslides.com/over-1000-d3-js-examples-and-demos
- https://www.tutorialsteacher.com/d3js
