import sanitizeHtml from 'sanitize-html';

export const sanitizeRichText = (value?: string | null) => {
  if (!value) {
    return null;
  }

  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
};

export const sanitizePlainText = (value?: string | null) => {
  if (!value) {
    return null;
  }

  return value.replace(/\s+/g, ' ').trim();
};
