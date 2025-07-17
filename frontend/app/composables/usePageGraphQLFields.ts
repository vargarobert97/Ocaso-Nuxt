export const usePageGraphQLFields = () => {
  // Base page fields
  const basePageFields = `
    documentId
    title
    slug
    seo {
      metaTitle
      metaDescription
      metaImage {
        url
        width
        height
        alternativeText
      }
    }
  `;

  // Spacing fields (used by content sections)
  const spacingFields = `
    spacingType
    customSpacing {
      mobile { top right bottom left }
      tablet { top right bottom left }
      desktop { top right bottom left }
      wide { top right bottom left }
      xlarge { top right bottom left }
    }
  `;

  // Media fields with formats
  const mediaFields = `
    url
    width
    height
    alternativeText
    formats
  `;

  // Hero component fields
  const heroFields = `
    ... on ComponentPageComponentsHero {
      __typename
      picture {
        ${mediaFields}
      }
      mobileImage {
        ${mediaFields}
      }
    }
  `;

  // Simple text component fields
  const simpleTextFields = `
    ... on ComponentPageComponentsSimpleText {
      __typename
      text
    }
  `;

  // Button component fields (used by text box)
  const buttonFields = `
    text
    type
    target
    icon {
      ${mediaFields}
    }
  `;

  // Text box component fields
  const textBoxFields = `
    ... on ComponentPageComponentsTextBox {
      __typename
      title
      content
      ctas {
        ${buttonFields}
      }
    }
  `;

  // Image component fields
  const imageFields = `
    ... on ComponentPageComponentsImage {
      __typename
      image {
        ${mediaFields}
      }
      mobileImage {
        ${mediaFields}
      }
    }
  `;

  // Hero slider component fields
  const heroSliderFields = `
    ... on ComponentPageComponentsHeroSlider {
      __typename
      Slides {
        ${imageFields}
      }
      autoPlayTimerSec
      slideEffect
    }
  `;

  // Content section fields
  const contentSectionFields = `
    ... on ComponentPageHierarchyContentSection {
      __typename
      margins {
        ${spacingFields}
      }
      paddings {
        ${spacingFields}
      }
      maxWidth
      customClassName
      inlineStyles
      content {
        ${heroFields}
        ${simpleTextFields}
        ${textBoxFields}
        ${imageFields}
        ${heroSliderFields}
      }
    }
  `;

  // Complete page fields including content
  const pageFields = `
    ${basePageFields}
    content {
      ${contentSectionFields}
    }
  `;

  return {
    // Individual field groups for flexibility
    basePageFields,
    spacingFields,
    mediaFields,
    heroFields,
    simpleTextFields,
    buttonFields,
    textBoxFields,
    imageFields,
    heroSliderFields,
    contentSectionFields,
    // Complete page fields
    pageFields,
  };
}; 