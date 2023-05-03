import { StoryFn } from '@storybook/react';
import React from 'react';

import styles from '@mediature/docs/.storybook/email.module.scss';
import { StorybookRendererLayout } from '@mediature/ui/src/emails/layouts/storybook-renderer';
import { convertComponentEmailToText } from '@mediature/ui/src/utils/email';

export function withEmailRenderer(Story: StoryFn) {
  return (
    <StorybookRendererLayout>
      <Story />
    </StorybookRendererLayout>
  );
}

export function withEmailClientOverviewFactory(subject: string) {
  const EmailClientOverview = (Story: StoryFn) => {
    const HtmlVersion = Story;
    const PlaintextVersion = convertComponentEmailToText(<Story />);

    return (
      <article className={styles.emailTemplate}>
        <header className={styles.templateName}>
          <p className={styles.emailSubject}>Subject: {subject}</p>
        </header>
        <main className={styles.templateContainer}>
          <section className={styles.templateHtml}>
            <span className={styles.badge}>HTML</span>
            <div>
              <HtmlVersion />
            </div>
          </section>
          <section className={styles.templatePlaintext}>
            <span className={styles.badge}>Plaintext</span>
            <div style={{ whiteSpace: 'pre-wrap' }}>{PlaintextVersion}</div>
          </section>
        </main>
      </article>
    );
  };

  return EmailClientOverview;
}
