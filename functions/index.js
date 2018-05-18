// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
//=========================================================================================================================================
//Speech output constants about guru
//=========================================================================================================================================

const guru_work = "Guru works as an Full Stack Developer at Nationwide. Say work experience to know more about guru's work history";
const guru_fullName = "His full name is Srisarguru Sridhar. He goes by either guru or batman";
const guru_launch = "Welcome to About Guru. This skill is to know about guru. If you don't know him well you can get to know him through this skill. You can ask him about his likes, his technical skills, his work experiences and you can also play a trivia game How well do you know guru. What do you like to know about him ?";
const guru_launch_reprompt = "What do you like to know about him ?";
const guru_color = "His favourite colors are red and black. Although he always told me he wanted rainbow dyed hair";
const guru_summary = "Guru is a Full Stack developer with a passion for technology, development and innovation. He strongly believes that learning is a continuous process and that the best way to gain knowledge, is not only by learning but also by sharing. He enjoys working on both backend as well as frontend, with a constant lookout to learn new technologies currently used in the industry. His career path has helped him to develop strong problem-solving, communication, mentoring and leadership skills, along with the ability to work both as a team player as well as a solo performer when needed. He also enjoys playing his ps4, running, racketball, watching cricket and football.";
const guru_techskills = "Full Stack Development and proficient in a number of programming languages and scripting languages, databases, web services, tools and frameworks. I have sent all the details of his technical skills to your device. Say contact to get guru's email address";
const guru_favActor = "His favourite actors are Hugh Jackman, Rajnikanth and Emma Watson";
const guru_relationship = "He is single and No!, we are not in a relationship";
const guru_favMovie = "He likes mystery, sci-fi and drama. His all time favourite movie is The Prestige directed by Christopher Nolan";
const guru_nationality = "He is Indian. But he resides now in the US";
const guru_contact = "You can ask him more by sending an email to him. I have sent his email address to your device";
const guru_favAthlethe = "His most favourite is M.S. Dhoni";
const guru_favSports = "He likes to watch Cricket, American Football and Hockey";
const guru_favTeam = "His favourite club cricket team is Chennai Super Kings, his favorite college football team is Boise State Broncos, his favorite NHL team is Columbus Blue Jackets and his favorite NFL team is Dallas Cowboys";
const guru_favFood = "He likes to eat everything except humans";
const guru_education = "He has a Master's degree in Computer Science from Boise State University. He graduated with a  g p a of three point nine four. Go Broncos!. Say Boise State University to know more about his work and research at the university";
const guru_favQuote = "It will be Alright in the end. If it is not Alright, it is not the end";
const guru_favMusicBand = "He likes Ed Sheeran, Bruno Mars, A.R.Rahman and Frank Sinatra";
const guru_favCar = "He always wanted a Ford Mustang";
const guru_favSuperhero = "His favorite superhero is The Wolverine";
const guru_languages = "He knows Tha mil and English. His native language is Tha mil";
const guru_favPlace = "His most favorite place is Boise, Idaho";
const guru_favLeader = "He regards A.P.J Abdul Kalam as his inspiration.";
const guru_favSongs = "His favorites are Strangers in the night by Frank Sinatra, Heroes by David Bowie, Hurt by Johnny Cash and Antha Arabi Kadalorum by A.R. Rahman";
const guru_favSeason = "He prefers Spring.";
const guru_favTvSeries = "It is none other than Breaking Bad.";
const guru_favVideoGame = "Horizon Zero Dawn blew him away. Aloy All the way";
const guru_workExpereince = "He has around 3 plus years’ experience in development, research and teaching. I have sent a brief list of his work history to your device. Please say the name of the company to know more, or, say contact to get the email address of guru.";
const guru_publications = "He has authored two publications, first one titled, A Certificateless One-Way Group Key Agreement Protocol, for Point-to-Point Email Encryption, and ,another titled, IMPROVED SUPERVISED CLASSIFICATION OF ACCELEROMETRY DATA, " +
    "TO DISTINGUISH BEHAVIORS OF SOARING BIRDS";
