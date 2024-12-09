export const filterObject = (obj: Record<string, any>) => {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => !!value));
};
