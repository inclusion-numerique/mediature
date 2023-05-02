import { imageB64Data } from '@mediature/main/src/fixtures/image';

// The is the modified payload from the Mailjet documentation
// but at the end the real ones we receive much different
export const parseApiWebhookPayload = {
  Sender: 'pilot@mailjet.com',
  Recipient: 'passenger1@mailjet.com',
  Date: '20150410T160638',
  From: 'Pilot <pilot@mailjet.com>',
  Subject: "Hey! It's Friday!",
  Headers: {
    'Return-Path': ['<pilot@mailjet.com>'],
    Received: ['by 10.107.134.160 with HTTP; Fri, 10 Apr 2015 09:06:38 -0700 (PDT)'],
    'DKIM-Signature': [
      'v=1; a=rsa-sha256; c=relaxed/relaxed;        d=mailjet.com; s=google;        h=mime-version:date:message-id:subject:from:to:content-type;        bh=tsc4ruu5r5loLtAFUwhFp8BIbKzV0AYljT0+Bb/QwWI=;        b=............',
    ],
    'MIME-Version': ['1.0'],
    'Content-Transfer-Encoding': ['quoted-printable'],
    'Content-Type': ['multipart/alternative; boundary=001a1141f3c406f1b2051360f37d'],
    'X-CSA-Complaints': ['whitelist-complaints@eco.de'],
    'List-Unsubscribe': ['<mailto:unsub-e7221da9.org1.x61425y8x4pt@bnc3.mailjet.com>'],
    'X-Google-DKIM-Signature': [
      'v=1; a=rsa-sha256; c=relaxed/relaxed;        d=1e100.net; s=20130820;        h=x-gm-message-state:mime-version:date:message-id:subject:from:to         :content-type;        bh=tsc4ruu5r5loLtAFUwhFp8BIbKzV0AYljT0+Bb/QwWI=;        b=...........',
    ],
    'X-Gm-Message-State': ['ALoCoQlJBEYSiauMbHc8RXQpv3sUJvPmYAd7exYJKZIZFRZtFkSHqDEP59rQK6oIp9mCwPKCirCL'],
    'X-Received': ['by 10.107.41.72 with SMTP id p69mr3774075iop.58.1428681998638; Fri, 10 Apr 2015 09:06:38 -0700 (PDT)'],
    Date: 'Fri, 10 Apr 2015 18:06:38 +0200',
    'Message-ID': '<CAE5Zh0ZpHZ6G5DC+He5426a4RkVab7uWaTDwiMcHzOR=YB3urA@mail.gmail.com>',
    Subject: "Hey! It's Friday!",
    From: 'Pilot <pilot@mailjet.com>',
    To: 'passenger1@mailjet.com',
    Cc: 'Passenger 2 <passenger2@mailjet.com>',
    Bcc: 'Passenger 3 <passenger3@mailjet.com>, Passenger 4 <passenger4@mailjet.com>',
  },
  Parts: [
    {
      Headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
      },
      ContentRef: 'Text-part',
    },
    {
      Headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Content-Transfer-Encoding': 'quoted-printable',
      },
      ContentRef: 'Html-part',
    },
    {
      Headers: {
        'Content-Type': 'image/jpeg; charset=utf-8; name=imageSample.jpg',
        'Content-Transfer-Encoding': 'base64',
        'Content-Disposition': 'attachment; filename=imageSample.jpg',
      },
      ContentRef: 'Attachment1',
    },
    {
      Headers: {
        'Content-Type': 'image/jpeg; charset=utf-8; name=imageSample2.jpg',
        'Content-Transfer-Encoding': 'base64',
        'Content-Disposition': 'attachment; filename=imageSample2.jpg',
      },
      ContentRef: 'Attachment2',
    },
  ],
  'Text-part': "Hi,\n\nImportant notice: it's Friday. Friday *afternoon*, even!\n\n\nHave a *great* weekend!\n\nThe Anonymous Friday Teller\n",
  'Html-part':
    '<div dir="ltr">Hi,<div><br></div><div>Important notice: it&#39;s Friday. Friday <i>afternoon</i>, even!</div><div><br><br></div><div>Have a <i style="font-weight:bold">great</i> weekend!</div><div><br></div><div>The Anonymous Friday Teller</div></div>\n',
  Attachment1: imageB64Data,
  Attachment2: imageB64Data,
  SpamAssassinScore: '0.602',
  CustomID: 'helloworld',
  Payload: "{'message': 'helloworld'}",
};
