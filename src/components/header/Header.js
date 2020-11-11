import React from "react";
import {withRouter} from "react-router-dom";
import logo from "./logo-min.png";
import {version} from "../../../package.json";
import {motion} from "framer-motion";
import Chip from '@material-ui/core/Chip';
import AppBar from "@material-ui/core/AppBar/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import makeStyles from "@material-ui/core/styles/makeStyles";

const Logo = () => <motion.img key={logo} src={logo}/>;

const Title = () => (
    <motion.div
        initial={{opacity: 0, x: -20}}
        animate={{
            opacity: 1,
            x: 10,
        }}
        transition={{duration: 0.5, delay: 0.2}}
    >
        <h2>UniConfig</h2>
    </motion.div>
);

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    toolbar: {
        display: "flex",
        justifyContent: "space-between"
    },
    title: {
        display: "flex",
        "& img": {
            height: 30
        },
        "& h2": {
            fontSize: "1.5rem",
            color: "white",
            margin: 0
        }
    }
}));

const Header = () => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar className={classes.toolbar}>
                    <div className={classes.title}>
                        <Logo/>
                        <Title/>
                    </div>
                    <Chip label={`v${version}`} variant="default"/>
                </Toolbar>
            </AppBar>
        </div>

    );
};

export default withRouter(Header);
