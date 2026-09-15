const API_URL = process.env.WORDPRESS_API_URL

if (!API_URL) {
  throw new Error("WORDPRESS_API_URL is not defined")
}

export async function getPages() {
  const res = await fetch(`${API_URL}/pages`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch WordPress pages: ${res.status}`)
  }

  return res.json()
}

export async function getPosts() {
  const res = await fetch(`${API_URL}/posts`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch WordPress posts: ${res.status}`)
  }

  return res.json()
}