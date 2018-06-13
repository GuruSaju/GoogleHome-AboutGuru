// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

//const { WebhookClient } = require('dialogflow-fulfillment');
//const { Card, Suggestion } = require('dialogflow-fulfillment');
const { dialogflow, BasicCard } = require('actions-on-google');
const functions = require('firebase-functions');
const questions = require('./questions');
const trivia = require('./trivia');
const app = dialogflow({ debug: true });
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
const ANSWER_COUNT = 4; // The number of possible answers per trivia question.
const GAME_LENGTH = 5;  // The number of questions per trivia game.
const GAME_STATES = {
  TRIVIA: "_TRIVIAMODE", // Asking trivia questions.
  START: "_STARTMODE", // Entry point, start the game.
  HELP: "_HELPMODE", // The user is asking for help.
};

//=========================================================================================================================================
//High level skill constants
//=========================================================================================================================================

const SKILL_NAME = 'About Guru';
const HELP_MESSAGE = 'You can ask guru about what he does, what he likes, his technical skills, his work experiences, his projects, his interests, his publications etc.. or play, How well do you know Guru? a small trivia about guru and see how well you score. If you want to contact him say contact. What do you want to know about guru?';
const HELP_REPROMPT = 'What do you want to know about guru?';
const STOP_MESSAGE = 'Goodbye!';
const CONTACT_REPROMPT = " Say contact guru to get his email address";
const REPEAT_REPROMPT = " Say repeat if you would like to hear that again";
const LIKE_TO_KNOW = " Would you like to know anything else?";
let workDetailFlag = true;
let favThingFlag = true;
let repeatFlag = false;
//=========================================================================================================================================
//Speech output constants about guru
//=========================================================================================================================================
const guru_start = "Hi this is Guru. What would you like to know about me? Say help for more info";
const guru_work = "Guru works as a Full Stack Developer at Nationwide. Say work experience to know more about guru's work history.";
const guru_fullName = "His full name is Srisarguru Sridhar. He goes by either guru or batman.";
const guru_launch = "Welcome to About Guru. This skill is to know about guru. If you don't know him well you can get to know him through this skill. You can ask him about his likes, his technical skills, his work experiences, his projects and you can also play a trivia game How well do you know guru. What do you like to know about him ?.";
const guru_launch_reprompt = "What do you like to know about him ?";
const guru_color = "His favourite colors are red and black. Although he always told me he wanted rainbow dyed hair";
const guru_summary = "Guru is a Full Stack developer with a passion for technology, development and innovation. He strongly believes that learning is a continuous process and that the best way to gain knowledge, is not only by learning but also by sharing. He enjoys working on both backend as well as frontend, with a constant lookout to learn new technologies currently used in the industry. His career path has helped him to develop strong problem-solving, communication, mentoring and leadership skills, along with the ability to work both as a team player as well as a solo performer when needed. He also enjoys playing his ps4, running, racketball, watching cricket and football. Say repeat to hear that again or say contact to get his email address.";
const guru_techskills = "Full Stack Development and proficient in a number of programming languages and scripting languages, databases, web services, conversational interfaces, tools and frameworks. I have sent all the details of his technical skills to your device. Say contact to get guru's email address or say work experience to know about his work history.";
const guru_favActor = "His favourite actors are Hugh Jackman, Rajnikanth and Emma Watson.";
const guru_relationship = "He is single and No!, we are not in a relationship.";
const guru_favMovie = "He likes mystery, sci-fi and drama. His all time favourite movie is The Prestige directed by Christopher Nolan.";
const guru_nationality = "He is Indian. But he resides now in the US.";
const guru_contact = "You can ask him more by sending an email to him. His email address is s.srisarguru@gmail.com";
const guru_favAthlethe = "His most favourite is M.S. Dhoni.";
const guru_favSports = "He likes to watch Cricket, American Football and Hockey.";
const guru_favTeam = "His favourite club cricket team is Chennai Super Kings, his favorite college football team is Boise State Broncos, his favorite NHL team is Columbus Blue Jackets and his favorite NFL team is Dallas Cowboys.";
const guru_favFood = "He likes to eat everything except humans.";
const guru_education = "He has a Master's degree in Computer Science from Boise State University. He graduated with a  g p a of three point nine four. Go Broncos!. Say Boise State University to know more about his work and research at the university.";
const guru_favQuote = "It will be Alright in the end. If it is not Alright, it is not the end.";
const guru_favMusicBand = "He likes Ed Sheeran, Bruno Mars, A.R.Rahman and Frank Sinatra.";
const guru_favCar = "He always wanted a Ford Mustang.";
const guru_favSuperhero = "His favorite superhero is The Wolverine.";
const guru_languages = "He knows Tha mil and English. His native language is Tha mil.";
const guru_favPlace = "His most favorite place is Boise, Idaho.";
const guru_favLeader = "He regards A.P.J Abdul Kalam as his inspiration.";
const guru_favSongs = "His favorites are Strangers in the night by Frank Sinatra, Heroes by David Bowie, Hurt by Johnny Cash and Antha Arabi Kadalorum by A.R. Rahman.";
const guru_favSeason = "He prefers Spring.";
const guru_favTvSeries = "It is none other than Breaking Bad.";
const guru_favVideoGame = "Horizon Zero Dawn blew him away. Aloy All the way.";
const guru_workExpereince = "He has around 3 plus years’ experience in development, research and teaching. I have sent a brief list of his work history to your device. Please say the name of the company to know more, or, say contact to get the email address of guru.";
const guru_publications = "He has authored two publications, first one titled, A Certificateless One-Way Group Key Agreement Protocol, for Point-to-Point Email Encryption, and ,another titled, IMPROVED SUPERVISED CLASSIFICATION OF ACCELEROMETRY DATA, " +
  "TO DISTINGUISH BEHAVIORS OF SOARING BIRDS.";
