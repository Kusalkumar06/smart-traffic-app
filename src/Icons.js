import L from 'leaflet';

const iconUrl = (color) =>
  `https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=warning|${color}`;

const Icons = {
  Accident: new L.Icon({
    iconUrl: iconUrl('ff0000'),
    iconSize: [30, 40],
  }),
  Roadblock: new L.Icon({
    iconUrl: iconUrl('ffa500'),
    iconSize: [30, 40],
  }),
  Pothole: new L.Icon({
    iconUrl: iconUrl('8b4513'),
    iconSize: [30, 40],
  }),
  Flood: new L.Icon({
    iconUrl: iconUrl('0000ff'),
    iconSize: [30, 40],
  }),
  User: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    iconSize: [32, 32],
  }),
};

export default Icons;
