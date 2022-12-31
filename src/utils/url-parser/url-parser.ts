export interface IParsedURL {
  url?: URL;
  original?: string;
  valid?: boolean;
}

export default function ParseURL(urlString: string): IParsedURL {
  let payload: IParsedURL = {
    url: undefined,
    original: urlString,
    valid: false,
  };
  const hasURLParts = (str: string): boolean => {
    // http:,,host
    let valid = true;
    let chunks = (str || "").split("/");
    if (chunks[0].search("http") == -1) {
      valid = false;
    }
    if (chunks.length < 2) {
      valid = false;
    }
    return valid;
  };

  try {
    payload.url = new URL(urlString);
    payload.valid = hasURLParts(urlString);
  } catch (e) {
    payload.valid = false;
  }

  return payload;
}

interface IURLParams {
  [key: string]: string;
}
export function getURLParams(url: string): IURLParams {
  let urlParams: IURLParams = {};
  // Get URL params - split em up - loop over them - fill urlParams object
  let split = url.split("?");
  if (split.length == 2) {
    split[1].split("&").forEach((chunks) => {
      let kv = chunks.split("=");
      urlParams[kv[0]] = kv[1];
    });
  }

  return urlParams;
}
