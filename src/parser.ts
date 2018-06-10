import * as watson from 'watson-developer-cloud';

const confidencethreshold = 0.55;

export interface ICredentials {
  toneAnalyzer: {
    username: string;
    password: string;
  };
  nlAnalyzer: {
    username: string;
    password: string;
  };
}

export interface ITone {
  tone_id: string;
  tone_name: string;
  score: number;
}

export interface IParsedTone {
  watsonTone: {
    strongestTone: ITone;
    allTones: ITone[];
  };
}

export interface IParsedSentiment {
  label: string;
  score: number;
}

export class Parser {
  private naturalLanguageAnalyzer!: watson.NaturalLanguageUnderstandingV1;
  private toneAnalyzer!: watson.ToneAnalyzerV3;

  private watsonCredentials: ICredentials;

  constructor() {
    this.watsonCredentials = {} as ICredentials;
  }

  public setCredentials(credentials: ICredentials) {
    this.watsonCredentials = credentials;
    if (credentials) {
      if (credentials.nlAnalyzer) {
        this.naturalLanguageAnalyzer = new watson.NaturalLanguageUnderstandingV1({
          username: credentials.nlAnalyzer.username, // tslint:disable-next-line:object-literal-sort-keys
          password: credentials.nlAnalyzer.password,
          version: '2018-04-05',
          url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/',
        });
      }

      if (credentials.toneAnalyzer) {
        this.toneAnalyzer = new watson.ToneAnalyzerV3({
          username: credentials.toneAnalyzer.username, // tslint:disable-next-line:object-literal-sort-keys
          password: credentials.toneAnalyzer.password,
          version: 'v3',
          version_date: '2016-05-19',
        });
      }
    }
  }

  public parseSentiment(sentence: string): Promise<IParsedSentiment> {
    return new Promise<IParsedSentiment>((resolve: any, reject: any) => {
      if (this.watsonCredentials!.nlAnalyzer) {
        this.naturalLanguageAnalyzer.analyze(
          {
            text: sentence, // tslint:disable-next-line:object-literal-sort-keys
            features: {
              concepts: {},
              keywords: {},
              sentiment: { document: true },
            },
            language: 'en',
          },
          (err: Error, response: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(response.sentiment.document as IParsedSentiment);
            }
          },
        );
      } else {
        reject(new Error('You must set credentials in order to use the Watson Natural Language Credentials'));
      }
    });
  }

  public parseEmotion(sentence: string): Promise<IParsedTone> {
    return new Promise<IParsedTone>((resolve: any, reject: any) => {
      if (this.watsonCredentials!.toneAnalyzer) {
        const parsedSentiment = {} as IParsedTone;
        this.toneAnalyzer.tone({ text: sentence }, (err: Error, tone: any) => {
          console.log(tone);
          if (err) {
            reject(err);
          } else {
            let resolved = false;
            tone.document_tone.tone_categories.forEach((tonecategory: any) => {
              if (tonecategory.category_id === 'emotion_tone') {
                const maxConfidence = Math.max.apply(
                  Math,
                  tonecategory.tones.map((examinedTone: any) => {
                    return examinedTone.score;
                  }),
                );
                const strongestTone = tonecategory.tones.find((examinedTone: any) => {
                  return examinedTone.score === maxConfidence;
                });
                // tslint:disable-next-line:no-console
                parsedSentiment.watsonTone = {
                  allTones: tonecategory.tones as ITone[],
                  strongestTone: strongestTone as ITone,
                };
                resolved = true;
                resolve(parsedSentiment);
              }
            });
            if (!resolved) {
              reject(new Error('Unknown problem. Possible no tone categories.'));
            }
          }
        });
      } else {
        reject(new Error('You must set credentials in order to use the Watson Natural Language Credentials'));
      }
    });
  }
}

/*const inspect = require('unist-util-inspect');
const unified = require('unified');
const english = require('retext-english');
const sentiment = require('retext-sentiment');


const processor = unified()
	.use(english)
    .use(sentiment);
    */
