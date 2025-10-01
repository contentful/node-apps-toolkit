// Override BASE_URL if it's set to Vite's default
if (process.env.BASE_URL === '/') {
  process.env.BASE_URL = 'https://api.contentful.com'
}
