import { CatalogueItem } from '../../components';
import './catalogue.css';
import { Header } from '../../containers'
import React from 'react';

const apiCatalogue = "/api/catalogue/list"

class Catalogue extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            dataIsLoaded: false,
            items: []
        }
    }

    componentDidMount() {
        fetch(apiCatalogue, {method: 'GET'})
            .then( (res) => {
                if(!res.ok){
                    throw new Error(res.status);
                }
                return res.json();
            })
            .then(
                (result) => {
                    this.setState({
                        items: result,
                        dataIsLoaded: true
                    });
                }
            ).catch((err) => { 
                const status_code = err.message;
                console.log(status_code);
                if(status_code && status_code >= 400 && status_code < 500) {
                    // reindirizza l'utente sulla login
                    console.log("Reindirizzare su login");
                } else {
                    // mostra pagina di errore
                }
            });
    }

    render() {
        const { dataIsLoaded, items} = this.state;
        if(!dataIsLoaded) {
            return(
                <div>
                    <Header title="Catalogue"/>
                    <div className="catalogue__container">
                       <p>Data is loading...</p>
                    </div>
                </div>
            ); 
        } else {
            return(
                <div>
                    <Header title="Catalogue"/>
                    <div className="catalogue__container">
                        { items.map( (elm) => <CatalogueItem key={elm.id_artwork} item={elm} /> ) } 
                    </div>
                </div>
            );
        }
        
    }
}

export default Catalogue;