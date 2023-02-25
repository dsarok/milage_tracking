import React, {useEffect, useState} from 'react';
import MapView, {Marker, Polyline} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {Text, TouchableOpacity, View} from 'react-native';
import * as geolib from 'geolib';
function App() {
  const [startingLocation, setStartingLocation] = useState();
  const [locationHistory, setLocationHistory] = useState([]);
  const [distance, setDistance] = useState(0);
  const [locationPermission, setLocationPermission] = useState(false);
  const [disablingbutton, setDisablingButton] = useState(true);
  const [watchKey, setWatchKey] = useState(-1);

  useEffect(() => {
    setDistance(prev => {
      if (locationHistory.length > 1) {
        const addedDistance = geolib.getDistance(
          locationHistory[locationHistory.length - 1],
          locationHistory[locationHistory.length - 2],
          1,
        );
        return prev + parseFloat(addedDistance.toFixed(2));
      } else return prev;
    });
  }, [JSON.stringify(locationHistory)]);

  useEffect(() => {
    Geolocation.requestAuthorization('whenInUse')
      .then(res => {
        if (res === 'granted') return true;
        else return true;
      })
      .then(res => setLocationPermission(res));
  }, []);

  function startWatching() {
    setDisablingButton(prev => !prev);
    setDistance(0);
    setLocationHistory([]);
    if (locationPermission) {
      Geolocation.getCurrentPosition(
        position => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setStartingLocation(location);

          setLocationHistory([location]);
          console.log(position.coords, 'current location');
        },
        error => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 2000,
          maximumAge: 10000,
          forceRequestLocation: true,
        },
      );
    } else {
      Geolocation.requestAuthorization('whenInUse')
        .then(res => {
          if (res === 'granted') return true;
          else return true;
        })
        .then(res => setLocationPermission(res));
    }
    const Watch = Geolocation.watchPosition(
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
        fastestInterval: 10000,
      },
    );
    setWatchKey(Watch);
  }
  function stopWatching() {
    Geolocation.clearWatch(watchKey);
    setDisablingButton(prev => !prev);
    setStartingLocation(prev => {
      if (locationHistory.length > 0)
        return locationHistory[locationHistory.length - 1];
      else null;
    });
    // setLocationHistory([]);
  }
console.log(locationHistory)
  return (
    <View style={{flex: 1}}>
      <MapView
        style={{flex: 1}}
        region={{
          latitude:
            locationHistory.length > 0
              ? (locationHistory[locationHistory.length - 1].latitude +
                    locationHistory[0].latitude)/2
              : startingLocation
              ? startingLocation.latitude
              : '57',
          longitude:
            locationHistory.length > 0
              ? (locationHistory[locationHistory.length - 1].longitude +
                    locationHistory[0].longitude)/2
              : startingLocation
              ? startingLocation.longitude
              : '15',
          latitudeDelta:
            locationHistory.length > 0
              ? Math.abs(locationHistory[locationHistory.length - 1].latitude -
                    locationHistory[0].latitude)+0.001
              : 0.004,
          longitudeDelta:locationHistory.length > 0
              ?Math.abs(locationHistory[locationHistory.length - 1].longitude -
                    locationHistory[0].longitude)+0.0008
              : 0.004,
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
          height: '11%',
          backgroundColor: 'white',
          alignItems: 'center',
          position: 'absolute',
          bottom: 15,
          alignSelf: 'center',
          flexDirection: 'row',
          justifyContent: 'space-around',
          borderRadius: 12,
          flexWrap: 'wrap',
        }}>
        <View style={{width: '100%', height: '34%', alignItems: 'center'}}>
          <Text style={{fontSize: 19}}>
            Total distance travelled:{' '}
            <Text style={{fontWeight: 'bold'}}>{distance.toFixed(2)} m</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: disablingbutton ? 'green' : 'grey',
            width: '40%',
            height: '50%',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={startWatching}>
          <Text style={{fontSize: 21, fontWeight: 'bold', color: 'white'}}>
            Start
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={disablingbutton}
          style={{
            backgroundColor: disablingbutton ? 'grey' : 'red',
            width: '40%',
            height: '50%',
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
