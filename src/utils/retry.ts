/**
 * Runs `fn`, and while `shouldRetry` says the result is a failure, waits and
 * tries again -- once per entry in `delaysMs`. Returns the last result, so the
 * caller still sees the failure if every attempt fails.
 */
export async function retryWhile<T>(
  fn: () => Promise<T>,
  shouldRetry: (result: T) => boolean,
  delaysMs: number[],
): Promise<T> {
  let result = await fn()
  for (const delay of delaysMs) {
    if (!shouldRetry(result)) break
    await new Promise((resolve) => setTimeout(resolve, delay))
    result = await fn()
  }
  return result
}
