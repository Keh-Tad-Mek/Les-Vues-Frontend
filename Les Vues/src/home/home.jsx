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
    const [searchResultPage, setSearchResultPage] = useState(0)

    const [searchResults, setSearchResults] = useState([]);
    const [movieSearch, setMovieSearch] = useState("");
    const [displaySearchResults, setDisplaySearchResults] = useState(false);

    const movieObserver = useRef();
    const seriesObserver = useRef();
    const searchObserver = useRef();
    const isFetching = useRef(false);
    const isFetchingSearch = useRef(false)

    const filterUnique = (prevList, newList) => {
        const existingIds = new Set(prevList.map(item => item.id));
        return [...prevList, ...newList.filter(item => !existingIds.has(item.id))];
    };

    const fetchTrending = async (targetPage, trigger) => {
        if (isFetching.current) return;
        isFetching.current = true;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/movies/get_popular_movies?page=${targetPage}`);
            const data = await response.json();
            
            const newMovies = data.results.filter(i => i.media_type === "movie");
            const newSeries = data.results.filter(i => i.media_type === "tv");

            if (trigger === "initial") {
                setVisibleMovies(newMovies);
                setVisibleSeries(newSeries);
            } else if (trigger === "movies") {
                setVisibleMovies(prev => filterUnique(prev, newMovies));
                setCachedSeries(prev => filterUnique(prev, newSeries));
            } else if (trigger === "series") {
                setVisibleSeries(prev => filterUnique(prev, newSeries));
                setCachedMovies(prev => filterUnique(prev, newMovies));
            }
            setNetworkPage(data.page);
        } catch (error) { 
            console.error(error); 
        } finally {
            isFetching.current = false;
        }
    };

    const search = async (page) => {
        if (isFetchingSearch.current) return;
        isFetchingSearch.current = true

        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/movies/search?query=${movieSearch}&page=${page}`);
            const data = await response.json();
            if (page === 1){
                setSearchResults(data.result);
            } else {
                setSearchResults(prev => filterUnique(prev, data.result))
            }
            setSearchResultPage(data.page)
        }
        catch(error){
            console.error(error)
        }
        finally{
            isFetchingSearch.current = false
        }
    };

    // --- SEARCH EFFECT LOGIC FIX ---
    useEffect(() => {
        if (movieSearch.trim()) {
            search(1);
            setDisplaySearchResults(true);
        } else {
            setSearchResults([]);
            setDisplaySearchResults(false);
        }
    }, [movieSearch]);

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
        if (node){
            movieObserver.current.observe(node);
        } 
        else{
            if (movieObserver.current){
                movieObserver.current.disconnect()
                movieObserver.current = null
            }
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
        } 
        else {
            if (seriesObserver.current){
                seriesObserver.current.disconnect()
                seriesObserver.current = null
            }
        }
    }, [cachedSeries, networkPage]);

    const searchResultPaginRef = useCallback(node =>{
        if (searchObserver.current) searchObserver.current.disconnect();
        searchObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !isFetchingSearch.current){
                search(searchResultPage + 1)
            }
        })
        if (node){
            searchObserver.current.observe(node)
        }
        else{
            if (searchObserver.current){
                searchObserver.current.disconnect()
                searchObserver.current = null
            }
        }
    }, [searchResultPage])

    useEffect(() => { 
        fetchTrending(1, "initial"); 
    }, []);

    return (
        <div className={homeStyles.root}>
            <header className={homeStyles.header}>
                <div className={homeStyles.searchWrapper}>
                    <div className={homeStyles.searchField}>
                        <input 
                            type="text" 
                            className={homeStyles.searchInput} 
                            placeholder='Search Movies'
                            value={movieSearch}
                            onChange={(e) => setMovieSearch(e.target.value)}
                            // --- FOCUS/BLUR LOGIC FIX ---
                            onFocus={() => {
                                if (movieSearch.trim() !== "") {
                                    setDisplaySearchResults(true);
                                }
                            }}
                            onBlur={() => {
                                setDisplaySearchResults(false);
                            }}
                        />
                        <button>
                            <FontAwesomeIcon className={homeStyles.searchIcon} icon={faMagnifyingGlass}/>
                        </button>
                    </div>
                    {displaySearchResults && searchResults.length > 0 && (
                        <div className={homeStyles.searchResults}>
                            {searchResults.map(item => (
                                <div key={item.id} className={homeStyles.searchResultItem}>
                                    <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.title || item.name}/>
                                    <span>{item.title || item.name}</span>
                                </div>
                            ))}
                            <div ref={searchResultPaginRef} style={{ height: '20px' }} />
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