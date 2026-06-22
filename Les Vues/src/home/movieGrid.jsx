import homeStyles from './home.module.css';

export default function MovieGrid({ title, items }) {
    if (!items || items.length === 0) return null;

    return (
        <div className={homeStyles.section}>
            <h2>{title}</h2>
            <div className={homeStyles.popularMovies}>
                {items.map(item => (
                    <div key={item.id} className={homeStyles.movieCard}>
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