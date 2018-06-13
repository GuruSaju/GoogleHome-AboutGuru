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
  
## Research Notes when comparing with alexa  
1) When building a skill with google home the response is always diaplayed if the device has a screen and then any cards with it. 
2) If you are speaking through google home speaker then there is no way to send a card because there is no device which not the case in Alexa because alexa sends a card to your mobile app irrespective of screen capability.  
3) JSON.stringify(req.body.originalDetectIntentRequest.payload.surface.capabilities) by parsing this in the request we can find if actions.capability.SCREEN_OUTPUT is present. If it is present then we can say that it supports screen output. I will have to build response based on this.  
4) V2 is the new version and V1 is the old version and basically what changed is request and response. Find the differences at https://dialogflow.com/docs/reference/v1-v2-migration-guide-fulfillment. Not sure on the module change. Will have to dig on it more.  
5) Couldn't maintian states between session like in alexa to handle game states but was able to do it by contexts in dialogFlow.   

## Re-using code written for alexa  
1) Having a fallback function to handle all intents.  
2) Define a handler class to have an emit function which handles alexa's emit from handlers.  
3) pass in the actions module as a dialog flow(conv) to use and build the response and return it.  
4) Using other trivia handlers as functions and calling them by setting state in context in the session.  
5) Voila!!! much reuse and happy coding :) :) :)  
