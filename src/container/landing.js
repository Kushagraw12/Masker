/* eslint-disable */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GridContainer from 'components/Grid/GridContainer';
import GridItem from 'components/Grid/GridItem';
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import Button from "components/CustomButtons/Button.js";
import Snackbar from "@mui/material/Snackbar";
import Stack from '@mui/material/Stack';
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
})

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    backgroundColor: 'transparent',
    border: '2px solid #000',
    color: 'black',
    boxShadow: 24,
    p: 4,
};

function Landing() {
    const [val, setVal] = useState(null);
    const [valC, setValC] = useState(null);
    const [long, setLong] = useState(77.1);
    const [lat, setLat] = useState(28.7);
    const [del, setDel] = useState(true);
    const [loading, setLoading] = useState(true);

    const snackBarVariantsMap = {
        error: "error",
        warning: "warning",
        info: "info",
        success: "success",
    };
    const [snackBarDetails, setSnackBarDetails] = useState([]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                console.log("Latitude is :", position.coords.latitude.toFixed(1));
                console.log("Longitude is :", position.coords.longitude.toFixed(1));
                setLat(position.coords.latitude.toFixed(1));
                setLong(position.coords.longitude.toFixed(1));
            })
            axios({
                method: 'GET',
                url: 'https://api.openaq.org/v2/latest/5626'
                // url: `https://api.openaq.org/v2/locations?coordinates=${lat},${long}&radius=3000&parameter=pm25`,
            })
            .then((data) => {
                console.log("D: ", data.data);
                setValC(data.data.results);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
            })
        }
        axios({
            method: 'GET',
            url: `https://api.openaq.org/v2/locations?country=in&parameter=pm25&city=Delhi`,
        })
        .then((data) => {
            console.log(data.data);
            setVal(data.data.results);
            setLoading(false);
        })
        .catch((error) => {
            console.log(error);
        });

    }, []);

    // SnackBar
    function openSnackBar (message, variant) {
        setSnackBarDetails((prevSnackBarDetails)=>[...prevSnackBarDetails, {open:true, message:message, variant:variant}]);
    };

    return(
        <div>
            <GridContainer>
                <GridItem xs={5} sm={5} md={5}>
                    <Button onClick={() => openSnackBar("Please Wear a mask since PM2.5 around you is more than 40µg/m³!", snackBarVariantsMap.error)} style={style}>MASK?</Button>
                </GridItem>
                <GridItem xs={4} sm={4} md={4}>
                    <h3 className='text-center'>
                        <b>Welcome to Masker!</b>
                    </h3>
                </GridItem>
                <GridItem xs={3} sm={3} md={3}>
                    <Button onClick={() => setDel(!del)} style={style}>Show {del ? "All Over Delhi" : "My Location"}</Button>
                </GridItem>
            </GridContainer>
            {loading ? "LOADING . . ." : 
                <GridContainer>
                {console.log("VAL: ", val)} 
                {console.log("ValC: ", valC)} 
                {console.log("Del: ", del)}
                {del ? 
                    valC.map((item, idx) => {
                        return(
                            <GridItem xs={12} sm={6} md={6}>
                                <Card
                                    style={{
                                        marginBottom: '2px',
                                        padding: '10px'
                                    }}
                                >
                                    Coordinates: {item.coordinates.latitude + ", " + item.coordinates.longitude}<br />
                                    City: {item.city}<br />
                                    Name: {item.location}
                                    {console.log(item)}
                                    <CardBody>
                                        <b>Parameters:</b> {item.measurements.map((it, ix) => {
                                            return(
                                                <Card
                                                    style={{
                                                        marginBottom: '2px',
                                                        padding: '10px'
                                                    }}
                                                >
                                                    <h5>Name: {it.parameter === "pm25" ? "PM2.5" : it.parameter}</h5>
                                                        Value: {it.value + " " + it.unit}
                                                        <br />
                                                        Last Update: {it.lastUpdated} 
                                                </Card>
                                            )
                                        })}
                                    </CardBody>
                                </Card>
                            </GridItem>
                        )})
                        :
                        val.map((item, idx) => {
                            return(
                                <GridItem xs={12} sm={6} md={6}>
                                    <Card
                                        style={{
                                            marginBottom: '2px',
                                            padding: '10px'
                                        }}
                                    >
                                        ID: {item.id}<br />
                                        City: {item.city}<br />
                                        Name: {item.name}
                                        <CardBody>
                                            <b>Parameters:</b> {item.parameters.map((it, ix) => {
                                                return(
                                                    <Card
                                                        style={{
                                                            marginBottom: '2px',
                                                            padding: '10px'
                                                        }}
                                                    >
                                                        <h5>Name: {it.displayName}</h5>
                                                            Value: {it.lastValue + " " + it.unit}
                                                            <br />
                                                            Average: {it.average}
                                                            <br />
                                                            Last Update: {it.lastUpdated} 
                                                    </Card>
                                                )
                                            })}
                                        </CardBody>
                                    </Card>
                                </GridItem>
                            )
                        })}
                    </GridContainer>
                }
                
            <div>
                <Stack sx={{ position: "absolute", bottom: 0, left: 0 }} spacing={2}>
                {snackBarDetails.map((snackbar, idx)=>
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    style={{position:"relative"}}
                    onClose={(event, reason)=>{if (reason === "clickaway") return; snackbar.open=false; setSnackBarDetails([...snackBarDetails])}}
                >
                    <Alert
                        onClose={(event, reason)=>{if (reason === "clickaway") return; snackbar.open=false; setSnackBarDetails([...snackBarDetails])}}
                        severity={snackbar.variant}
                        sx={{ width: "100%" }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
                )}
                </Stack>
            </div>
        </div>
    )
}

export default Landing;