const guru_certifications = "He has completed Java 8, Bash Shell Scripting and O O Concepts certifications by Brainbench.";
const guru_nationwide = "As a member of a Test and Learn team and from a multi-speed IT perspective, his aim was to implement innovative systems of engagement, with agility and experimentation in order to optimize internet sales applications, and deliver"
    + " timely solutions within a rapidly evolving online environment. He and his team built innovative Test and learn features for our sales applications, Auto Insurance, Property Insurance, and Powersports Insurance, which could"
    + "be switched on and off when needed, and had a line of separation from mainline code. I have sent more details about his work at Nationwide to your device";
const guru_cic = "As a software engineer he worked on The Online Product Approval (OPA) application, which is a web-based workflow engine that manages the product development lifecycle, and dialog between the Product Development Associates and Licensee " +
    "partners. Online Product Approval (OPA) is a system used to accept, manage, and approve licensed product submissions. He worked on adding a new workflow module, in addition to the normal workflow, to accommodate the BPM team." +
    " I have sent more details about his work at Columbus International Corporation to your device";

const guru_bsu = "As a Research Developer at the Computer Science department at Boise State university, he did research in cyber-security on point to point email encryption. He designed a protocol on point to point email encryption and developed software prototypes,"
    + " as a teaching assistant he assisted in tutoring, teaching, mentoring and grading, as a hpc admin he helped other researchers in coding on a 16 node g p u clustered supercomputer. I have sent more details about his work at Boise State University to your device";
const guru_bytebe = "As a part time java web developer at ByteBe, he worked on developing various web applications for various industries like granite, clubs and e-commerce. I have sent more details about his work at ByteBe to your device";
const guru_abt = "As a Java Developer intern at ABT, he was working with the Java project team where he learned and developed web applications. I have sent more details about his work at ABT to your device";
const guru_projects = "Please say the name of the organization or company he worked for, to know more on his projects or say, side projects to know about his other projects. What would you like to know?";
const guru_sideProjects = "Guru has worked on several projects on his own and also for school in various technologies. I have sent a list of his projects to your device. In order to get his resume please contact him";
const guru_passion = "He is passionate about natural language processing, machine learning and voice interaction. He likes to keep himself updated on these topics by reading articles. He strongly believes in humanity and thinks AI, will help understand humanity better.";
const guru_hobbies_interests = "He is interested in Full Stack Development, natural language processing, machine learning and voice interaction. He likes to learn new technologies and work on projects during his free time. Other than that he helps the programming community by comtributing to Stack Overflow. He also enjoys playing his ps4, running, racketball, watching cricket and football.";
const guru_likes = "You can ask him about things he likes. You can for example ask What is his favorite car or What movie does he like. What would you like to know?";
//TODO AGE INTENT FAVORITE FRIEND
//=========================================================================================================================================
//Handlers
//=========================================================================================================================================

const handlers = {
    'LaunchRequest': function () {
        this.emit('LaunchGuruIntent');
    },
    'LaunchGuruIntent': function () {
        const speechOutput = guru_launch;
        this.emit(':responseReady',speechOutput);
    }
}

exports.aboutGuru = functions.https.onRequest((req, res) => {
  const handler = new Handler(handlers);
  handler.run(req, res);
}); 

// Define new Handler class to reuse previously defined handlers
class Handler {
  constructor(handlers) {
    this.handlers = handlers;
  }
  emit(event, data) {
      console.log('data'+data);
      console.log('event'+event);
    if (event.startsWith(':')) {
      this.res.json({
        fulfillmentText: data
      });
      return;
    } else {
      this.handlers[event].call(this, data);
    }
  }
  run(req, res) {
    this.req = req;
    this.res = res;
    console.log(req.body);
    this.emit(req.body.queryResult.action);
  }
}