const guru_certifications = "He has completed Java 8, Bash Shell Scripting and O O Concepts certifications by Brainbench.";
const guru_nationwide = "As a member of a Test and Learn team and from a multi-speed IT perspective, his aim was to implement innovative systems of engagement, with agility and experimentation in order to optimize internet sales applications, and deliver"
  + " timely solutions within a rapidly evolving online environment. He and his team built innovative Test and learn features for our sales applications, Auto Insurance, Property Insurance, and Powersports Insurance, which could"
  + "be switched on and off when needed, and had a line of separation from mainline code. I have sent more details about his work at Nationwide to your device.";
const guru_cic = "As a software engineer he worked on The Online Product Approval (OPA) application, which is a web-based workflow engine that manages the product development lifecycle, and dialog between the Product Development Associates and Licensee " +
  "partners. Online Product Approval (OPA) is a system used to accept, manage, and approve licensed product submissions. He worked on adding a new workflow module, in addition to the normal workflow, to accommodate the BPM team." +
  " I have sent more details about his work at Columbus International Corporation to your device";

const guru_bsu = "As a Research Developer at the Computer Science department at Boise State university, he did research in cyber-security on point to point email encryption. He designed a protocol on point to point email encryption and developed software prototypes,"
  + " as a teaching assistant he assisted in tutoring, teaching, mentoring and grading, as a hpc admin he helped other researchers in coding on a 16 node g p u clustered supercomputer. I have sent more details about his work at Boise State University to your device.";
const guru_bytebe = "As a part time java web developer at ByteBe, he worked on developing various web applications for various industries like granite, clubs and e-commerce. I have sent more details about his work at ByteBe to your device.";
const guru_abt = "As a Java Developer intern at ABT, he was working with the Java project team where he learned and developed web applications. I have sent more details about his work at ABT to your device.";
const guru_projects = "Please say the name of the organization or company he worked for, to know more on his projects or say, side projects to know about his other projects. Say work experience to get a list of his work experiences. What would you like to know?";
const guru_sideProjects = "Guru has worked on several projects on his own and also for school in various technologies. I have sent a list of his projects to your device. In order to get his resume please contact him.";
const guru_passion = "He is passionate about natural language processing, machine learning and voice interaction. He likes to keep himself updated on these topics by reading articles. He strongly believes in humanity and thinks AI, will help understand humanity better.";
const guru_hobbies_interests = "He is interested in Full Stack Development, natural language processing, machine learning and voice interaction. He likes to learn new technologies and work on projects during his free time. Other than that he helps the programming community by comtributing to Stack Overflow. He also enjoys playing his ps4, running, racketball, watching cricket and football.";
const guru_likes = "You can ask him about things he likes. You can for example ask What is his favorite car or What movie does he like. What would you like to know?";
//TODO AGE INTENT FAVORITE FRIEND
//========================================================================================
// Card constants
//========================================================================================

const guru_email = "s.srisarguru@gmail.com";
const guru_contactCardTitle = "Guru's Email Id";
const guru_techskills_card_title = "Guru's Technical Skills";
const guru_techskills_card_content = "1. Programming Proficiency: \n " +
  "Java, C, C++, Android Java, SQL.\n\n" +
  "2. Java/J2EE Frameworks: \n" +
  "Core Java, Servlets, Spring, Struts, Hibernate, JSP, iBatis \n\n" +
  "3. Language/Scripting: \n" +
  "JavaScript, Angular JS, Node JS, JQuery, HTML5, CSS, Shell scripting \n\n" +
  "4. Web Services/Cloud: \n" +
  "SOAP, Restful, Apigee, AWS Lambda, Firebase \n\n" +
  "5. Conversational Interfaces: \n" +
  "Amazon Alexa, Microsoft Bot framework, DialogFlow \n\n" +
  "6. Servers: \n" +
  "Apache Tomcat, JBoss, Webshpere. \n\n" +
  "7. RDBMS: \n" +
  "Oracle, MySQL and NoSQL. \n\n" +
  "8. IDE / Tools: \n" +
  "Eclipse, RAD, Spring STS, Net Beans and TOAD. \n\n" +
  "9. Build & Project Tracking Tools: \n" +
  "Jenkins, Maven, Ant, Bugzilla, Redmine, HP Quality Center, UCD. \n\n" +
  "10. Operating Systems: \n" +
  "Unix/Linux, Mac OS X, Windows. \n\n" +
  "11. Version Control: \n" +
  "Git, Fossil, SVN. \n\n" +
  "12. Others: \n" +
  "Amazon Alexa, Microsoft Bot Framework, Matlab, Cyber-Security, Latex, Python, PHP, Bootstrap";
