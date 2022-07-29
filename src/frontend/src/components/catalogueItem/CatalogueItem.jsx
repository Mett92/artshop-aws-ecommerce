import './catalogue-item.css';

function CatalogueItem(props) {
    
    return(
        <div className="catalogue-item__container">
            <div className="catalogue-item__container-photo-details">
                <img className="catalogue-item__photo" 
                        src={process.env.REACT_APP_S3_ENDPOINT + props.item.photo_link}
                        alt="Not available"
                />
                <div className="catalogue-item__details">
                    <div className='catalogue-item__author'>{props.item.author}</div>
                    <div className="catalogue-item__title">{props.item.title}</div>
                    <div className="catalogue-item__description">{props.item.description}</div>
                    <div className="catalogue-item__value">Price: {props.item.price}€</div>
                </div>
            </div>
            <hr className="catalogue-item__separation-line"/>
        </div>
    )
}

export default CatalogueItem;