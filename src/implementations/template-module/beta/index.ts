export function Log(message: string) {
  console.log(message);
  return Promise.resolve();
}