const guru_work_title = "Guru's Work Experience";
const guru_work_content = "Nationwide Insurance, Columbus OH, Full Stack Developer (Java/J2EE) from August 2017 – Present \n\n" +
  "Columbus International Corporation,Columbus OH, Software Engineer (Java/J2EE) from April 2017 – August 2017 \n\n" +
  "CS Department at Boise State University, Researcher and Developer (RA) from January 2015 – December 2016 \n\n" +
  "CS Department at Boise State University, Teaching Assistant from January 2015 – December 2016 \n\n" +
  "Boise State University OIT, HPC Administration from June 2015 – August 2015 \n\n" +
  "ByteBe® Solutions India Private Limited, Part-time Developer from July 2013 – May 2014 \n\n" +
  "ABT Info Systems, Java Developer Intern from Dec 2012 – May 2013";
const guru_work_nationwide_title = "Experience at Nationwide";
const guru_work_cic_title = "Experience at CIC";
const guru_work_bsu_title = "Experience at BSU";
const guru_work_bytebe_title = "Experience at ByteBe";
const guru_work_abt_title = "Experience at ABT";
const guru_side_projects_title = "Guru's Other Projects";
const guru_work_nationwide_content = "PROJECTS: PayPal Payment, Adobe Target for Auto, Property and Powersports, Chatbot for password reset, claims and smartride"
  + ", Amazon Alexa: Find an agent, FAQ, Claims, Smartride, Billing Inquiry and Bill Pay, Current Carrier, Predictive Coverages, Implementation of plugin framework for Powersports " +
  "Application and several API’s (internal and external) using APIGEE \n\n"
  + "ENVIRONMENT: Java/J2EE, Spring (MVC, IOC, AOP, Webflow), JSP, JavaScript, AngularJS, NodeJS, iBatis, Hibernate, jQuery, HTML, CSS, JDBC, Oracle 11g, REST, SOAP, Apigee, WebSphere " +
  "Application Server, Liberty Server, Maven, HP Quality Center, Amazon Alexa, Microsoft Bot Framework, Git, SVN, Jenkins, UCD";

const guru_work_cic_content = "PROJECT:Online Product Approval (OPA) is a system used to accept, manage, and approve licensed product submissions. The Brand Product Management (BPM) team " +
  "actively partners with these North America product development teams to review OPA and sample submissions. We had to add new workflow module in addition to the normal workflow to accommodate the BPM team \n\n" +
  "ENVIRONMENT: Java/J2EE, Spring (MVC, IOC, AOP), JSP, JavaScript, jQuery, HTML, CSS, JDBC, Stored Proc, MySQL, REST, WebSphere, Maven, Redmine, Git, Log4j.";

const guru_work_bsu_content = "RA PROJECT: A Certificateless One-way Group Key Agreement Protocol for Point-Point Email Encryption (CLOW-GKA) protocol for P2P email encryption using Elliptic curve cryptography \n\n" +
  "ENVIRONMENT: Java, Java GUI, Cyber-Security, Spring, JSP, JavaScript, AngularJS, Hibernate, jQuery, HTML, CSS, JDBC, Maven, Git \n\n"
  + "TA: 221 Computer Science 2, 321 Data Structures, 421/521 Design and Analysis of Algorithms \n\n" +
  "HPC: Assisted researchers in Java and C";

const guru_work_bytebe_content = "PROJECTS: Websites for StoneBe, Kongu Association, WONASA \n\n" +
  "ENVIRONMENT: Java, Struts, Servlets, JSP, JDBC, jQuery, MySQL, JavaScript, Apache, HTML, SVN and CSS";

const guru_work_abt_content = "PROJECT: E-Learning Web application where you can take a variety of courses and buy books \n\n" +
  "ENVIRONMENT: Java, JavaScript, JSP, Servlets, HTML, MySQL and CSS";

const guru_side_projects_content = "1. Amazon Alexa Skill - aboutGuru using AWS and nodeJS \n\n 2. Google Assistant Skill - aboutGuru using DialogFlow, Firebase and nodeJS \n\n 3. Single Page Application Website for Tekcel using Angular and Bootstrap \n\n 4. My Pet - An android " +
  "app for pet owners using google maps and android java \n\n 5. Cloudy with a chance of Express JS - a simple weather app using node js, ejs and expressJS \n\n 6. Patient Registration and Monitoring System - using PHP and MySql" +
  "\n\n 7. Nine Man Morris - nine morris game using java GUI which can be played against an AI \n\n 8. Data Model of Cricket Leagues - a data model of IPL league using TOAD data modeler";

