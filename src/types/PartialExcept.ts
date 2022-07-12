type PartialExcept<T, K extends keyof T> = Partial<T> & { [key in K]: T[key] };
export default PartialExcept;
