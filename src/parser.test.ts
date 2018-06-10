import { ICredentials, IParsedTone, ITone, Parser } from './parser';

let parser: Parser;

let mock;

jest.mock('watson-developer-cloud', () => {
  mock = jest.genMockFromModule('watson-developer-cloud');
  return mock;
});

const analyze = jest.fn().mockImplementation((sentence, cb) => {
  cb(null, {
    sentiment: {
      document: {
        label: 'negative',
        score: -0.88,
      },
    },
  });
});

const tone = jest.fn().mockImplementation((sentence, cb) => {
  cb(null, {
    document_tone: {
      tone_categories: [
        {
          category_id: 'emotion_tone',
          tones: [
            {
              score: 1,
            },
          ],
        },
      ],
    },
  });
});

mock.ToneAnalyzerV3 = jest.fn().mockImplementation(() => ({
  tone,
}));

mock.NaturalLanguageUnderstandingV1 = jest.fn().mockImplementation(() => ({
  analyze,
}));

beforeEach(() => {
  parser = new Parser();
  parser.setCredentials({
    nlAnalyzer: {
      username: 'dummy', // tslint:disable-next-line:object-literal-sort-keys
      password: 'dummy',
    },
    toneAnalyzer: {
      username: 'dummy', // tslint:disable-next-line:object-literal-sort-keys
      password: 'dummy',
    },
  });
});

it('should recognize tone', () => {
  expect.assertions(3);
  return parser.parseEmotion(`I hate this`).then(parsedTone => {
    expect(tone).toHaveBeenCalled();
    expect(parsedTone).toHaveProperty('watsonTone');
    expect(parsedTone.watsonTone).toHaveProperty('strongestTone');
  });
});

it('should containt a sentiment', () => {
  expect.assertions(2);

  return parser.parseSentiment(`I hate this`).then(parsedSentiment => {
    expect(analyze).toHaveBeenCalled();
    expect(parsedSentiment).toHaveProperty('score');
  });
});

it('should return error when NL analyzer returns error', () => {
  expect.assertions(1);
  analyze.mockImplementation((_, cb) => {
    cb(new Error('error from test'), null);
  });

  return expect(parser.parseSentiment('Just testing')).rejects.toBeInstanceOf(Error);
});

it('should not work with Natural Language Analyzer when there are no credentials', () => {
  expect.assertions(1);
  parser.setCredentials({} as ICredentials);
  return expect(parser.parseSentiment(`I don't have credentials`)).rejects.toBeInstanceOf(Error);
});

it('should not work with Tone Analyzer when there are no credentials', () => {
  expect.assertions(1);
  parser.setCredentials({} as ICredentials);
  return expect(parser.parseEmotion(`I don't have credentials`)).rejects.toBeInstanceOf(Error);
});

it('should return error when tone analyzer returns error', () => {
  expect.assertions(1);
  tone.mockImplementation((_, cb) => {
    cb(new Error('error from test'), null);
  });

  return expect(parser.parseEmotion('Just testing')).rejects.toBeInstanceOf(Error);
});

it('should return error when tone analyzer fails to parse', () => {
  expect.assertions(1);
  tone.mockImplementation((_, cb) => {
    cb(null, { document_tone: { tone_categories: [] } });
  });

  return expect(parser.parseEmotion('Just testing')).rejects.toBeInstanceOf(Error);
});