//=========================================================================================================================
//Questions
//========================================================================================================================
const QUESTIONS = [
  {
    'What is guru\'s favorite movie?': [
      'The Prestige',
      'The Dark Knight',
      'The Avengers',
      'Titanic',
      'Dunkirk',
      'Kabali',
      'Logan'
    ],
  },
  {
    'Who is guru\'s favorite sportsperson?': [
      'M.S. Dhoni',
      'Sachin Tendulkar',
      'Usain Bolt',
      'Rafael Nadal',
      'LeBron James',
      'Christiano Ronaldo',
      'Lionel Messi'
    ],
  },
  {
    'What does guru do for a living?': [
      'Developer',
      'Tester',
      'Jobless',
      'Doctor',
      'Teacher',
      'Farmer',
      'Movie Director'
    ],
  },
  {
    'What car does guru like the most?': [
      'Ford Mustang',
      'Chevi Camero',
      'Dodge Challenger',
      'Tesla',
      'Audi R8',
      'BMW',
      'Mercedes Benz'
    ],
  },
  {
    'Which of the following are guru\'s favorite colors?': [
      'Red and Black',
      'Black and Blue',
      'Red and Yellow',
      'Brown and Blue',
      'Red and Blue',
      'Green and Purple',
      'Pink and Gold'
    ],
  },
  {
    'In which country was guru born?': [
      'India',
      'USA',
      'Australia',
      'Germany',
      'Brazil',
      'Japan',
      'South Africa'
    ],
  },
  {
    'Which major did guru study?': [
      'Computer Science',
      'Electrical Engineering',
      'Material Science',
      'Civil Engineering',
      'Accounting',
      'Health Science',
      'Mathematics'
    ],
  },
  {
    'Which of the following  musicians or bands does guru like?': [
      'Ed Sheeran, Bruno Mars, A.R.Rahman and Frank Sinatra',
      'Ed Sheeran, Bruno Mars, Michael Jackson and Anirudh',
      'Eminem, Bruno Mars, A.R.Rahman and Anirudh',
      'Ed Sheeran, Maroon five, A.R.Rahman and Anirudh',
      'Ed Sheeran, Bruno Mars, A.R.Rahman and Anirudh',
      'Taylor Swift, Katy Perry and Rihanna',
      'Coldplay, Imagine dragons and Akon'
    ],
  },
  {
    'Which of the following sports that guru likes to watch?': [
      'Cricket, American Football and Hockey',
      'Soccer and Cricket',
      'Cricket, Tennis and Soccer',
      'Cricket, American Football and Basketball',
      'Basketball, Cricket and Rugby',
      'Cricket and Baseball',
      'Cricket, American Football and Boxing'
    ],
  },
  {
    'Which of the following actor or actors does guru like?': [
      'Hugh Jackman, Rajnikanth and Emma Watson',
      'Christian Bale and Emma Stone ',
      'Robert Downey Junior and Scarlet Johanson',
      'Rajnikanth and Amitab Bachan',
      'Tom Cruise',
      'Jim Carry and Will Smith',
      'None of the options'
    ],
  },
  {
    'Who is guru\'s favorite superhero?': [
      'The Wolverine',
      'Batman',
      'Iron-man',
      'Spider-man',
      'Black Panther',
      'The Flash',
      'Thor'
    ],
  },
  {
    'What is guru\'s mother tongue?': [
      'Tamil',
      'Hindi',
      'Telugu',
      'Spanish',
      'Chinese',
      'English',
      'French'
    ],
  },
  {
    'Who is guru\'s favorite and inspirational leader?': [
      'A.P.J Abdul Kalam',
      'Nelson Mandela',
      'Martin Luther King',
      'Mahatma Gandhi',
      'Abraham Lincoln',
      'Mother Teresa',
      'Alexandar The Great'
    ],
  },
  {
    'Which is guru\'s favorite place?': [
      'Boise, Idaho, USA',
      'Paris, France',
      'Amsterdam, Netherlands',
      'Seattle, Washington, USA',
      'Rio De Janeiro, Brazil',
      'Seoul, South Korea',
      'Tokyo, Japan'
    ],
  },
  {
    'Which is guru\'s favorite season?': [
      'Spring',
      'Summer',
      'Fall',
      'Winter',
      'All seasons',
      'None of them',
      'Every season except winter'
    ],
  },
  {
    'Which is guru\'s favorite Tv Show?': [
      'Breaking Bad',
      'Grey\'s Anatomy',
      'The One Hundred',
      'Doctor House',
      'Game of Thrones',
      'Narcos',
      'Suits'
    ],
  },
  {
    'Which video game does guru like the most?': [
      'Horizon Zero Dawn',
      'Far Cry 4',
      'Call of Duty Black Ops three',
      'Batman Arkham Knight',
      'Assasin\'s Creed Syndicate',
      'Ghost Recon Wildlands',
      'The Witcher three'
    ],
  },
  {
    'Which is guru\'s favorite College Football Team?': [
      'Boise State Broncos',
      'Michigan Wolverines',
      'Clemson Tiger',
      'Alabama Crimsontide',
      'Ohio State Buckeyes',
      'Wisconsin Badgers',
      'Georgia Bulldogs'
    ],
  },
  {
    'Which of the following are one of his favorite songs?': [
      'Strangers in the night by Frank Sinatra',
      'Uptown Funk by Bruno Mars',
      'Let Her Go by Passengers',
      'Roar by Katy Perry',
      'Why this Kolaveri Di by Anirudh',
      'Sugar by Maroon 5',
      'Perfect by Ed Sheeran'
    ],
  },
  {
    'Which is guru\'s favorite NFL Team?': [
      'Dallas Cowboys',
      'Seattle Seahawks',
      'Cleaveland Browns',
      'Cincinnati Bengals',
      'Denver Broncos',
      'Miami Dolphins',
      'Philadelphia Eagles'
    ],
  },
  {
    'Which is guru\'s favorite NHL Team?': [
      'Columbus Blue Jackets',
      'Washington Capitols',
      'Pittsburg Penguins',
      'L.A. Kings',
      'New York Rangers',
      'Nashville Predators',
      'Boston Bruins'
    ],
  },
];

