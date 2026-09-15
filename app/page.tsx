import { getPages } from "@/lib/wordpress"

export default async function Home() {
  const pages = await getPages()

  return (
    <main style={{ padding: "40px" }}>
      <h1>RMP Works</h1>

      <p>WordPress connection test</p>

      <pre>{JSON.stringify(pages, null, 2)}</pre>
    </main>
  )
}