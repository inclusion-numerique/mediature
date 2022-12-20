import {
  Mjml,
  MjmlAll,
  MjmlAttributes,
  MjmlBody,
  MjmlButton,
  MjmlColumn,
  MjmlGroup,
  MjmlHead,
  MjmlImage,
  MjmlPreview,
  MjmlRaw,
  MjmlSection,
  MjmlSocial,
  MjmlSocialElement,
  MjmlStyle,
  MjmlText,
  MjmlTitle,
  MjmlWrapper,
} from '@luma-team/mjml-react';
import { PropsWithChildren } from 'react';

import css from '@mediature/ui/src/emails/layouts/standard.css';

export interface StandardLayoutPropreties {
  title: string;
}

export function StandardLayout(props: PropsWithChildren<StandardLayoutPropreties>) {
  const currentYear = new Date().getFullYear();

  return (
    <Mjml>
      <MjmlHead>
        <MjmlTitle>{props.title}</MjmlTitle>
        <MjmlPreview>{props.title}</MjmlPreview>
        <MjmlAttributes>
          <MjmlSection padding="10px 0px"></MjmlSection>
          <MjmlColumn padding="0px 0px"></MjmlColumn>
          <MjmlAll fontFamily='"Marianne", arial, sans-serif'></MjmlAll>
          <MjmlText cssClass="light-text" color="#3a3a3a" fontSize="14px" lineHeight="24px"></MjmlText>
          <MjmlButton
            backgroundColor="#000091"
            borderRadius="0px"
            cssClass="light-button"
            color="#f5f5fe"
            fontSize={16}
            fontWeight={500}
            lineHeight="24px"
            padding="8px 16px"
          ></MjmlButton>
        </MjmlAttributes>
        <MjmlStyle>{css}</MjmlStyle>
        <MjmlRaw>
          <meta name="color-scheme" content="light dark" />
          <meta name="supported-color-schemes" content="light dark" />
        </MjmlRaw>
      </MjmlHead>
      <MjmlBody width={500}>
        <MjmlWrapper cssClass="light-body">
          <MjmlSection>
            <MjmlGroup>
              <MjmlColumn verticalAlign="middle" width="120px">
                {/* TODO: upload images on our own CDN */}
                <MjmlImage src="https://upload.wikimedia.org/wikipedia/commons/4/44/Logo_republique_francaise.png" alt="Logo" paddingRight={0} />
              </MjmlColumn>
              <MjmlColumn verticalAlign="middle" width="380px">
                <MjmlText fontSize={20} fontWeight={700} paddingBottom={2}>
                  Médiature
                </MjmlText>
                <MjmlText fontSize={16} paddingTop={2}>
                  Service public de médiation
                </MjmlText>
              </MjmlColumn>
            </MjmlGroup>
          </MjmlSection>
          <MjmlSection cssClass="light-main-section" backgroundColor="#f6f6f6">
            <MjmlGroup>
              <MjmlColumn>{props.children}</MjmlColumn>
            </MjmlGroup>
          </MjmlSection>
          <MjmlSection>
            <MjmlGroup>
              <MjmlColumn>
                <MjmlText align="center" color="#666666" fontSize={12} paddingTop={2} paddingBottom={0}>
                  {currentYear} © Médiature
                </MjmlText>
                <MjmlSocial fontSize="15px" iconSize="30px" mode="horizontal" borderRadius={20} paddingTop={2}>
                  <MjmlSocialElement
                    name="twitter"
                    href="https://twitter.com/AmctMediation"
                    alt="Lien vers Twitter"
                    iconPadding="5px"
                    padding="6px 6px"
                  ></MjmlSocialElement>
                  <MjmlSocialElement
                    name="linkedin"
                    href="https://www.linkedin.com/company/association-des-m%C3%A9diateurs-des-collectivit%C3%A9s-territoriales"
                    alt="Lien vers LinkedIn"
                    iconPadding="5px"
                    padding="0px 10px"
                  ></MjmlSocialElement>
                </MjmlSocial>
              </MjmlColumn>
            </MjmlGroup>
          </MjmlSection>
        </MjmlWrapper>
      </MjmlBody>
    </Mjml>
  );
}
