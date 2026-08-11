import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { getCachedData } from "../utils/cacheUtils"

function Movies(){
    const { key } = useParams()

    const movieData = getCachedData(key)

    const movieID = movieData.data.id

    const url = `https://vidsrc.mov/embed/movie/${movieID}`

    return(
        <div>
            <iframe src={url} frameborder="0"></iframe>
        </div>
    )
}

export default Movies