export const API_ENDPOINT = 'https://www.sreality.cz/api'

export async function httpCall<T>(args: {
  url: URL | string
  appendToApi?: boolean
}): Promise<
  { ok: true; data: T; cookie: string | null } | { ok: false; error: unknown }
> {
  const { url, appendToApi } = args
  try {
    const uri = `${appendToApi ? API_ENDPOINT : ''}${url}`
    console.log(uri)
    const response = await fetch(uri, {
      headers: process.env.SREALITY_AUTH
        ? { Cookie: `ds=${process.env.SREALITY_AUTH}` }
        : {}
    })
    const result = await response.json()
    const setCookie = response.headers.get('Set-Cookie')
    return {
      ok: true,
      data: result as T,
      cookie: setCookie
    }
  } catch (error) {
    return {
      ok: false,
      error
    }
  }
}
