const fs = require('fs');
const path = require('path');

interface StrapiSchema {
  kind: string;
  collectionName: string;
  info: {
    singularName: string;
    pluralName: string;
    displayName: string;
    description?: string;
  };
  options: {
    draftAndPublish?: boolean;
  };
  pluginOptions?: {
    i18n?: {
      localized?: boolean;
    };
  };
  attributes: Record<string, any>;
}

interface ComponentSchema {
  collectionName: string;
  info: {
    displayName: string;
    icon?: string;
  };
  options: Record<string, any>;
  attributes: Record<string, any>;
}

interface GeneratedType {
  name: string;
  content: string;
}

interface StrapiMediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path?: string;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}

function generateComponentTypeFromSchema(schema: ComponentSchema): GeneratedType {
  const { info, attributes } = schema;
  // Convert display name to PascalCase for TypeScript interface names
  // Handle both spaces and hyphens, and remove any special characters
  let typeName = info.displayName
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
    .split(/[\s-]+/) // Split by spaces or hyphens
    .map(word => {
      // If the word is already in PascalCase (starts with uppercase), preserve it
      if (word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 1) {
        return word;
      }
      // Otherwise, convert to PascalCase
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
  // Special case: always use OpenGraph for this interface
  if (typeName === 'Opengraph') typeName = 'OpenGraph';

  let content = `export interface ${typeName} {\n`;
  
  // Process component attributes
  for (const [key, attr] of Object.entries(attributes)) {
    const { type, required = false } = attr;
    const optional = required ? '' : '?';
    
    let tsType = 'any';
    
    switch (type) {
      case 'string':
        tsType = 'string';
        break;
      case 'text':
        tsType = 'string';
        break;
      case 'richtext':
        tsType = 'string';
        break;
      case 'integer':
        tsType = 'number';
        break;
      case 'biginteger':
        tsType = 'number';
        break;
      case 'decimal':
        tsType = 'number';
        break;
      case 'float':
        tsType = 'number';
        break;
      case 'boolean':
        tsType = 'boolean';
        break;
      case 'date':
        tsType = 'string';
        break;
      case 'datetime':
        tsType = 'string';
        break;
      case 'time':
        tsType = 'string';
        break;
      case 'timestamp':
        tsType = 'string';
        break;
      case 'uid':
        tsType = 'string';
        break;
      case 'json':
        tsType = 'unknown';
        break;
      case 'enumeration':
        tsType = attr.enum?.map((e: string) => `'${e}'`).join(' | ') || 'string';
        break;
      case 'media':
        tsType = 'StrapiMedia';
        break;
      case 'relation':
        // Always map relation targets like 'api::page.page' to PascalCase type name (e.g., 'Page')
        const targetTypeName = attr.target
          .replace(/^api::/, '') // Remove api:: prefix
          .replace(/^plugin::/, '') // Remove plugin:: prefix if present
          .split('.')
          .pop()! // Get the last part after dot
          .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
          .split(/[\s-]+/) // Split by spaces or hyphens
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
        // For multiple relations, use array type
        if (attr.relation === 'oneToMany' || attr.relation === 'manyToMany') {
          tsType = `${targetTypeName}[]`;
        } else {
          tsType = targetTypeName;
        }
        break;
      case 'component':
        // For nested components, use only the last part after dot, PascalCase by spaces and hyphens
        let componentName = attr.component
          .split('.')
          .pop()!
          .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
          .split(/[\s-]+/) // Split by spaces or hyphens
          .map(word => {
            // If the word is already in PascalCase (starts with uppercase), preserve it
            if (word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 1) {
              return word;
            }
            // Otherwise, convert to PascalCase
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          })
          .join('');
        // Special case: always use OpenGraph for openGraph
        if (componentName === 'Opengraph' || key === 'openGraph') componentName = 'OpenGraph';
        tsType = attr.repeatable ? `${componentName}[]` : componentName;
        break;
      case 'dynamiczone':
        // For dynamic zones, create a union type of all allowed components
        if (attr.components && Array.isArray(attr.components)) {
          const componentTypes = attr.components.map(comp => {
            const componentName = comp
              .split('.')
              .pop()!
              .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
              .split(/[\s-]+/) // Split by spaces or hyphens
              .map(word => {
                // If the word is already in PascalCase (starts with uppercase), preserve it
                if (word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 1) {
                  return word;
                }
                // Otherwise, convert to PascalCase
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
              })
              .join('');
            return componentName;
          });
          tsType = componentTypes.join(' | ');
        } else {
          tsType = 'Record<string, unknown>';
        }
        break;
      default:
        tsType = 'Record<string, unknown>';
    }
    
    content += `  ${key}${optional}: ${tsType};\n`;
  }
  
  content += `}\n\n`;
  
  return { name: typeName, content };
}

function generateTypeFromSchema(schema: StrapiSchema): GeneratedType {
  const { info, attributes, options, kind } = schema;
  // Convert kebab-case to PascalCase for TypeScript interface names
  const typeName = info.singularName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  // For single types, we need to generate both the base type and response type
  if (kind === 'singleType') {
    // Generate the base type first
    let baseContent = `export interface ${typeName} {\n`;
    baseContent += `  id: number;\n`;
    baseContent += `  documentId: string;\n`;
    
    // In Strapi v5, attributes are flattened directly on the object
    for (const [key, attr] of Object.entries(attributes)) {
      const { type, required = false, unique = false } = attr;
      const optional = required ? '' : '?';
      
      let tsType = 'any';
      
      switch (type) {
        case 'string':
          tsType = 'string';
          break;
        case 'text':
          tsType = 'string';
          break;
        case 'richtext':
          tsType = 'string';
          break;
        case 'integer':
          tsType = 'number';
          break;
        case 'biginteger':
          tsType = 'number';
          break;
        case 'decimal':
          tsType = 'number';
          break;
        case 'float':
          tsType = 'number';
          break;
        case 'boolean':
          tsType = 'boolean';
          break;
        case 'date':
          tsType = 'string';
          break;
        case 'datetime':
          tsType = 'string';
          break;
        case 'time':
          tsType = 'string';
          break;
        case 'timestamp':
          tsType = 'string';
          break;
        case 'uid':
          tsType = 'string';
          break;
        case 'json':
          tsType = 'unknown';
          break;
        case 'enumeration':
          tsType = attr.enum?.map((e: string) => `'${e}'`).join(' | ') || 'string';
          break;
        case 'media':
          tsType = 'StrapiMedia';
          break;
        case 'component':
          // For components, use only the last part after dot, PascalCase by hyphen
          const componentName = attr.component
            .split('.')
            .pop()!
            .split('-')
            .map(word => {
              // If the word is already in PascalCase (starts with uppercase), preserve it
              if (word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 1) {
                return word;
              }
              // Otherwise, convert to PascalCase
              return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join('');
          tsType = attr.repeatable ? `${componentName}[]` : componentName;
          break;
        case 'dynamiczone':
          // For dynamic zones, create a union type of all allowed components
          if (attr.components && Array.isArray(attr.components)) {
            const componentTypes = attr.components.map(comp => {
              const componentName = comp
                .split('.')
                .pop()!
                .split('-')
                .map(word => {
                  // If the word is already in PascalCase (starts with uppercase), preserve it
                  if (word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 1) {
                    return word;
                  }
                  // Otherwise, convert to PascalCase
                  return word.charAt(0).toUpperCase() + word.slice(1);
                })
                .join('');
              return componentName;
            });
            tsType = componentTypes.join(' | ');
          } else {
            tsType = 'Record<string, unknown>';
          }
          break;
        case 'relation':
          // Always map relation targets like 'api::menu.menu' to PascalCase type name (e.g., 'Menu')
          const targetTypeName = attr.target
            .replace(/^api::/, '') // Remove api:: prefix
            .replace(/^plugin::/, '') // Remove plugin:: prefix if present
            .split('.')
            .pop()! // Get the last part after dot
            .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
            .split(/[\s-]+/) // Split by spaces or hyphens
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
          // For populated relations, use the direct type instead of StrapiResponse wrapper
          // Check if it's a multiple relation (one-to-many, many-to-many)
          if (attr.relation === 'oneToMany' || attr.relation === 'manyToMany') {
            tsType = `${targetTypeName}[]`;
          } else {
            tsType = targetTypeName;
          }
          break;
        default:
          tsType = 'Record<string, unknown>';
      }
      
      baseContent += `  ${key}${optional}: ${tsType};\n`;
    }
    
    if (options.draftAndPublish) {
      baseContent += `  publishedAt?: string;\n`;
    }
    
    // Add locale and localizations for i18n
    if (schema.pluginOptions?.i18n?.localized) {
      baseContent += `  locale: string;\n`;
      baseContent += `  localizations?: ${typeName}[];\n`;
    }
    
    baseContent += `  createdAt: string;\n`;
    baseContent += `  updatedAt: string;\n`;
    baseContent += `}\n\n`;
    
    return { name: typeName, content: baseContent };
  }
  
  // For collection types, generate the standard interface
  let content = `export interface ${typeName} {\n`;
  content += `  id: number;\n`;
  content += `  documentId: string;\n`;
  
  // In Strapi v5, attributes are flattened directly on the object
  for (const [key, attr] of Object.entries(attributes)) {
    const { type, required = false, unique = false } = attr;
    const optional = required ? '' : '?';
    
    let tsType = 'any';
    
    switch (type) {
      case 'string':
        tsType = 'string';
        break;
      case 'text':
        tsType = 'string';
        break;
      case 'richtext':
        tsType = 'string';
        break;
      case 'integer':
        tsType = 'number';
        break;
      case 'biginteger':
        tsType = 'number';
        break;
      case 'decimal':
        tsType = 'number';
        break;
      case 'float':
        tsType = 'number';
        break;
      case 'boolean':
        tsType = 'boolean';
        break;
      case 'date':
        tsType = 'string';
        break;
      case 'datetime':
        tsType = 'string';
        break;
      case 'time':
        tsType = 'string';
        break;
      case 'timestamp':
        tsType = 'string';
        break;
      case 'uid':
        tsType = 'string';
        break;
      case 'json':
        tsType = 'unknown';
        break;
      case 'enumeration':
        tsType = attr.enum?.map((e: string) => `'${e}'`).join(' | ') || 'string';
        break;
      case 'media':
        tsType = 'StrapiMedia';
        break;
              case 'component':
          // For components, use only the last part after dot, PascalCase by spaces and hyphens
          const componentName = attr.component
            .split('.')
            .pop()!
            .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
            .split(/[\s-]+/) // Split by spaces or hyphens
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
          tsType = attr.repeatable ? `${componentName}[]` : componentName;
          break;
        case 'dynamiczone':
          // For dynamic zones, create a union type of all allowed components
          if (attr.components && Array.isArray(attr.components)) {
            const componentTypes = attr.components.map(comp => {
              const componentName = comp
                .split('.')
                .pop()!
                .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
                .split(/[\s-]+/) // Split by spaces or hyphens
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('');
              return componentName;
            });
            tsType = componentTypes.join(' | ');
          } else {
            tsType = 'Record<string, unknown>';
          }
          break;
      case 'relation':
        // Always map relation targets like 'api::menu.menu' to PascalCase type name (e.g., 'Menu')
        const targetTypeName = attr.target
          .replace(/^api::/, '') // Remove api:: prefix
          .replace(/^plugin::/, '') // Remove plugin:: prefix if present
          .split('.')
          .pop()! // Get the last part after dot
          .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
          .split(/[\s-]+/) // Split by spaces or hyphens
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
        // For populated relations, use the direct type instead of StrapiResponse wrapper
        // Check if it's a multiple relation (one-to-many, many-to-many)
        if (attr.relation === 'oneToMany' || attr.relation === 'manyToMany') {
          tsType = `${targetTypeName}[]`;
        } else {
          tsType = targetTypeName;
        }
        break;
      default:
        tsType = 'Record<string, unknown>';
    }
    
    content += `  ${key}${optional}: ${tsType};\n`;
  }
  
  content += `}\n\n`;
  
  return { name: typeName, content };
}

function generateStrapiTypes(): void {
  const schemasDir = path.join(__dirname, '..', 'src', 'api');
  const componentsDir = path.join(__dirname, '..', 'src', 'components');
  const outputDir = path.join(__dirname, '..', '..', 'frontend', 'types');

  // Read the plugins configuration to get actual breakpoints
  const pluginsPath = path.join(__dirname, '..', 'config', 'plugins.ts');
  let breakpoints = ['thumbnail', 'medium', 'small', 'large']; // fallback defaults
  
  try {
    if (fs.existsSync(pluginsPath)) {
      const pluginsContent = fs.readFileSync(pluginsPath, 'utf8');
      // Extract breakpoints from the plugins config
      const breakpointsMatch = pluginsContent.match(/breakpoints:\s*{([^}]+)}/);
      if (breakpointsMatch) {
        const breakpointsContent = breakpointsMatch[1];
        const breakpointMatches = breakpointsContent.matchAll(/(\w+):\s*\d+/g);
        breakpoints = ['thumbnail', ...Array.from(breakpointMatches, match => match[1])];
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not read plugins config, using default breakpoints');
  }

  const formatsType = breakpoints.map(bp => `    ${bp}?: StrapiMediaFormat;`).join('\n');
  const webpFormatsType = breakpoints.map(bp => `    ${bp}_webp?: StrapiMediaFormat;`).join('\n');

  let allTypes = `// Auto-generated types from Strapi v5 schema\n// Generated on: ${new Date().toISOString()}\n// Do not edit this file manually - it will be overwritten\n\nexport interface StrapiResponse<T> {\n  data: T;\n  meta: {\n    pagination?: {\n      page: number;\n      pageSize: number;\n      pageCount: number;\n      total: number;\n    };\n  };\n}\n\nexport interface StrapiGraphQLResponse<T> {\n  data: {\n    [key: string]: T[];\n  };\n}\n\nexport interface StrapiMediaFormat {\n  name: string;\n  hash: string;\n  ext: string;\n  mime: string;\n  path?: string;\n  width: number;\n  height: number;\n  size: number;\n  sizeInBytes: number;\n  url: string;\n}\n\nexport interface StrapiMedia {\n  id: number;\n  documentId: string;\n  name: string;\n  alternativeText?: string;\n  caption?: string;\n  width?: number;\n  height?: number;\n  formats?: {\n${formatsType}\n    webp?: StrapiMediaFormat;\n${webpFormatsType}\n  };\n  hash: string;\n  ext: string;\n  mime: string;\n  size: number;\n  url: string;\n  previewUrl?: string;\n  provider: string;\n  provider_metadata?: Record<string, unknown>;\n  createdAt: string;\n  updatedAt: string;\n  publishedAt: string;\n}\n\n`;

  // Read all component schema files first
  function readComponentSchemas(dir: string): void {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        // Look for JSON files in the component directory
        const componentFiles = fs.readdirSync(fullPath).filter(file => file.endsWith('.json'));
        for (const file of componentFiles) {
          const schemaPath = path.join(fullPath, file);
          try {
            const schemaContent = fs.readFileSync(schemaPath, 'utf8');
            const schema: ComponentSchema = JSON.parse(schemaContent);
            const generatedType = generateComponentTypeFromSchema(schema);
            allTypes += generatedType.content;
          } catch (error) {
            console.error(`❌ Error processing component schema ${schemaPath}: ${error}`);
          }
        }
        readComponentSchemas(fullPath);
      }
    }
  }

  // Read all API schema files
  function readSchemas(dir: string): void {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const schemaPath = path.join(fullPath, 'content-types', item, 'schema.json');
        if (fs.existsSync(schemaPath)) {
          try {
            const schemaContent = fs.readFileSync(schemaPath, 'utf8');
            const schema: StrapiSchema = JSON.parse(schemaContent);
            const generatedType = generateTypeFromSchema(schema);
            allTypes += generatedType.content;
          } catch (error) {
            console.error(`❌ Error processing schema ${schemaPath}: ${error}`);
          }
        }
        readSchemas(fullPath);
      }
    }
  }

  // Process components first so they're available for API types
  readComponentSchemas(componentsDir);
  readSchemas(schemasDir);

  // Write the generated types
  const outputFile = path.join(outputDir, 'strapi.ts');
  fs.writeFileSync(outputFile, allTypes);
}

generateStrapiTypes();
