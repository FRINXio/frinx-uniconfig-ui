import React, { Component } from "react";
import "./Login.css";
import {
  Button,
  Carousel,
  Col,
  Container,
  Form,
  InputGroup,
  Row
} from "react-bootstrap";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faUser,
  faTimes,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";
import logoWhite from "./logoWhite.png";
import * as authActions from "../../store/actions/auth";
import { connect } from "react-redux";

class Login extends Component {
  constructor(props) {
    super(props);
    library.add(faUser, faLock);
    this.state = {
      activeUsername: false,
      activePassword: false,
      password: "",
      email: "",
      error: ""
    };
    this.setEmail = this.setEmail.bind(this);
    this.setPassword = this.setPassword.bind(this);
  }

  redirectToRegister = e => {
    e.preventDefault();
    this.props.switchAuth();
    this.props.history.push("/registration");
  };

  login = e => {
    e.preventDefault();
    this.props.onAuth(this.state.email, this.state.password, false);
  };

  setEmail(event) {
    this.setState({ email: event.target.value });
  }

  setPassword(event) {
    this.setState({ password: event.target.value });
  }

  render() {
    let { error, loading } = this.props.authReducer;
    let errorMsg = error ? error.response.body.error.message : null;

    return (
      <Container>
        <div className="accessPanel">
          <Row>
            <Col className="whiteBg" xs="7">
              <div className="loginWindow">
                <h1>Sign in with</h1>
                <Button
                  disabled
                  variant="outline-primary"
                  className="paddedButton"
                >
                  <i className="fab fa-google" /> &nbsp;&nbsp;Sign-in with
                  Google
                </Button>
                <Button
                  disabled
                  variant="outline-dark"
                  style={{ marginBottom: "15px" }}
                  className="paddedButton"
                >
                  <i className="fab fa-github" /> &nbsp;&nbsp;Sign-in with
                  Github
                </Button>
                <center>
                  <hr
                    className="hr-text"
                    data-content="or sign in with your account"
                  />
                  <Form onSubmit={this.logIn}>
                    <InputGroup
                      className={
                        !this.state.activeUsername
                          ? "input-user pretty-feild paddedFeild"
                          : "input-user pretty-feild paddedFeild focusedInput"
                      }
                    >
                      <InputGroup.Prepend>
                        <InputGroup.Text id="user-addon">
                          <FontAwesomeIcon icon={faEnvelope} />
                        </InputGroup.Text>
                      </InputGroup.Prepend>
                      <input
                        onFocus={() => {
                          this.setState({ activeUsername: true });
                        }}
                        onBlur={() => {
                          this.setState({ activeUsername: false });
                        }}
                        type="email"
                        placeholder="Email"
                        onChange={this.setEmail}
                      />
                    </InputGroup>
                    <InputGroup
                      className={
                        !this.state.activePassword
                          ? "input-password pretty-feild paddedFeild"
                          : "input-password pretty-feild paddedFeild focusedInput"
                      }
                    >
                      <InputGroup.Prepend>
                        <InputGroup.Text id="password-addon">
                          <FontAwesomeIcon icon={faLock} />
                        </InputGroup.Text>
                      </InputGroup.Prepend>
                      <input
                        onFocus={() => {
                          this.setState({ activePassword: true });
                        }}
                        onBlur={() => {
                          this.setState({ activePassword: false });
                        }}
                        type="password"
                        placeholder="Password"
                        onChange={this.setPassword}
                      />
                    </InputGroup>
                  </Form>
                </center>
                <Button
                  variant="info"
                  disabled={loading}
                  onClick={this.login}
                  style={{ width: "334px", marginTop: "15px" }}
                  className="gradientBtn"
                >
                  {loading ? <i className="fas fa-spinner fa-spin" /> : null}
                  {loading ? " Authenticating..." : "Sign In"}
                </Button>
                <div
                  style={{ marginTop: "20px" }}
                  className={error ? "wrongLogin" : "hidden"}
                >
                  <FontAwesomeIcon icon={faTimes} /> {errorMsg}
                </div>
                <br />
              </div>
              <br />
            </Col>
            <Col className="gradientBg" xs="5">
              <div className="registerWindow">
                <h1>Sign up</h1>
                Don't have an account yet?
                <br />
                <Button
                  style={{ marginTop: "5px" }}
                  variant="outline-light"
                  onClick={this.redirectToRegister}
                >
                  Register as a new user
                </Button>
                <br />
                <br />
                <Carousel indicators={false} style={{ minHeight: "300px" }}>
                  <Carousel.Item>
                    <i
                      style={{ marginTop: "25%", color: "black" }}
                      className="logo fas fa-info-circle fa-9x"
                    />
                    <Carousel.Caption>
                      <h3>
                        <a
                          style={{ color: "white" }}
                          href="https://frinx.io/frinx-odl-distribution-incons"
                        >
                          FRINX UNICONFIG™ ODL
                        </a>
                      </h3>
                      <p>
                        <br />
                        <i className="fas fa-check" /> Curated and tested.
                        <br />
                        <i className="fas fa-check" /> Production Support.
                        <br />
                        <i className="fas fa-check" /> FRINX components and
                        modules.
                      </p>
                    </Carousel.Caption>
                  </Carousel.Item>
                  <Carousel.Item>
                    <a href="https://frinx.io">
                      <img className="logo" alt="Logo" src={logoWhite} />
                    </a>
                  </Carousel.Item>
                  <Carousel.Item>
                    <a href="https://github.com/FRINXio">
                      <img
                        className="logo"
                        style={{ marginTop: "20%" }}
                        alt="Logo"
                        src="https://pngimg.com/uploads/github/github_PNG15.png"
                      />
                    </a>
                  </Carousel.Item>
                </Carousel>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    );
  }
}

const mapStateToProps = state => {
  return {
    authReducer: state.authReducer
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAuth: (email, password, isSignup) =>
      dispatch(authActions.auth(email, password, isSignup)),
    switchAuth: () => dispatch(authActions.switchAuth())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
