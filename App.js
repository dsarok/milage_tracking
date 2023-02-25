import React, {useEffect, useState} from 'react';
import MapView, {Marker, Polyline} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {Text, TouchableOpacity, View} from 'react-native';
function App() {
  const [startingLocation, setStartingLocation] = useState();
  const [locationHistory, setLocationHistory] = useState([]);
  const [distance, setDistance] = useState(0);
  console.log(startingLocation);
  let watchKey;
  useEffect(()=>{
    setDistance(prev => {
      const addedDistance = Math.sqrt(
        Math.pow(locationHistory[locationHistory.length - 1], 2) +
          Math.pow(locationHistory[locationHistory.length - 2], 2)
      );
      return prev + addedDistance;
    });
  },[locationHistory])
  function startWatching() {
    setDistance(0)
    Geolocation.requestAuthorization('whenInUse')
      .then(res => {
        if (res === 'granted') return true;
        else return true;
      })
      .then(resp => {
        if (resp) {
          Geolocation.getCurrentPosition(
            position => {
              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              setStartingLocation(location);
              console.log(position.coords);
            },
            error => {
              console.log(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 2000,
              maximumAge: 1000,
              forceRequestLocation: true,
            }
          );
        }
      });
    watchKey = Geolocation.watchPosition(
      position => {
        setLocationHistory(prev => [
          ...prev,
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        ]);
       },
      error => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 5000,
        fastestInterval: 2000,
      },
    );
  }
  function stopWatching() {
    setLocationHistory([]);
    setStartingLocation(null);
    Geolocation.clearWatch(watchKey);
  }
  return (
    <View style={{flex: 1}}>
      <MapView
        style={{flex: 1}}
        region={{
          latitude:
            locationHistory.length > 0
              ? locationHistory[locationHistory.length - 1].latitude
              : startingLocation
              ? startingLocation.latitude
              : '57',
          longitude:
            locationHistory.length > 0
              ? locationHistory[locationHistory.length - 1].longitude
              : startingLocation
              ? startingLocation.longitude
              : '15',
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}>
        <Polyline
          coordinates={locationHistory}
          strokeWidth={9}
          lineCap={'round'}
          strokeColor={'coral'}
        />
        {startingLocation && (
          <Marker
            title="starting point"
            pinColor="green"
            coordinate={locationHistory[0] || startingLocation}
          />
        )}
        {locationHistory.length > 1 && (
          <Marker
            title="current posititon"
            pinColor="red"
            coordinate={locationHistory[locationHistory.length - 1]}
          />
        )}
      </MapView>

      <View
        style={{
          width: '80%',
          height: '10%',
          backgroundColor: 'white',
          alignItems: 'center',
          position: 'absolute',
          bottom: 15,
          alignSelf: 'center',
          flexDirection: 'row',
          justifyContent: 'space-around',
          borderRadius: 12,
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: 'green',
            width: '40%',
            height: '60%',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={startWatching}>
          <Text style={{fontSize: 21, fontWeight: 'bold', color: 'white'}}>
            Start {distance}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: 'red',
            width: '40%',
            height: '60%',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={stopWatching}>
          <Text style={{fontSize: 21, fontWeight: 'bold', color: 'white'}}>
            Stop
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default App;
