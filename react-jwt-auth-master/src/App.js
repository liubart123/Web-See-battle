import React, { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./styles.css";

import AuthService from "./services/auth.service";

import Login from "./components/login.component";
import Register from "./components/register.component";
import Home from "./components/home.component";
import Profile from "./components/profile.component";
import RouteTest from "./components/test/routeTest/route-test.component";
import FindRoom from "./components/battle/FindRoom.component";
import Room from "./components/battle/Room.component";
import BattleFormationComponent from "./components/battleFormation/battleFormation.component";
import RecordsComponent from "./components/records.component";
import AdminComponent from "./components/admin.component";

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
    };
  }

  componentDidMount() {
    const user = AuthService.getCurrentUser();

    if (user) {
      this.setState({
        currentUser: user,
        // showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
        // showAdminBoard: user.roles.includes("ROLE_ADMIN"),
      });
    }
  }

  logOut() {
    AuthService.logout();
  }

  render() {
    const { currentUser} = this.state;

    return (
      <div>
        <nav className="navbar navbar-expand navbar-dark bg-dark">
          <Link to={"/"} className="navbar-brand">
            Warships!!!
          </Link>
          <div className="navbar-nav mr-auto">
            {/* <li className="nav-item">
              <Link to={"/home"} className="nav-link">
                Home
              </Link>
            </li> */}

            <li className="nav-item">
              <Link to={"/findRoom"} className="nav-link">
                Find Room
              </Link>
            </li>


            {currentUser && (
                <li className="nav-item">
                    {/* <Link to={"/battleFormation"} className="nav-link"
                                onClick={() => { window.location.reload();}}>
                        Battle formations
                    </Link> */}
                    <a className="nav-link" onClick={() => {window.location.href="/battleFormation"}}>Battle formations</a>
                </li>
            )}
            {currentUser && currentUser.role >=15 && (
                <a className="nav-link" onClick={() => {window.location.href="/admin"}}>Admin panel</a>
            )}
            {/* {currentUser && (
              <li className="nav-item">
                <Link to={"/user"} className="nav-link">
                  User
                </Link>
              </li>
              
            )} */}

            
            <li className="nav-item">
              <Link to={"/records"} className="nav-link">
                Records
              </Link>
            </li>
          </div>

          {currentUser ? (
            <div className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to={"/profile"} className="nav-link">
                  {currentUser.username}
                </Link>
              </li>
              <li className="nav-item">
                <a href="/login" className="nav-link" onClick={this.logOut}>
                  LogOut
                </a>
              </li>
            </div>
          ) : (
            <div className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to={"/login"} className="nav-link">
                  Login
                </Link>
              </li>

              <li className="nav-item">
                <Link to={"/register"} className="nav-link">
                  Sign Up
                </Link>
              </li>
            </div>
          )}
        </nav>

        <div className="container mt-3 col-12" >
            <Switch>
                <Route exact path={["/", "/home"]} component={Home} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register} />
                <Route exact path="/profile" component={Profile} />
                <Route path="/test/route" >
                    <RouteTest baseUrl = "/test/route"></RouteTest>
                </Route>
                <Route path="/findRoom" component={FindRoom} />
                <Route path="/battleroom" component={Room} />
                <Route path="/battleFormation" component={BattleFormationComponent} />
                <Route path="/records" component={RecordsComponent} />
                <Route path="/admin" component={AdminComponent} />
            </Switch>
        </div>
      </div>
    );
  }
}

export default App;
