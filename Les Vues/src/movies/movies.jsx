import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCachedData } from "../utils/cacheUtils";
import movieStyles from "./movies.module.css";

const PROVIDERS = {
    "vidsrc.mov": {
        movie: (id) => `https://vidsrc.mov/embed/movie/${id}`,
        tv: (id, s, e) => `https://vidsrc.mov/embed/tv/${id}/${s}/${e}`
    },
    "vidsrc.fyi": {
        movie: (id) => `https://vidsrc.fyi/embed/movie/${id}`,
        tv: (id, s, e) => `https://vidsrc.fyi/embed/tv/${id}/${s}/${e}`
    },
    "vidrock": {
        movie: (id) => `https://vidrock.ru/movie/${id}`,
        tv: (id, s, e) => `https://vidrock.ru/tv/${id}/${s}/${e}`
    },
    "2embed": {
        movie: (id) => `https://www.2embed.online/embed/movie/${id}`,
        tv: (id, s, e) => `https://www.2embed.online/embed/tv/${id}/${s}/${e}`
    }
};

function Movies() {
    const { key } = useParams();

    if (!key) return

    const movieData = getCachedData(key);

    if (!movieData) return

    const id = movieData.data.id 
    const overview = movieData.data.overview 
    const title = movieData.data.title 
    const media = movieData.data.media_type
    const backdropPath = movieData.data.backdrop_path

    const isTv = media === "tv" || (!media && Boolean(movieData.data.first_air_date));

    const [provider, setProvider] = useState("vidsrc.mov");
    const [activeSeason, setActiveSeason] = useState(1);
    const [activeEpisode, setActiveEpisode] = useState(1);
    const [expandedDropdown, setExpandedDropdown] = useState(null); 

    const [seriesInfo, setSeriesInfo] = useState(null);
    const [seasonsData, setSeasonsData] = useState({});

    // Fetch series info on mount
    useEffect(() => {
        if (isTv && id) {
            fetch(`${import.meta.env.VITE_API_URL}/api/movies/get_series_info?id=${id}`)
                .then(async res => {
                    const data = await res.json();
                    if (!res.ok) {
                        throw new Error(data.details || data.error || "Failed to fetch series info");
                    }
                    return data;
                })
                .then(data => setSeriesInfo(data))
                .catch(err => {
                    console.error("Error fetching series info:", err.message);
                    setSeriesInfo({ error: true });
                });
        }
    }, [isTv, id]);

    const handleSeasonToggle = (seasonNumber) => {
        if (expandedDropdown === seasonNumber) {
            setExpandedDropdown(null);
            return;
        }

        setExpandedDropdown(seasonNumber);

        if (!seasonsData[seasonNumber]) {
            fetch(`/api/movies/get_series_info?id=${id}&seasonNumber=${seasonNumber}`)
                .then(async res => {
                    const data = await res.json();
                    if (!res.ok) {
                        throw new Error(data.details || data.error || `Failed to fetch season ${seasonNumber}`);
                    }
                    return data;
                })
                .then(data => {
                    setSeasonsData(prev => ({
                        ...prev,
                        [seasonNumber]: data.episodes || []
                    }));
                })
                .catch(err => {
                    console.error("Error fetching season data:", err.message);
                    setSeasonsData(prev => ({
                        ...prev,
                        [seasonNumber]: []
                    }));
                });
        }
    };

    const handleEpisodeSelect = (seasonNum, episodeNum) => {
        setActiveSeason(seasonNum);
        setActiveEpisode(episodeNum);
    };

    if (!id) {
        return <div className={movieStyles.noData}>No media data available.</div>;
    }

    const embedUrl = !isTv
        ? PROVIDERS[provider].movie(id) 
        : PROVIDERS[provider].tv(id, activeSeason, activeEpisode);

    const bgImageUrl = backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : null;

    return (
        <div className={movieStyles.pageWrapper}>
            {bgImageUrl && (
                <div 
                    className={movieStyles.bgOverlay} 
                    style={{ backgroundImage: `url(${bgImageUrl})` }} 
                />
            )}

            <div className={movieStyles.container}>
                <div className={movieStyles.topSection}>
                    <div className={movieStyles.iframeWrapper}>
                        <iframe
                            src={embedUrl}
                            className={movieStyles.iframe}
                            allowFullScreen
                            title={title}
                        />
                    </div>

                    <div className={movieStyles.serverSidebar}>
                        <h3 className={movieStyles.serverTitle}>Select Server</h3>
                        {Object.keys(PROVIDERS).map(p => (
                            <button
                                key={p}
                                onClick={() => setProvider(p)}
                                className={`${movieStyles.serverButton} ${provider === p ? movieStyles.serverButtonActive : ''}`}
                            >
                                {p} {provider === p && "✓"}
                            </button>
                        ))}
                    </div>
                </div>

                {isTv && (
                    <div className={movieStyles.seasonsSection}>
                        <h3 className={movieStyles.seasonsTitle}>Seasons</h3>
                        
                        {!seriesInfo ? (
                            <div className={movieStyles.loadingText}>Loading series info...</div>
                        ) : seriesInfo.error ? (
                            <div className={movieStyles.loadingText}>Error loading series data.</div>
                        ) : (
                            <>
                                <div className={movieStyles.seasonsList}>
                                    {seriesInfo.seasons?.filter(s => s.season_number > 0).map(season => (
                                        <button
                                            key={season.id}
                                            onClick={() => handleSeasonToggle(season.season_number)}
                                            className={`${movieStyles.seasonButton} ${expandedDropdown === season.season_number ? movieStyles.seasonButtonActive : ''}`}
                                        >
                                            Season {season.season_number}
                                            <span>{expandedDropdown === season.season_number ? "▲" : "▼"}</span>
                                        </button>
                                    ))}
                                </div>

                                {expandedDropdown !== null && (
                                    <div className={movieStyles.episodesPanel}>
                                        {!seasonsData[expandedDropdown] ? (
                                            <div className={movieStyles.loadingText}>Loading episodes...</div>
                                        ) : seasonsData[expandedDropdown].length === 0 ? (
                                            <div className={movieStyles.loadingText}>No episodes available.</div>
                                        ) : (
                                            seasonsData[expandedDropdown].map(ep => (
                                                <button
                                                    key={ep.id}
                                                    onClick={() => handleEpisodeSelect(expandedDropdown, ep.episode_number)}
                                                    className={`${movieStyles.episodeButton} ${(activeSeason === expandedDropdown && activeEpisode === ep.episode_number) ? movieStyles.episodeButtonActive : ''}`}
                                                >
                                                    <strong>Ep {ep.episode_number}:</strong> {ep.name}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                <div className={movieStyles.infoSection}>
                    <h1 className={movieStyles.mediaTitle}>{title}</h1>
                    <p className={movieStyles.overview}>{overview}</p>
                </div>
            </div>
        </div>
    );
}

export default Movies;