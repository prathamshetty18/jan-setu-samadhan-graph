import math
import json
from typing import List, Dict, Any, Tuple

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two GPS coordinates in kilometers.
    Used for proximity search and spatial clustering.
    """
    R = 6371.0 # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Standard Demo Wards with Polygon Boundaries around Bengaluru Municipal region
DEMO_WARDS_GEOJSON = [
    {
        "ward_number": 101,
        "name": "Koramangala Ward",
        "zone": "South Zone",
        "center": [12.9352, 77.6245],
        "polygon": [
            [12.9250, 77.6150], [12.9450, 77.6150],
            [12.9450, 77.6350], [12.9250, 77.6350],
            [12.9250, 77.6150]
        ]
    },
    {
        "ward_number": 102,
        "name": "Indiranagar Ward",
        "zone": "East Zone",
        "center": [12.9784, 77.6408],
        "polygon": [
            [12.9680, 77.6300], [12.9880, 77.6300],
            [12.9880, 77.6520], [12.9680, 77.6520],
            [12.9680, 77.6300]
        ]
    },
    {
        "ward_number": 103,
        "name": "Jayanagar Ward",
        "zone": "South Zone",
        "center": [12.9308, 77.5838],
        "polygon": [
            [12.9200, 77.5720], [12.9420, 77.5720],
            [12.9420, 77.5950], [12.9200, 77.5950],
            [12.9200, 77.5720]
        ]
    },
    {
        "ward_number": 104,
        "name": "Malleshwaram Ward",
        "zone": "West Zone",
        "center": [13.0031, 77.5643],
        "polygon": [
            [12.9930, 77.5540], [13.0130, 77.5540],
            [13.0130, 77.5740], [12.9930, 77.5740],
            [12.9930, 77.5540]
        ]
    },
    {
        "ward_number": 105,
        "name": "Whitefield Ward",
        "zone": "Mahadevapura Zone",
        "center": [12.9698, 77.7500],
        "polygon": [
            [12.9580, 77.7380], [12.9820, 77.7380],
            [12.9820, 77.7620], [12.9580, 77.7620],
            [12.9580, 77.7380]
        ]
    }
]

def get_demo_ward_features() -> List[Dict[str, Any]]:
    """Returns GeoJSON FeatureCollection for rendering demo ward boundaries in Leaflet."""
    features = []
    for w in DEMO_WARDS_GEOJSON:
        # GeoJSON expects [lng, lat]
        coords = [[p[1], p[0]] for p in w["polygon"]]
        features.append({
            "type": "Feature",
            "properties": {
                "ward_number": w["ward_number"],
                "name": w["name"],
                "zone": w["zone"],
                "label": f"Ward {w['ward_number']}: {w['name']} (DEMO DATA)"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [coords]
            }
        })
    return features

