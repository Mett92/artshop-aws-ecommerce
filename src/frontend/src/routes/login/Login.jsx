import './login.css';
import { Header } from '../../containers'
import { FormLogin } from '../../components';

function Login(props) {
    return(
        <div>
            <Header title="Login" />
            <div className='login__container'>
                <div className='login__description-container'>
                    Login to your dream art based e-commerce.<br/>Enjoy
                </div>
                <div className='login__form-container'>
                <FormLogin />
                </div>
            </div>
        </div>
    )
}

export default Login;