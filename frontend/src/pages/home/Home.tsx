import { useEffect } from "react"

function Home() {
    useEffect(() => {
        window.location.href = "/login"
    }, [])
  return (
    <div></div>
  )
}

export default Home