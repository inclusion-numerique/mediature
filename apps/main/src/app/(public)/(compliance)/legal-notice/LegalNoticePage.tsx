import Container from '@mui/material/Container';

import statementContent from '@mediature/main/src/app/(public)/(compliance)/legal-notice/content.transformed.html';

function createMarkup() {
  return { __html: statementContent };
}

export function LegalNoticePage() {
  return (
    <Container
      sx={{
        py: 6,
      }}
    >
      <div dangerouslySetInnerHTML={createMarkup()}></div>
    </Container>
  );
}
