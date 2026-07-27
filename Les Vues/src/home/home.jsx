import { useEffect, useState, useRef, useCallback } from 'react';
import homeStyles from './home.module.css';
import MovieGrid from './movieGrid.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

function Home() {
    const [visibleMovies, setVisibleMovies] = useState([]);
    const [visibleSeries, setVisibleSeries] = useState([]);
    const [cachedMovies, setCachedMovies] = useState([]);
    const [cachedSeries, setCachedSeries] = useState([]);
    const [networkPage, setNetworkPage] = useState(0);

    // --- Search States ---
    const [movieSearch, setMovieSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultPage, setSearchResultPage] = useState(0);
    const [searchTotalPages, setSearchTotalPages] = useState(1);
    const [displaySearchResults, setDisplaySearchResults] = useState(false);

    // --- Observers & Refs ---
    const movieObserver = useRef();
    const seriesObserver = useRef();
    const searchObserver = useRef();
    const isFetching = useRef(false);
    const isFetchingSearch = useRef(false);

    // Tracks the current active query to prevent stale responses from altering state
    const activeSearchQueryRef = useRef("");

    const CACHE_TTL = 12 * 60 * 60 * 1000;

    // --- Cache Helper Functions (Format Unchanged) ---
    const cleanExpiredCache = () => {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const raw = localStorage.getItem(key);
            try {
                const entry = JSON.parse(raw);
                if (entry.timestamp && Date.now() - entry.timestamp > CACHE_TTL) {
                    localStorage.removeItem(key);
                }
            } catch (e) {
                // Not a cache entry, skip
            }
        }
    };

    const getCachedData = (key) => {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        try {
            const entry = JSON.parse(raw);
            const now = Date.now();

            if (now - entry.timestamp > CACHE_TTL) {
                localStorage.removeItem(key);
                return null;
            }
            return entry;
        } catch (e) {
            return null;
        }
    };

    const setCachedData = (key, data, page) => {
        const entry = {
            data: data,
            page: page,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(entry));
    };

    const updateCachedData = (key, newData, page) => {
        const existing = getCachedData(key);
        if (!existing) {
            setCachedData(key, newData, page);
            return;
        }

        const mergedData = filterUnique(existing.data, newData);
        const entry = {
            data: mergedData,
            page: page,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(entry));
    };

    const filterUnique = (prevList = [], newList = []) => {
        const existingIds = new Set(prevList.map(item => item.id));
        return [...prevList, ...newList.filter(item => !existingIds.has(item.id))];
    };

    // --- Fetch Trending Movies/Series ---
    const fetchTrending = async (targetPage, trigger) => {
        if (isFetching.current) return;
        isFetching.current = true;

        try {
            const cachedMoviesData = getCachedData("trendingMovies");
            const cachedSeriesData = getCachedData("trendingSeries");

            if (cachedMoviesData && cachedSeriesData && trigger === "initial") {
                setVisibleMovies(cachedMoviesData.data);
                setVisibleSeries(cachedSeriesData.data);
                setNetworkPage(cachedMoviesData.page);
                isFetching.current = false;
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/movies/get_popular_movies?page=${targetPage}`);
            const data = await response.json();

            const newMovies = (data.results || []).filter(i => i.media_type === "movie");
            const newSeries = (data.results || []).filter(i => i.media_type === "tv");

            if (trigger === "initial") {
                setVisibleMovies(newMovies);
                setVisibleSeries(newSeries);

                setCachedData("trendingMovies", newMovies, data.page);
                setCachedData("trendingSeries", newSeries, data.page);
            } else if (trigger === "movies") {
                setVisibleMovies(prev => filterUnique(prev, newMovies));
                setVisibleSeries(prev => filterUnique(prev, newSeries));

                updateCachedData("trendingMovies", newMovies, data.page);
                updateCachedData("trendingSeries", newSeries, data.page);
            } else if (trigger === "series") {
                setVisibleSeries(prev => filterUnique(prev, newSeries));
                setVisibleMovies(prev => filterUnique(prev, newMovies));

                updateCachedData("trendingSeries", newSeries, data.page);
                updateCachedData("trendingMovies", newMovies, data.page);
            }
            setNetworkPage(data.page);
        } catch (error) {
            console.error(error);
        } finally {
            isFetching.current = false;
        }
    };

    // --- SEARCH ALGORITHM ---
    const search = async (query, pageToFetch) => {
        const cleanQuery = query.trim();
        if (!cleanQuery) return;

        if (isFetchingSearch.current) return;
        isFetchingSearch.current = true;

        const cacheKey = cleanQuery.toLowerCase();

        try {
            const cached = getCachedData(cacheKey);

            // If requested page is already satisfied by cached data
            if (cached && pageToFetch <= cached.page) {
                if (activeSearchQueryRef.current === cleanQuery) {
                    setSearchResults(cached.data);
                    setSearchResultPage(cached.page);
                    // Assume there are more pages beyond cache until the network API tells us otherwise
                    setSearchTotalPages(prev => Math.max(prev, cached.page + 1));
                }
                isFetchingSearch.current = false;
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/movies/search?query=${encodeURIComponent(cleanQuery)}&page=${pageToFetch}`);
            const data = await response.json();

            // GUARD: Discard response if user changed input while request was in-flight
            if (activeSearchQueryRef.current !== cleanQuery) {
                isFetchingSearch.current = false;
                return;
            }

            const resultsArray = data.result || data.results || [];
            
            // Deduce total pages (fallback to allowing pageToFetch + 1 if results exist)
            const apiTotalPages = data.total_pages || data.totalPages || (resultsArray.length > 0 ? pageToFetch + 1 : pageToFetch);
            const apiPage = data.page || pageToFetch;

            if (resultsArray.length === 0) {
                // Lock total pages to current page if no results are returned
                setSearchTotalPages(searchResultPage > 0 ? searchResultPage : 1);
                isFetchingSearch.current = false;
                return;
            }

            setSearchTotalPages(apiTotalPages);

            if (pageToFetch === 1) {
                setSearchResults(resultsArray);
                setSearchResultPage(apiPage);
                setCachedData(cacheKey, resultsArray, apiPage);
            } else {
                setSearchResults(prevResults => {
                    const merged = filterUnique(prevResults, resultsArray);
                    setCachedData(cacheKey, merged, apiPage);
                    return merged;
                });
                setSearchResultPage(apiPage);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            isFetchingSearch.current = false;
        }
    };

    // --- 1-SECOND DEBOUNCE EFFECT ---
    useEffect(() => {
        const query = movieSearch.trim();

        if (!query) {
            activeSearchQueryRef.current = "";
            setSearchResults([]);
            setSearchResultPage(0);
            setSearchTotalPages(1);
            setDisplaySearchResults(false);
            return;
        }

        const timer = setTimeout(() => {
            activeSearchQueryRef.current = query;

            // Reset pagination state specifically for this search term
            setSearchResultPage(0);
            setSearchTotalPages(2); // Set to 2 initially so observer is unlocked for page 2

            search(query, 1);
            setDisplaySearchResults(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, [movieSearch]);

    // --- SEARCH INTERSECTION OBSERVER (PAGINATION) ---
    const searchResultPaginRef = useCallback(node => {
        if (searchObserver.current) searchObserver.current.disconnect();

        searchObserver.current = new IntersectionObserver(entries => {
            const currentQuery = movieSearch.trim();

            if (
                entries[0].isIntersecting && 
                !isFetchingSearch.current && 
                currentQuery && 
                currentQuery === activeSearchQueryRef.current && 
                searchResultPage > 0 && 
                searchResultPage < searchTotalPages
            ) {
                search(currentQuery, searchResultPage + 1);
            }
        }, { threshold: 0.1 });

        if (node) {
            searchObserver.current.observe(node);
        } else if (searchObserver.current) {
            searchObserver.current.disconnect();
            searchObserver.current = null;
        }
    }, [movieSearch, searchResultPage, searchTotalPages]);

    // --- TRENDING OBSERVERS ---
    const lastMovieElementRef = useCallback(node => {
        if (movieObserver.current) movieObserver.current.disconnect();
        movieObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !isFetching.current) {
                if (cachedMovies.length > 0) {
                    setVisibleMovies(prev => filterUnique(prev, cachedMovies));
                    setCachedMovies([]);
                } else {
                    fetchTrending(networkPage + 1, "movies");
                }
            }
        });
        if (node) {
            movieObserver.current.observe(node);
        } else if (movieObserver.current) {
            movieObserver.current.disconnect();
            movieObserver.current = null;
        }
    }, [cachedMovies, networkPage]);

    const lastSeriesElementRef = useCallback(node => {
        if (seriesObserver.current) seriesObserver.current.disconnect();
        seriesObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !isFetching.current) {
                if (cachedSeries.length > 0) {
                    setVisibleSeries(prev => filterUnique(prev, cachedSeries));
                    setCachedSeries([]);
                } else {
                    fetchTrending(networkPage + 1, "series");
                }
            }
        });

        if (node) {
            seriesObserver.current.observe(node);
        } else if (seriesObserver.current) {
            seriesObserver.current.disconnect();
            seriesObserver.current = null;
        }
    }, [cachedSeries, networkPage]);

    useEffect(() => { 
        cleanExpiredCache();
        fetchTrending(1, "initial"); 
    }, []);

    return (
        <div className={homeStyles.root}>
            <header className={homeStyles.header}>
                <div className={homeStyles.searchWrapper}>
                    <div className={homeStyles.searchField}>
                        <FontAwesomeIcon className={homeStyles.searchIcon} icon={faMagnifyingGlass} />
                        <input 
                            type="text" 
                            className={homeStyles.searchInput} 
                            placeholder='Search Movies'
                            value={movieSearch}
                            onChange={(e) => setMovieSearch(e.target.value)}
                            onFocus={() => {
                                if (movieSearch.trim() !== "") {
                                    setDisplaySearchResults(true);
                                }
                            }}
                            onBlur={() => {
                                // Short delay on blur so clicks/scrolls inside results don't close instantly
                                setTimeout(() => setDisplaySearchResults(false), 200);
                            }}
                        />
                    </div>
                    {displaySearchResults && searchResults.length > 0 && (
                        <div className={homeStyles.searchResults}>
                            {searchResults.map(item => (
                                <div key={item.id} className={homeStyles.searchResultItem}>
                                    <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.title || item.name}/>
                                    <span>{item.title || item.name}</span>
                                </div>
                            ))}
                            {/* Sentinel element triggering page + 1 */}
                            <div ref={searchResultPaginRef} style={{ height: '20px', width: '100%' }} />
                        </div>
                    )}
                </div>
            </header>

            <div className={homeStyles.trendingHeader}>
                <div className={homeStyles.popularMovies}>
                    <MovieGrid title="Trending Movies" items={visibleMovies} />
                    <div ref={lastMovieElementRef} style={{ height: '20px' }} />
                </div>
                <div className={homeStyles.popularMovies}>
                    <MovieGrid title="Popular TV Series" items={visibleSeries} />
                    <div ref={lastSeriesElementRef} style={{ height: '20px' }} />
                </div>
            </div>
        </div>
    );
}

export default Home;