//==========================================================================================
//FOR GURU TRIVIA
//===========================================================================================
const t = {
  QUESTION: QUESTIONS,
  GAME_NAME: "How well do you know Guru",
  HELP_MESSAGE: "I will ask you %s multiple choice questions. Respond with the number of the answer. " +
  "For example, say one, two, three, or four. To start a new game at any time, say, start game. ",
  REPEAT_QUESTION_MESSAGE: "To repeat the last question, say, repeat. ",
  ASK_MESSAGE_START: "Would you like to start playing?",
  HELP_REPROMPT: "To give an answer to a question, respond with the number of the answer. ",
  STOP_MESSAGE: "Would you like to keep playing?",
  CANCEL_MESSAGE: "Ok, let\'s play again soon.",
  NO_MESSAGE: "Ok, we\'ll play another time. Goodbye!",
  TRIVIA_UNHANDLED: "Try saying a number between 1 and %s",
  HELP_UNHANDLED: "Say yes to continue, or no to end the game.",
  START_UNHANDLED: "Say start to start a new game.",
  NEW_GAME_MESSAGE: "Welcome to %s. ",
  WELCOME_MESSAGE: "I will ask you %s questions, try to get as many right as you can. " +
  "Just say the number of the answer. Let\'s begin. ",
  ANSWER_CORRECT_MESSAGE: "yay. That is correct. ",
  ANSWER_WRONG_MESSAGE: "oops! that is wrong. ",
  CORRECT_ANSWER_MESSAGE: "The correct answer is %s: %s. ",
  ANSWER_IS_MESSAGE: "That answer is ",
  TELL_QUESTION_MESSAGE: "Question %s. %s",
  GAME_OVER_MESSAGE: "You got %s out of %s questions correct. Awesome job!. Thank you for playing!",
  SCORE_IS_MESSAGE: "Your score is %s. ",
  MOVE_ON_TO_NEXT_QUESTION: "Bummer, Let's move on to the next question, ",
  USE_SKILL_FOR_WRONG_ANSWERS_GAME_OVER_MESSAGE: "You got %s out of %s questions correct. Thank you for playing!. You can use this skill to find out the correct answers",


};

//=========================================================================================================================================
//Handlers
//=========================================================================================================================================

