import React from "react";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";
import "./App.css";
import Header from "./components/header/Header";
import List from "./components/uniconfig/deviceTable/List";
import DeviceView from "./components/uniconfig/deviceView/DeviceView";
import {
  GlobalProvider,
  globalConstants,
} from "./components/common/GlobalContext";
import DeviceList from "./components/uniconfig/deviceTable/DeviceList";
import { ThemeProvider } from '@material-ui/core/styles';
import theme from "./components/common/theme";
import DeviceDetails from "./components/uniconfig/deviceTable/DeviceDetails";
import Breadcrumb from "./components/common/Breadcrumb";
import MountDevice from "./components/uniconfig/deviceTable/mount/MountDevice";

const { frontendUrlPrefix } = globalConstants;

function App(props) {
  return (
    <div className="App">
      <GlobalProvider {...props}>
        <ThemeProvider theme={theme}>
        <Header />
        <Breadcrumb/>
        <Switch>
          <Route
            exact
            path={(props.frontendUrlPrefix || frontendUrlPrefix) + "/devices"}
            component={List}
          />
          <Route
              exact
              path={(props.frontendUrlPrefix || frontendUrlPrefix) + "/devices1"}
              component={DeviceList}
          />
          <Route
              exact
              path={(props.frontendUrlPrefix || frontendUrlPrefix) + "/devices1/:nodeId"}
              component={DeviceDetails}
          />
          <Route exact path={(props.frontendUrlPrefix || frontendUrlPrefix) + "/mount"} component={MountDevice} />
          <Route exact path={(props.frontendUrlPrefix || frontendUrlPrefix) + "/devices/edit/:id"} component={DeviceView} />
          <Redirect to={(props.frontendUrlPrefix || frontendUrlPrefix) + "/devices"} />
        </Switch>
      </ThemeProvider>
      </GlobalProvider>
    </div>
  );
}

export default withRouter(App);
