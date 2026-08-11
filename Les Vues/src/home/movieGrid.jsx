import homeStyles from './home.module.css';
import { useNavigate } from 'react-router-dom';
import { setCachedData } from '../utils/cacheUtils';

export default function MovieGrid({ title, items }) {
    if (!items || items.length === 0) return null;

    const navigate = useNavigate()

    return (
        <div className={homeStyles.section}>
            <h2>{title}</h2>
            <div className={homeStyles.popularMovies}>
                {items.map(item => (
                    <div className={homeStyles.movieCard}
                        onClick={() => {
                            const title = item.title || item.name
                            const key = `${title}_${item.id}`
                            setCachedData(key, item)
                            navigate(`/movies/${key}`)
                        }}
                    >
                        <img 
                            src={`https://image.tmdb.org/t/p/original${item.poster_path}`} 
                            alt={item.title || item.name} 
                        />
                        <h3>{item.title || item.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}