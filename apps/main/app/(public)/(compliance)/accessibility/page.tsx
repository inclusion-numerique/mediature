// The `generated-statement.html` file has been generated on https://betagouv.github.io/a11y-generateur-declaration/
import statementContent from '@mediature/main/app/(public)/(compliance)/accessibility/generated-statement.html';

const cleanStatementContent = statementContent.replace('<!DOCTYPE html>', '');

function createMarkup() {
  return { __html: cleanStatementContent };
}

export default function AccessibilityPage() {
  return <div dangerouslySetInnerHTML={createMarkup()}></div>;
}
