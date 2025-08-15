import React from 'react';
import { View, Text } from 'react-native';
import { MapView as RNMapView, Marker } from 'react-native-maps';

export default function MapView(props) {
  return (
    <RNMapView {...props}>
      {props.markers && props.markers.map((m, i) => (
        <Marker key={i} coordinate={m.coordinate} title={m.title} />
      ))}
    </RNMapView>
  );
}
