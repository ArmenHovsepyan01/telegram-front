import { filterObject } from './filterObject';

export const getEndpoint = (path: string, params?: Record<string, string>) => {
  let url = `/api${path}`;
  if (params) {
    url += '?' + new URLSearchParams(filterObject(params)).toString();
  }
  return url;
};
