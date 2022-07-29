import React from "react";
import './navbar.css';
import { Link } from 'react-router-dom';

function Navbar(props){
    const isLogged = props.isLogged;
    return (
        <div className="navbar">
            <div className="navbar__logo">Logo</div>
            {
                isLogged ? userLogged() : userUnlogged()
            }
        </div>
    );
}

function userLogged() {
    return(
        <div className="navbar__link-container">
            <Link to="/sell">Sell</Link>
            <Link to="/catalogue">Catalogue</Link>
            <Link to="/myArtShop">My ArtShop</Link>
        </div>
    );
}

function userUnlogged() {
    return(
        <div className="navbar__link-container">
        <Link to="/login">Log In</Link>
        <Link to="/signup">Sign Up</Link>
        </div>
    );
}

export default Navbar;