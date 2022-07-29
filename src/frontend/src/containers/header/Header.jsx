import './header.css';

function Header(props) {
    return (
    <div className='header__container'>
        <p className='header__title'>{props.title}</p>
    </div>
    );

}

export default Header;