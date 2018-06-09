[![Build Status](https://travis-ci.org/erezak/sentiment-parser.svg?branch=master)](https://travis-ci.org/erezak/sentiment-parser)  [![codecov](https://codecov.io/gh/erezak/sentiment-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/erezak/sentiment-parser)

# Sentiment Parser

## Description
The sentiment-parser package is used to easily parse sentiments from sentences, using a simple one-liner.

## Backend
The package currently uses both an offline package and the IBM Watson API to gather the results. It will also try to guess a best answer, based on the two differing results.

## Prepare
You will need to secure credentials from IBM. To do that:
1. Sign up for [IBM Cloud](https://console.bluemix.net/registration/ "IBM Cloud"). 
2. Once you have an accound - go to the [Natural Language Understanding service page](https://console.bluemix.net/catalog/services/natural-language-understanding "Natural Language Understanding service page").
3. Click the "Create" button.
4. Click the "Service Credentials" tab on the Natural Language Understanding page in your IBM Cloud dashboard to view your credentials.
5. Do the same for the ToneAnalyzer service

## Initialization
```Javascript
const { Parser } = require('sentiment-parser');
const parser = new Parser();

    parser.setCredentials({
        nlAnalyzer: {
            username: '{your-api-username}',
            password: '{your-api-password}',
        },
        toneAnalyzer: {
            username: '{your-api-username}',
            password: '{your-api-password}',
        }
    });

```

## Usage
```Javascript
parser.parseSentiment(userInput).then(response => {
    // response.score is a value between -1 to 1
    // response.label is "negative" or "positive"
}



parser.parseEmotion(`I hate this`).then(parsedTone => {
    // parsedTone.watsonTone.strongestTone contains the strongest tone
    // parsedTone.watsoneTone.allTones contains an array of all the recognized tones

    // Each tone has a tone_id, tone_name and a score (from 0 to 1)
}
```
