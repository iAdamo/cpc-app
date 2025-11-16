import { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
// import { ProviderMarker } from './ProviderMarker';
// import { ProviderModal } from './ProviderModal';
// import { MapControls } from './MapControls';
// import { calculateDistance, getRegionForCoordinates } from '../utils/mapUtils';

const { width, height } = Dimensions.get('window');