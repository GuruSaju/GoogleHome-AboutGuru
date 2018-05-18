# GoogleHome-AboutGuru
A simple skill for googlehome/assistant about me  
Using Dialog flow for intents and managing conversation  
Using Firebase for my API logic to handle information  

## Steps to install and use Firebase CLI  
1) npm install -g firebase-tools - to install the Firebase CLI  
2) firebase login - to login to your firebase associated account  
3) firebase init - to initialize a proect directory and associate a project with it 
4) firebase deploy [function name] - deploy the function to your firebase cloud with an optional function name to deploy only the specific function.  

## Connecting your dialog flow webhook to the deployed firebase function API  
1) Go to your dialog flow console and go to fullfillment section   
2) Click to enable Webhook. The inline editor can be use for testing and learning but it cannot be expanded to many files. You are stuck with index.js and package.json    
3) Go to your firebase console. Click on functions. You can see your deployed functions. 
4) Copy the url of the function and paste it to the webhook fullfillment section in dialogflow console  
5) AND WOHOOOO! your assistant is connected with firebase function. This is the easy part.  
