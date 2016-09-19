/*
'use strict';
//Some formal logic taken from the Alexa Skill Kit template Trivia tutorial
//More info here https://developer.amazon.com/public/community/post/TxDJWS16KUPVKO/New-Alexa-Skills-Kit-Template-Build-a-Trivia-Skill-in-under-an-Hour
// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
		 
//     if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.05aecccb3-1461-48fb-a008-822ddrt6b516") {
//         context.fail("Invalid Application ID");
//      }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

//Called when it starts up
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

//Called when user invokes skill without additional intent
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    var cardTitle = "Tumble"
    var speechOutput = "You can tell tumble to roll as many dice of as many sides as you want."
    callback(session.attributes,
        buildSpeechletResponse(cardTitle, speechOutput, "", true));
}

//Called when user has stated an intent for the skill
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if (intentName === 'RollIntent') {
        handleRollRequest(intent, session, callback);
    }
    else if (intentName == 'UntilIntent') {
        handleUntilRequest(intent, session, callback);
    }
    else if (intentName == 'EggIntent') {
        handleEggRequest(intent, session, callback);
    }
    else {
        throw "Invalid intent";
    }
}

//Called when user manually ends session
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

//Handlers

//When the intent is just to roll
function handleRollRequest(intent, session, callback) {
    var sides;
    var result;
    var speechout;
    var dice;
    if(undefined !== intent.slots.numsides.value) {
    sides = intent.slots.numsides.value;
    }
    else {
        sides = 6;
    }
    if(undefined !== intent.slots.numdice.value) {
        dice = intent.slots.numdice.value;
        speechout = "I rolled " + dice + " " + sides + " sided dice and got ";
    }
    else {
        dice = 1;
        speechout = "I rolled a " + sides + " sided die and got a ";
    }
    for(var i = 0; i < dice; i++){
    result = Math.floor(Math.random()*sides) + 1;
    speechout += result
    if(undefined !== intent.slots.numdice.value && i !== dice-1) speechout += ", "
    }
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechout, "", "true"));
}

//When the intent is to rull until a certain outcome is seen
function handleUntilRequest(intent, session, callback) {
    var sides = 0;
    var out;
    var speechout;
    var nums = "";
    var rolls = 0;
    var rolled = false;
    if(undefined !== intent.slots.numsides.value) {
        sides = intent.slots.numsides.value;
    }
    else {
        sides = 6;
    }
    speechout = "I rolled a " + sides + " sided die "
    while(!rolled) {
        out = Math.floor(Math.random()*sides) + 1;
        rolls++;
        if(out == intent.slots.result.value) {
            rolled = true;
        }
        else {
            nums += out + " ";
        }
    }
    speechout += rolls + " times until a " + intent.slots.result.value + " was rolled. Here are the results: " + nums;
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechout, "", "true"));
}

//When the intent is an easter egg (Limited for now)
function handleEggRequest(intent, session, callback) {
    callback(session.attributes, 
        buildSpeechletResponseWithoutCard("I roll to start the fight against the beast!", "", "true"));
}

// ------- Helper functions to build responses -------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
