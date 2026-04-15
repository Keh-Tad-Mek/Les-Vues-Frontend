import homeStyles from './home.module.css';

function Home() {
    return (
        <div className={homeStyles.root}>
            <header className={homeStyles.header}>
                <div className={homeStyles.searchField}>
                    <input type="text" className={homeStyles.searchInput} placeholder='Search Movies'/>
                    <button></button>
                </div>
            </header>
        </div>
    )
}

export default Home;