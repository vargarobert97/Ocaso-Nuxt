import type { Schema, Struct } from '@strapi/strapi';

export interface MenuMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_menu_menu_items';
  info: {
    description: 'Individual menu item with support for sub-items';
    displayName: 'Menu Item';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
    subItems: Schema.Attribute.Component<'menu.sub-menu-item', true> &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    target: Schema.Attribute.Enumeration<['_self', '_blank', '_parent', '_top']> & Schema.Attribute.DefaultTo<'_self'>;
    url: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
  };
}

export interface MenuSubMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_menu_sub_menu_items';
  info: {
    description: 'Second level menu item';
    displayName: 'Sub Menu Item';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
    target: Schema.Attribute.Enumeration<['_self', '_blank', '_parent', '_top']> & Schema.Attribute.DefaultTo<'_self'>;
    url: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
  };
}

export interface PageComponentsButton extends Struct.ComponentSchema {
  collectionName: 'components_page_components_buttons';
  info: {
    displayName: 'Button';
    icon: 'bold';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images'>;
    target: Schema.Attribute.String;
    text: Schema.Attribute.String;
    type: Schema.Attribute.Enumeration<['primary', 'primary-inverted', 'secondary', 'secondary-inverted']> &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface PageComponentsHero extends Struct.ComponentSchema {
  collectionName: 'components_page_components_heroes';
  info: {
    displayName: 'Hero';
    icon: 'picture';
  };
  attributes: {
    mobileImage: Schema.Attribute.Media<'images'>;
    picture: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface PageComponentsHeroSlider extends Struct.ComponentSchema {
  collectionName: 'components_page_components_hero_sliders';
  info: {
    displayName: 'Hero Slider';
    icon: 'paintBrush';
  };
  attributes: {
    autoPlayTimerSec: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    slideEffect: Schema.Attribute.Enumeration<['slide', 'fade', 'flip']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'slide'>;
    Slides: Schema.Attribute.Component<'page-components.image', true>;
  };
}

export interface PageComponentsImage extends Struct.ComponentSchema {
  collectionName: 'components_page_components_images';
  info: {
    displayName: 'Image';
    icon: 'picture';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    mobileImage: Schema.Attribute.Media<'images'>;
  };
}

export interface PageComponentsSimpleText extends Struct.ComponentSchema {
  collectionName: 'components_page_components_simple_texts';
  info: {
    displayName: 'Simple Text';
    icon: 'bold';
  };
  attributes: {
    text: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
  };
}

export interface PageComponentsTextBox extends Struct.ComponentSchema {
  collectionName: 'components_page_components_text_boxes';
  info: {
    displayName: 'TextBox';
    icon: 'bold';
  };
  attributes: {
    content: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    ctas: Schema.Attribute.Component<'page-components.button', true>;
    title: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
  };
}

export interface PageHierarchyBlockSpacing extends Struct.ComponentSchema {
  collectionName: 'components_page_hierarchy_block_spacings';
  info: {
    displayName: 'BlockSpacing';
    icon: 'expand';
  };
  attributes: {
    customSpacing: Schema.Attribute.Component<'page-hierarchy.responsive-spacing', false>;
    spacingType: Schema.Attribute.Enumeration<['none', 'small', 'medium', 'large', 'xlarge', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'medium'>;
  };
}

export interface PageHierarchyContentSection extends Struct.ComponentSchema {
  collectionName: 'components_page_hierarchy_content_sections';
  info: {
    displayName: 'Content Section';
    icon: 'layout';
  };
  attributes: {
    content: Schema.Attribute.DynamicZone<
      [
        'page-components.hero',
        'page-components.simple-text',
        'page-components.text-box',
        'page-components.image',
        'page-components.hero-slider',
      ]
    >;
    customClassName: Schema.Attribute.String;
    inlineStyles: Schema.Attribute.Text;
    margins: Schema.Attribute.Component<'page-hierarchy.block-spacing', false>;
    maxWidth: Schema.Attribute.Enumeration<
      ['none', 'sm', 'md', 'lg', 'xl', 'max2xl', 'max3xl', 'max4xl', 'max5xl', 'max6xl', 'max7xl']
    > &
      Schema.Attribute.DefaultTo<'none'>;
    paddings: Schema.Attribute.Component<'page-hierarchy.block-spacing', false>;
  };
}

export interface PageHierarchyResponsiveSpacing extends Struct.ComponentSchema {
  collectionName: 'components_page_hierarchy_responsive_spacings';
  info: {
    displayName: 'ResponsiveSpacing';
    icon: 'arrows-alt-v';
  };
  attributes: {
    desktop: Schema.Attribute.Component<'page-hierarchy.spacing-values', false>;
    mobile: Schema.Attribute.Component<'page-hierarchy.spacing-values', false>;
    tablet: Schema.Attribute.Component<'page-hierarchy.spacing-values', false>;
    wide: Schema.Attribute.Component<'page-hierarchy.spacing-values', false>;
    xlarge: Schema.Attribute.Component<'page-hierarchy.spacing-values', false>;
  };
}

export interface PageHierarchySpacingValues extends Struct.ComponentSchema {
  collectionName: 'components_page_hierarchy_spacing_values';
  info: {
    displayName: 'SpacingValues';
    icon: 'arrows-alt';
  };
  attributes: {
    bottom: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 128;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    left: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 128;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    right: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 128;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    top: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 128;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
  };
}

export interface SharedOpenGraph extends Struct.ComponentSchema {
  collectionName: 'components_shared_open_graphs';
  info: {
    displayName: 'openGraph';
    icon: 'project-diagram';
  };
  attributes: {
    ogDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    ogType: Schema.Attribute.String;
    ogUrl: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
        minLength: 50;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaRobots: Schema.Attribute.String;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaViewport: Schema.Attribute.String;
    openGraph: Schema.Attribute.Component<'shared.open-graph', false>;
    structuredData: Schema.Attribute.JSON;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'menu.menu-item': MenuMenuItem;
      'menu.sub-menu-item': MenuSubMenuItem;
      'page-components.button': PageComponentsButton;
      'page-components.hero': PageComponentsHero;
      'page-components.hero-slider': PageComponentsHeroSlider;
      'page-components.image': PageComponentsImage;
      'page-components.simple-text': PageComponentsSimpleText;
      'page-components.text-box': PageComponentsTextBox;
      'page-hierarchy.block-spacing': PageHierarchyBlockSpacing;
      'page-hierarchy.content-section': PageHierarchyContentSection;
      'page-hierarchy.responsive-spacing': PageHierarchyResponsiveSpacing;
      'page-hierarchy.spacing-values': PageHierarchySpacingValues;
      'shared.open-graph': SharedOpenGraph;
      'shared.seo': SharedSeo;
    }
  }
}
