import type { 
  Hero, 
  SimpleText, 
  TextBox, 
  Image, 
  Page as StrapiPage,
  BlockSpacing
} from './strapi';

// Utility type to add __typename to any component
export type WithTypename<T> = T & {
  __typename: string;
};

// Union type for all page components
export type PageComponent = 
  | WithTypename<Hero>
  | WithTypename<SimpleText>
  | WithTypename<TextBox>
  | WithTypename<Image>;

// GraphQL ContentSection extends the Strapi ContentSection but overrides content
export interface ContentSection {
  __typename: string;
  margins?: BlockSpacing;
  paddings?: BlockSpacing;
  maxWidth?: string;
  customClassName?: string;
  inlineStyles?: string;
  content: PageComponent[];
}

// GraphQL Page extends the Strapi Page but overrides content
export interface GraphQLPage extends Omit<StrapiPage, 'content'> {
  content: ContentSection[]; // Override with our GraphQL ContentSection array
}

// Type guard to check component type
export const isComponentType = <T extends PageComponent>(
  component: PageComponent,
  typename: string
): component is T => {
  return component.__typename === typename;
};

// Specific type guards for each component
export const isHero = (component: PageComponent): component is WithTypename<Hero> => 
  isComponentType<WithTypename<Hero>>(component, 'ComponentPageComponentsHero');

export const isSimpleText = (component: PageComponent): component is WithTypename<SimpleText> => 
  isComponentType<WithTypename<SimpleText>>(component, 'ComponentPageComponentsSimpleText');

export const isTextBox = (component: PageComponent): component is WithTypename<TextBox> => 
  isComponentType<WithTypename<TextBox>>(component, 'ComponentPageComponentsTextBox');

export const isImage = (component: PageComponent): component is WithTypename<Image> => 
  isComponentType<WithTypename<Image>>(component, 'ComponentPageComponentsImage'); 