const initialhandlers = {
  'Default Welcome Intent': function (conv) {
    this.emit('LaunchGuruIntent', conv);
  },
  'LaunchGuruIntent': function (conv) {
    const speechOutput = guru_start;
    conv.ask(speechOutput);
    return;
  },
  'WorkIntent': function (conv) {
    const speechOutput = guru_work;
    conv.close(speechOutput);
    const parameters = {
      intent: 'WorkIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'RealNameIntent': function (conv) {
    const speechOutput = guru_fullName;
    conv.ask(speechOutput);
    const parameters = {
      intent: 'RealNameIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'FavoriteIntent': function (conv) {
    let favAboutThing = null;
    if (!repeatFlag) {
      favAboutThing = conv.body.queryResult.parameters.FavThings;
    }
    else {
      const repeatContext = conv.contexts.get('repeat');
      const parameters = repeatContext.parameters;
      favAboutThing = parameters.favThing;
    }
    let speechOut = null;
    switch (favAboutThing) {
      case 'colors':
      case 'color': {
        speechOut = guru_color + REPEAT_REPROMPT;
        break;
      }
      case 'cars':
      case 'car': {
        speechOut = guru_favCar + REPEAT_REPROMPT;
        break;
      }
      case 'actor':
      case 'actors':
      case 'actress':
      case 'film actor':
      case 'movie actor': {
        speechOut = guru_favActor + REPEAT_REPROMPT;
        break;
      }
      case 'movie':
      case 'movies':
      case 'picture':
      case 'film':
      case 'cinema': {
        speechOut = guru_favMovie + REPEAT_REPROMPT;
        break;
      }
      case 'sport':
      case 'sports': {
        speechOut = guru_favSports + REPEAT_REPROMPT;
        break;
      }
      case 'sportsperson':
      case 'sportspersons':
      case 'athletes':
      case 'athlete': {
        speechOut = guru_favAthlethe + REPEAT_REPROMPT;
        break;
      }
      case 'music':
      case 'music band':
      case 'band':
      case 'singer':
      case 'musician':
      case 'music artist': {
        speechOut = guru_favMusicBand + REPEAT_REPROMPT;
        break;
      }
      case 'food':
      case 'food to eat':
      case 'to eat':
      case 'dish': {
        speechOut = guru_favFood + REPEAT_REPROMPT;
        break;
      }
      case 'saying':
      case 'quote':
      case 'quotes': {
        speechOut = guru_favQuote + REPEAT_REPROMPT;
        break;
      }
      case 'superhero':
      case 'superheroes':
      case 'comic superhero':
      case 'comic character':
      case 'comic hero': {
        speechOut = guru_favSuperhero + REPEAT_REPROMPT;
        break;
      }
      case 'place':
      case 'city':
      case 'place to visit':
      case 'land':
      case 'place to live':
      case 'place on earth':
      case 'destination': {
        speechOut = guru_favPlace + REPEAT_REPROMPT;
        break;
      }
      case 'leader':
      case 'inspirational leader':
      case 'inspirational person':
      case 'leader look up to':
      case 'look up to':
      case 'inspiration': {
        speechOut = guru_favLeader + REPEAT_REPROMPT;
        break;
      }
      case 'season': {
        speechOut = guru_favSeason + REPEAT_REPROMPT;
        break;
      }
      case 'TV show':
      case 'TV series':
      case 'TV series to watch':
      case 'TV show to watch': {
        speechOut = guru_favTvSeries + REPEAT_REPROMPT;
        break;
      }
      case 'video game':
      case 'computer game':
      case 'console game':
      case 'ps4 game':
      case 'playstation game': {
        speechOut = guru_favVideoGame + REPEAT_REPROMPT;
        break;
      }
      case 'cricket team':
      case 'football team':
      case 'sports team':
      case 'NFL team':
      case 'college football team':
      case 'IPL team':
      case 'league team':
      case 'NHL team':
      case 'hockey team': {
        speechOut = guru_favTeam + REPEAT_REPROMPT;
        break;
      }
      case 'song':
      case 'songs': {
        speechOut = guru_favSongs + REPEAT_REPROMPT;
        break;
      }
      default:
        if (favThingFlag) {
          favThingFlag = false;
          this.emit('FavoriteIntent', conv);
        } else {
          this.emit('AMAZON.HelpIntent', conv);
        }
    }
    conv.ask(speechOut);
    const parameters = {
      intent: 'FavoriteIntent', favThing: favAboutThing
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'ContactIntent': function (conv) {
    const speechOutput = guru_contact;
    conv.close(speechOutput);
    const parameters = {
      intent: 'ContactIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
  },
  'SummaryIntent': function (conv) {
    const speechOutput = guru_summary;
    conv.ask(speechOutput);
    const parameters = {
      intent: 'SummaryIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'RelationshipIntent': function (conv) {
    const speechOutput = guru_relationship;
    conv.ask(speechOutput);
    const parameters = {
      intent: 'RelationshipIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'NationalityIntent': function (conv) {
    const speechOutput = guru_nationality;
    conv.ask(speechOutput);
    const parameters = {
      intent: 'NationalityIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'DegreeIntent': function (conv) {
    const speechOutput = guru_education;
    conv.ask(speechOutput);
    const parameters = {
      intent: 'DegreeIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'LanguageIntent': function (conv) {
    const speechOutput = guru_languages;
    conv.ask(speechOutput);
    const parameters = {
      intent: 'LanguageIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'CertificationsIntent': function (conv) {
    const speechOutput = guru_certifications;
    conv.ask(speechOutput);
    const parameters = {
      intent: 'CertificationsIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'PublicationsIntent': function (conv) {
    const speechOutput = guru_publications;
    conv.ask(speechOutput);
    const parameters = {
      intent: 'PublicationsIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'PassionIntent': function (conv) {
    const speechOutput = guru_passion;
    conv.ask(speechOutput);
    const parameters = {
      intent: 'PassionIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'HobbiesIntent': function (conv) {
    const speechOutput = guru_hobbies_interests;
    conv.ask(speechOutput);
    const parameters = {
      intent: 'HobbiesIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'ProjectsIntent': function (conv) {
    const speechOutput = guru_projects;
    conv.ask(speechOutput);
    const parameters = {
      intent: 'ProjectsIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'LikesIntent': function (conv) {
    const speechOutput = guru_likes;
    conv.ask(speechOutput);
    const parameters = {
      intent: 'LikesIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'TechnicalSkillsIntent': function (conv) {
    /* if (repeatFlag) {
         this.response.speak(guru_techskills);
     } else {
         this.response.speak(guru_techskills).cardRenderer(guru_techskills_card_title, guru_techskills_card_content);
     }
     
     this.response.shouldEndSession(false);
     repeatFlag = false;
     this.attributes['previousIntent'] = "TechnicalSkillsIntent";
     */
    const speechOutput = guru_techskills;
    conv.ask(speechOutput);
    conv.ask(new BasicCard({
      text: guru_techskills_card_content,
      title: guru_techskills_card_title,
    }));
    const parameters = {
      intent: 'TechnicalSkillsIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'WorkExperienceIntent': function (conv) {
    /*
    if (repeatFlag) {
        this.response.speak(guru_workExpereince);
    } else {
        this.response.speak(guru_workExpereince).cardRenderer(guru_work_title, guru_work_content);
    }
    this.attributes['previousIntent'] = "WorkExperienceIntent";
    repeatFlag = false;
    this.response.shouldEndSession(false);
    */
    const speechOutput = guru_workExpereince;
    conv.ask(speechOutput);
    conv.ask(new BasicCard({
      text: guru_work_content,
      title: guru_work_title,
    }));
    const parameters = {
      intent: 'WorkExperienceIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'OtherProjectsIntent': function (conv) {
    /*
    this.response.speak(guru_sideProjects + CONTACT_REPROMPT).cardRenderer(guru_side_projects_title, guru_side_projects_content);
    
    this.response.listen(CONTACT_REPROMPT);
    this.attributes['previousIntent'] = "OtherProjectsIntent";
    this.response.shouldEndSession(false);
    repeatFlag = false;
    this.emit(':responseReady');
    */
    const speechOutput = guru_sideProjects + CONTACT_REPROMPT;
    conv.ask(speechOutput);
    conv.ask(new BasicCard({
      text: guru_side_projects_content,
      title: guru_side_projects_title,
    }));
    const parameters = {
      intent: 'OtherProjectsIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'WorkDetailIntent': function (conv) {
    // const intentObj = this.event.request.intent;
    //let company = null;
    /*
    if (workDetailFlag && intentObj.slots) {
        company = intentObj.slots.companyType.value;
    } else if (!workDetailFlag) {
        const slot = intentObj.slots.companyType;
        let resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null;
        if (resolution && resolution.status.code == 'ER_SUCCESS_MATCH') {
            let resolutionValue = resolution.values[0].value;
            company = resolutionValue.name;
        }
    } else {
        company = this.attributes['company'];
    }
    this.attributes['previousIntent'] = "WorkDetailIntent";
    if (company !== null) {
        this.attributes['company'] = company;
    }
    */
    let company = null;
    if (!repeatFlag) {
      company = conv.body.queryResult.parameters.companyType;
    }
    else {
      const repeatContext = conv.contexts.get('repeat');
      const parameters = repeatContext.parameters;
      company = parameters.companyName;
    }

    let title = null;
    let bodyTemp_content = null;
    let speechOutput = null;
    let card_content = null;
    switch (company) {
      case 'nationwide':
      case 'nationwide insurance': {
        //  this.response.speak(guru_nationwide).cardRenderer(guru_work_nationwide_title, guru_work_nationwide_content);
        speechOutput = guru_nationwide;
        title = guru_work_nationwide_title;
        bodyTemp_content = guru_work_nationwide_bodyTemp_content;
        card_content = guru_work_nationwide_content;
        break;
      }
      case 'Columbus international corporation':
      case 'Columbus international':
      case 'columbus international corporation':
      case 'columbus international':
      case 'Columbus corporation':
      case 'Columbus corp':
      case 'cic':
      case 'c. i. c':
      case 'CIC': {
        // this.response.speak(guru_cic).cardRenderer(guru_work_cic_title, guru_work_cic_content);
        speechOutput = guru_cic;
        title = guru_work_cic_title;
        bodyTemp_content = guru_work_cic_bodyTemp_content;
        card_content = guru_work_cic_content;
        break;
      }
      case 'boise state university':
      case 'boise state':
      case 'bsu': {
        // this.response.speak(guru_bsu).cardRenderer(guru_work_bsu_title, guru_work_bsu_content);
        speechOutput = guru_bsu;
        title = guru_work_bsu_title;
        bodyTemp_content = guru_work_bsu_bodyTemp_content;
        card_content = guru_work_bsu_content;
        break;
      }
      case 'byte be':
      case 'bytebe':
      case 'byte be solutions': {
        // this.response.speak(guru_bytebe).cardRenderer(guru_work_bytebe_title, guru_work_bytebe_content);
        speechOutput = guru_bytebe;
        title = guru_work_bytebe_title;
        bodyTemp_content = guru_work_bytebe_bodyTemp_content;
        card_content = guru_work_bytebe_content;
        break;
      }
      case 'abt':
      case 'abt info systems':
      case 'about':
      case 'about info systems': {
        //this.response.speak(guru_abt).cardRenderer(guru_work_abt_title, guru_work_abt_content);
        speechOutput = guru_abt;
        title = guru_work_abt_title;
        bodyTemp_content = guru_work_abt_bodyTemp_content;
        card_content = guru_work_abt_content;
        break;
      }
      default:
        workDetailFlag = false;
        this.emit('WorkDetailIntent');
    }
    /*
    if (repeatFlag) {
        this.response.speak(speechOutput + REPEAT_REPROMPT);
    } else {
        this.response.speak(speechOutput + REPEAT_REPROMPT).cardRenderer(title, card_content);
    }
    */
    // this.response.listen(LIKE_TO_KNOW);
    // repeatFlag = false;
    conv.ask(speechOutput);
    conv.ask(new BasicCard({
      text: card_content,
      title: title,
    }));
    const parameters = {
      intent: 'WorkDetailIntent', companyName: company
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  },
  'AMAZON.HelpIntent': function (conv) {
    const speechOutput = HELP_MESSAGE;
    conv.ask(speechOutput);
    const parameters = {
      intent: 'AMAZON.HelpIntent'
    };
    conv.contexts.set('repeat', 1, parameters);
    repeatFlag = false;
    return;
  }
  ,
  'AMAZON.RepeatIntent': function (conv) {
    const repeatContext = conv.contexts.get('repeat');
    const parameters = repeatContext.parameters;
    const intent = parameters.intent;
    favThingFlag = true;
    workDetailFlag = true;
    repeatFlag = true;
    this.emit(intent, conv);
    return;
  },
  "GuruTriviaIntent": function (conv) {
    startGame(conv, true);
  },
};


//========================================================================================================================================
// Handlers for trivia game
//=========================================================================================================================================
//Handler to handle the start of the trivia game

function startGame(conv, newGame) {
  let speechOutput = newGame ? util.format(t.NEW_GAME_MESSAGE, t.GAME_NAME) + util.format(t.WELCOME_MESSAGE, GAME_LENGTH.toString()) : "";

  const translatedQuestions = t.QUESTION;
  // Select GAME_LENGTH questions for the game
  const gameQuestions = populateGameQuestions(translatedQuestions);

  // Generate a random index for the correct answer, from 0 to 3
  const correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
  // Select and shuffle the answers for each question
  const roundAnswers = populateRoundAnswers(gameQuestions, 0, correctAnswerIndex, translatedQuestions);
  const currentQuestionIndex = 0;
  const spokenQuestion = Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0];
  // Build reprompt for the question
  let repromptText = util.format(t.TELL_QUESTION_MESSAGE, "1", spokenQuestion) + "\n";

  for (let i = 0; i < ANSWER_COUNT; i++) {
    repromptText += `${i + 1}. ${roundAnswers[i]}. ` + "\n";
  }

  //Build object for session
  speechOutput += repromptText;

  conv.ask(speechOutput);
  conv.ask(new BasicCard({
    text: repromptText,
    title: t.GAME_NAME
  }));
  const parameters = {
    "speechOutput": repromptText,
    "repromptText": repromptText,
    "currentQuestionIndex": currentQuestionIndex,
    "correctAnswerIndex": correctAnswerIndex + 1,
    "questions": gameQuestions,
    "score": 0,
    "correctAnswerText": translatedQuestions[gameQuestions[currentQuestionIndex]][Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0]][0],
    "state": GAME_STATES.TRIVIA,
  };
  conv.contexts.set('gurutrivia', 1, parameters);
  repeatFlag = false;
  return;

  /*
          //Handle trivia state. Set the current state to trivia mode. The skill will now use handlers defined in triviaStateHandlers
          this.handler.state = GAME_STATES.TRIVIA;
  
          //build and send the response as listen
          this.response.speak(speechOutput).listen(repromptText);
          this.response.cardRenderer(this.t("GAME_NAME"), repromptText);
          this.emit(":responseReady");
  */
}

//Handler to handle in trivia mode ie during the game after the start handler
const triviaStateHandlers = {
  "AnswerIntent": function (conv) { //if the user answers a question
    handleUserGuess(conv, false);
  },
  "DontKnowIntent": function (conv) { //if user says he doesn't know
    handleUserGuess(conv, true);
  },
  "AMAZON.StartOverIntent": function (conv) {
    //this.handler.state = GAME_STATES.START;
    // this.emitWithState("StartGame", false);
    startGame(conv, false);
  },
  "AMAZON.RepeatIntent": function (conv) {
    //this.response.speak(this.attributes["speechOutput"]).listen(this.attributes["repromptText"]);
    //this.emit(":responseReady");
    const gurutriviaContext = conv.contexts.get('gurutrivia');
    const parameters = gurutriviaContext.parameters;
    //  const gameQuestions = this.attributes.questions;
    //  let correctAnswerIndex = parseInt(this.attributes.correctAnswerIndex, 10);
    //  let currentScore = parseInt(this.attributes.score, 10);
    //  let currentQuestionIndex = parseInt(this.attributes.currentQuestionIndex, 10);
    conv.contexts.set('gurutrivia', 1, parameters);
    conv.ask(parameters.speechOutput);
    return;
  },
  "AMAZON.HelpIntent": function (conv) {
    // this.handler.state = GAME_STATES.HELP;
    //  this.emitWithState("helpTheUser", false);

    helpStateHandlers['helpTheUser'].call(this, conv);
    return;
  },
  "AMAZON.StopIntent": function (conv) {
    //this.handler.state = GAME_STATES.HELP;
    const speechOutput = t.STOP_MESSAGE;
    // this.response.speak(speechOutput).listen(speechOutput);
    // this.emit(":responseReady");

    const gurutriviaContext = conv.contexts.get('gurutrivia');
    const parameters = gurutriviaContext.parameters;
    parameters.state = GAME_STATES.HELP;
    //  const gameQuestions = this.attributes.questions;
    //  let correctAnswerIndex = parseInt(this.attributes.correctAnswerIndex, 10);
    //  let currentScore = parseInt(this.attributes.score, 10);
    //  let currentQuestionIndex = parseInt(this.attributes.currentQuestionIndex, 10);
    conv.contexts.set('gurutrivia', 1, parameters);
    conv.ask(speechOutput);
  },
  "AMAZON.CancelIntent": function (conv) {
    //this.response.speak(this.t("CANCEL_MESSAGE"));
    //this.emit(":responseReady");
    conv.close(t.CANCEL_MESSAGE);
  },
  "input.unknown": function (conv) {
    const speechOutput = util.format(t.TRIVIA_UNHANDLED, GAME_LENGTH);
    const gurutriviaContext = conv.contexts.get('gurutrivia');
    const parameters = gurutriviaContext.parameters;
    conv.contexts.set('gurutrivia', 1, parameters);
    conv.ask(speechOutput);
  },
};

//=========================================================================================================================================	
//Guru Trivia Game	
//=========================================================================================================================================	

function isAnswerSlotValid(conv) {
  const answerSlotFilled = conv && conv.body && conv.body.queryResult && conv.body.queryResult.parameters.number;
  const answerSlotIsInt = answerSlotFilled && !isNaN(parseInt(conv.body.queryResult.parameters.number, 10));
  return answerSlotIsInt
    && parseInt(conv.body.queryResult.parameters.number, 10) < (ANSWER_COUNT + 1)
    && parseInt(conv.body.queryResult.parameters.number, 10) > 0;
}

/*
exports.aboutGuru = functions.https.onRequest((req, res) => {
  const handler = new Handler(initialhandlers);
  handler.run(req, res);
});*/
//Instead of having individual handlers for each intent, you can alternatively add a fallback function. 
//Inside the fallback function, check which intent triggered it and do the appropriate thing accordingly.
app.fallback((conv) => {
  console.log(conv);
  const handler = new Handler(initialhandlers);
  handler.run(conv);
});

exports.aboutGuru = functions.https.onRequest(app);

// Define new Handler class to reuse previously defined handlers for alexa with simple modification
class Handler {
  constructor(handlers) {
    this.handlers = handlers;
  }
  emit(event, data) {
    console.log('data ' + data);
    console.log('event ' + event);
    this.handlers[event].call(this, data);

  }
  run(req) {
    console.log(req.body);
    this.emit(req.body.queryResult.action, req);
  }
}

/*
// Define new Handler class to reuse previously defined handlers
class Handler {
  constructor(handlers) {
    this.handlers = handlers;
  }
  emit(event, data) {
    console.log('data' + data);
    console.log('event' + event);
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
*/
