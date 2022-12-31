import latinize from "./latinize";
import { parseBooleanQuery } from "boolean-parser";
export default (query: string) => {
  // Remove latin elements
  // Replace and or with AND and OR
  query = latinize(query.toLowerCase()).replace(/\s(and|or)\s/g, (a, l) => {
    return ` ${l.toUpperCase()} `;
  });
  // Break down and / or lookup words
  return parseBooleanQuery(query);
};
