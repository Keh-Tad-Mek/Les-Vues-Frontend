import homeStyles from './home.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

function Home() {
    return (
        <div className={homeStyles.root}>
            <header className={homeStyles.header}>
                <div className={homeStyles.searchField}>
                    <input type="text" className={homeStyles.searchInput} placeholder='Search Movies'/>
                    <button>
                        <FontAwesomeIcon className={homeStyles.searchIcon}icon={faMagnifyingGlass}/>
                    </button>
                </div>
            </header>
            <div className={homeStyles.moviesForYou}>
                
            </div>
        </div>
    )
}

export default Home;