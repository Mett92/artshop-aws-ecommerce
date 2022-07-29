import React from 'react';
import { Navigate } from "react-router-dom";
import './form-login.css';

const apiLogin = "/api/auth/login"

class FormLogin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username : "",
            password : "",
            loginSuccess: false,
            loginFailed: false,
            validationMessage: ""
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        if(event.target.name === 'username'){
            this.setState ({ username : event.target.value });
        } else if (event.target.name === 'password') {
            this.setState({ password : event.target.value });
        }
    }

    handleSubmit(event) {
        fetch(apiLogin, 
        {
            method: "POST", 
            headers: { 
                'Content-Type' : 'application/json',
            } ,
            body: JSON.stringify({ 
                "username": this.state.username, 
                "password": this.state.password 
            })
        }).then(
            (response) => {
                console.log(response.body);
                if(response.ok) {
                    this.setState({loginSuccess: true});
                } else if(response.status >= 400 && response.status < 500) {
                    this.setState({loginFailed: true, username: "", password: ""});
                } else {
                    throw new Error("There was an error with http status: " + response.status);
                }
                return response.json();
            }
        ).then(
            (res) => {
                this.setState({validationMessage: res.message});
            }
        )
        .catch(
            (err) => {
                console.log(err);
                alert("There was an error");
            }
        ) // In case the promise will be rejected.

        event.preventDefault();
    }

    render() {
        const loginFailed = this.state.loginFailed;
        const loginSuccess = this.state.loginSuccess;
        const errorMessage = this.state.validationMessage;

        return(
            <form onSubmit={this.handleSubmit}>
                {loginSuccess && <Navigate to="/"/>}
                <div>
                    <div>
                        <input 
                            name="username"
                            className={ (loginFailed && 'input-text-error') || 'input-text'}
                            type="text" 
                            placeholder='Email' 
                            onChange={this.handleChange}
                            value={this.state.username} 
                        />
                    </div>
                    <div>
                        <input 
                            name="password"
                            className={ (loginFailed && 'input-text-error') || 'input-text'}
                            type="password" 
                            placeholder='Password'
                            onChange={this.handleChange}
                            value={this.state.password} 
                        />
                    </div>
                </div>
                { loginFailed && <div className='login__error-message'>{errorMessage}</div> }
                <hr className="login__separation-line"/>
                <input className='submit-button' type="submit" value="Login" />
            </form>
        );
    } 
}

export default FormLogin;