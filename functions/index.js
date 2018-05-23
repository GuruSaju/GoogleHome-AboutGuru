// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

//const { WebhookClient } = require('dialogflow-fulfillment');
//const { Card, Suggestion } = require('dialogflow-fulfillment');
const { dialogflow } = require('actions-on-google');
const functions = require('firebase-functions');

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
    return;
  },
  'RealNameIntent': function (conv) {
    const speechOutput = guru_fullName;
    conv.close(speechOutput);
    return;
  },
  'FavoriteIntent': function (conv) {
    let favAboutThing = conv.body.queryResult.parameters.FavThings;

    switch (favAboutThing) {
      case 'colors':
      case 'color': {
        this.emit('ColorIntent', conv);
        break;
      }
      case 'cars':
      case 'car': {
        this.emit('CarIntent', conv);
        break;
      }
      case 'actor':
      case 'actors':
      case 'actress':
      case 'film actor':
      case 'movie actor': {
        this.emit('ActorIntent', conv);
        break;
      }
      case 'movie':
      case 'movies':
      case 'picture':
      case 'film':
      case 'cinema': {
        this.emit('MovieIntent', conv);
        break;
      }
      case 'sport':
      case 'sports': {
        this.emit('SportsIntent', conv);
        break;
      }
      case 'sportsperson':
      case 'sportspersons':
      case 'athletes':
      case 'athlete': {
        this.emit('SportspersonIntent', conv);
        break;
      }
      case 'music':
      case 'music band':
      case 'band':
      case 'singer':
      case 'musician':
      case 'music artist': {
        this.emit('MusicIntent', conv);
        break;
      }
      case 'food':
      case 'food to eat':
      case 'to eat':
      case 'dish': {
        this.emit('FoodIntent', conv);
        break;
      }
      case 'saying':
      case 'quote':
      case 'quotes': {
        this.emit('FavQuoteIntent', conv);
        break;
      }
      case 'superhero':
      case 'superheroes':
      case 'comic superhero':
      case 'comic character':
      case 'comic hero': {
        this.emit('FavSuperheroIntent', conv);
        break;
      }
      case 'place':
      case 'city':
      case 'place to visit':
      case 'land':
      case 'place to live':
      case 'place on earth':
      case 'destination': {
        this.emit('FavPlaceIntent', conv);
        break;
      }
      case 'leader':
      case 'inspirational leader':
      case 'inspirational person':
      case 'leader look up to':
      case 'look up to':
      case 'inspiration': {
        this.emit('FavLeaderIntent', conv);
        break;
      }
      case 'season': {
        this.emit('FavSeasonIntent', conv);
        break;
      }
      case 'TV show':
      case 'TV series':
      case 'TV series to watch':
      case 'TV show to watch': {
        this.emit('FavSeriesIntent', conv);
        break;
      }
      case 'video game':
      case 'computer game':
      case 'console game':
      case 'ps4 game':
      case 'playstation game': {
        this.emit('FavVideoGameIntent', conv);
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
        this.emit('FavSportsTeamIntent', conv);
        break;
      }
      case 'song':
      case 'songs': {
        this.emit('FavSongIntent', conv);
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
  },
  'ColorIntent': function (conv) {
    const speechOutput = guru_color + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'ActorIntent': function (conv) {
    const speechOutput = guru_favActor + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'MovieIntent': function (conv) {
    const speechOutput = guru_favMovie + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'CarIntent': function (conv) {
    const speechOutput = guru_favCar + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'SportsIntent': function (conv) {
    const speechOutput = guru_favSports + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'SportspersonIntent': function (conv) {
    const speechOutput = guru_favAthlethe + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'FoodIntent': function (conv) {
    const speechOutput = guru_favFood + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'MusicIntent': function (conv) {
    const speechOutput = guru_favMusicBand + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'FavQuoteIntent': function (conv) {
    const speechOutput = guru_favQuote + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'FavSuperheroIntent': function (conv) {
    const speechOutput = guru_favSuperhero + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'FavPlaceIntent': function (conv) {
    const speechOutput = guru_favPlace + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'FavLeaderIntent': function (conv) {
    const speechOutput = guru_favLeader + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'FavSeasonIntent': function (conv) {
    const speechOutput = guru_favSeason + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'FavSeriesIntent': function (conv) {
    const speechOutput = guru_favTvSeries + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'FavVideoGameIntent': function (conv) {
    const speechOutput = guru_favVideoGame + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'FavSportsTeamIntent': function (conv) {
    const speechOutput = guru_favTeam + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'FavSongIntent': function (conv) {
    const speechOutput = guru_favSongs + REPEAT_REPROMPT;
    conv.ask(speechOutput);
    return;
  },
  'ContactIntent': function (conv) {
    const speechOutput = guru_contact;
    conv.close(speechOutput);
  },
  'AMAZON.HelpIntent': function (conv) {
    const speechOutput = HELP_MESSAGE;
    conv.ask(speechOutput);
  }

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
