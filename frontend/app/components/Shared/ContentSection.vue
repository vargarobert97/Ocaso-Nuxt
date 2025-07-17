<template>
  <section
    v-if="content"
    :class="[
      'content-section',
      customClassName && customClassName,
      `content-section--max-width-${maxWidth}`,
      `content-section--index-${index}`,
      {
        'content-section--first': isFirst,
        'content-section--last': isLast,
      },
      sectionClass,
    ]"
  >
    <div class="content-section__container">
      <PageComponentsDynamicComponent
        v-for="(component, componentIndex) in content.content"
        :key="componentIndex"
        :component="component"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { ContentSection } from '~/types/graphql';

  const { content, index, isFirst, isLast } = defineProps<{
    content: ContentSection;
    index: number;
    isFirst: boolean;
    isLast: boolean;
  }>();

  const maxWidth = content.maxWidth || 'none';
  const customClassName = content.customClassName;

  // Generate unique ID for this section
  const sectionId = useId();

  // Generate unique class name for this section
  const sectionClass = `content-section--${sectionId}`;

  // Inject sanitized CSS if inlineStyles exist
  if (content.inlineStyles) {
    const sanitizedCSS = sanitizeCSS(content.inlineStyles, sectionClass);
    if (sanitizedCSS) {
      useHead({
        style: [
          {
            innerHTML: sanitizedCSS,
          },
        ],
      });
    }
  }

  /**
   * Sanitize CSS and scope it to the section class
   *
   * Supports these formats:
   * - Inline styles: {margin-top: 10px; border: 1px solid black;}
   * - Full CSS: .simple-text { color: red; }
   * - Multiple rules: .simple-text { color: red; } .another-class { background: blue; }
   * - Mixed inline + nested: {margin-top: 10px; color: red;} .another-class { background: blue; }
   */
  function sanitizeCSS(css: string, className: string): string | null {
    if (!css || typeof css !== 'string') return null;

    // Basic CSS sanitization - remove dangerous content
    const sanitized = css
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/expression\s*\(/gi, '')
      .replace(/url\s*\(\s*['"]?\s*javascript:/gi, '');

    // Check if this looks like inline styles (no selectors)
    if (!sanitized.includes('{') && !sanitized.includes('}')) {
      // Treat as inline styles - apply to the section class
      const sanitizedDeclaration = sanitizeCSSDeclaration(sanitized);
      if (sanitizedDeclaration) {
        return `.${className} { ${sanitizedDeclaration} }`;
      }
      return null;
    }

    // Check if this looks like inline styles wrapped in braces (like {background: red;})
    if (sanitized.startsWith('{') && sanitized.endsWith('}')) {
      const content = sanitized.slice(1, -1).trim(); // Remove braces

      // Check if content contains nested selectors (mixed inline + nested)
      if (content.includes('{') || content.includes('}')) {
        return parseMixedStyles(content, className);
      }

      const sanitizedDeclaration = sanitizeCSSDeclaration(content);
      if (sanitizedDeclaration) {
        return `.${className} { ${sanitizedDeclaration} }`;
      }
      return null;
    }

    // Split into CSS rules and process each one
    const rules = sanitized.split('}').filter(rule => rule.trim());
    const processedRules: string[] = [];

    for (const rule of rules) {
      const [selectors, ...declarations] = rule.split('{');
      if (!selectors || !declarations.length) continue;

      const selector = selectors.trim();
      const declaration = declarations.join('{').trim();

      // Skip if declaration is empty
      if (!declaration) continue;

      // Validate and sanitize the declaration
      const sanitizedDeclaration = sanitizeCSSDeclaration(declaration);
      if (!sanitizedDeclaration) continue;

      // Scope the selector to this section
      const scopedSelector = scopeSelector(selector, className);
      processedRules.push(`${scopedSelector} { ${sanitizedDeclaration} }`);
    }

    return processedRules.length > 0 ? processedRules.join('\n') : null;
  }

  /**
   * Sanitize individual CSS declaration
   */
  function sanitizeCSSDeclaration(declaration: string): string | null {
    const properties = declaration.split(';').filter(prop => prop.trim());
    const sanitizedProps: string[] = [];

    for (const prop of properties) {
      const [property, value] = prop.split(':').map(part => part.trim());
      if (!property || !value) continue;

      // Basic property validation
      if (!/^[a-zA-Z-]+$/.test(property) || property.length > 50) continue;

      // Basic value validation
      if (!/^[a-zA-Z0-9\s\-_.,%()#"'\u002F]+$/.test(value) || value.length > 200) continue;

      // Additional security checks for URLs
      if (value.includes('url(') && !value.match(/^url\(['"]?[a-zA-Z0-9\u002F\-_.:]+['"]?\)$/)) continue;

      sanitizedProps.push(`${property}: ${value}`);
    }

    return sanitizedProps.length > 0 ? sanitizedProps.join('; ') : null;
  }

  /**
   * Scope CSS selector to this section
   */
  function scopeSelector(selector: string, className: string): string {
    // Handle multiple selectors (comma-separated)
    const selectors = selector.split(',').map(s => s.trim());

    return selectors
      .map(sel => {
        // If it's already scoped to our class, return as is
        if (sel.includes(className)) return sel;

        // Otherwise, scope it to our section
        return `.${className} ${sel}`;
      })
      .join(', ');
  }

  /**
   * Parses mixed inline styles and nested selectors.
   * This function handles cases where a single declaration block contains both
   * inline styles (e.g., `{margin-top: 10px; color: red;}`) and nested selectors
   * (e.g., `.another-class { background: blue; }`).
   * It returns a string of scoped CSS rules.
   */
  function parseMixedStyles(css: string, className: string): string | null {
    const rules: string[] = [];
    const declarations = css.split(';').filter(d => d.trim());

    for (const declaration of declarations) {
      const [selectors, ...declarations] = declaration.split('{');
      if (!selectors || !declarations.length) continue;

      const selector = selectors.trim();
      const declarationContent = declarations.join('{').trim();

      // Check if it's an inline style
      if (declarationContent.includes('{') && declarationContent.includes('}')) {
        const sanitizedDeclaration = sanitizeCSSDeclaration(declarationContent);
        if (sanitizedDeclaration) {
          rules.push(`${selector} { ${sanitizedDeclaration} }`);
        }
      } else {
        // It's a nested selector, scope it
        const scopedSelector = scopeSelector(selector, className);
        rules.push(`${scopedSelector} { ${declarationContent} }`);
      }
    }

    return rules.length > 0 ? rules.join('\n') : null;
  }
</script>
