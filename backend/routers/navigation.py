import math
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter(prefix="/api/navigation", tags=["campus-navigation"])

# Campus nodes with normalized coordinates (0-1000 scale for visual map projection)
CAMPUS_NODES = {
    "main_gate": {
        "id": "main_gate",
        "name": "LPU Main Gate (GT Road NH-1)",
        "code": "Gate-1",
        "category": "Gate",
        "x": 500,
        "y": 920,
        "shuttle_stop": True,
        "description": "Main campus entrance, security checkpost, visitor registration, and auto/cab stand.",
        "features": ["Security", "Visitor Pass", "E-Rickshaw Hub", "ATM"]
    },
    "unimall": {
        "id": "unimall",
        "name": "Uni-Mall & Student Central",
        "code": "Uni-Mall",
        "category": "Facility",
        "x": 480,
        "y": 680,
        "shuttle_stop": True,
        "description": "4-story student mall with food court, banks, courier, bookstore, and supermarket.",
        "features": ["Food Court", "HDFC/SBI Bank", "Post Office", "Salons", "Supermarket"]
    },
    "unipolis": {
        "id": "unipolis",
        "name": "Baldev Raj Mittal Unipolis",
        "code": "Unipolis",
        "category": "Auditorium",
        "x": 540,
        "y": 570,
        "shuttle_stop": True,
        "description": "Massive open-air amphitheater and event arena holding 10,000+ students for cultural fests.",
        "features": ["Stage", "Concert Grounds", "Wi-Fi Hub", "Food Kiosks"]
    },
    "auditorium": {
        "id": "auditorium",
        "name": "Shanti Devi Mittal Auditorium",
        "code": "Auditorium",
        "category": "Auditorium",
        "x": 380,
        "y": 520,
        "shuttle_stop": False,
        "description": "State-of-the-art air conditioned auditorium with 3,500 seating capacity.",
        "features": ["Main Hall", "VIP Lounge", "Conference Rooms"]
    },
    "library": {
        "id": "library",
        "name": "Central University Library",
        "code": "Library",
        "category": "Academic",
        "x": 620,
        "y": 480,
        "shuttle_stop": True,
        "description": "9-storey digital learning and research library with reading halls and research databases.",
        "features": ["Digital Resource Center", "Quiet Study Zone", "Discussion Pods", "Cyber Cafe"]
    },
    "block_32": {
        "id": "block_32",
        "name": "Block 32 (Academic Complex)",
        "code": "Block-32",
        "category": "Academic",
        "x": 450,
        "y": 420,
        "shuttle_stop": True,
        "description": "Central academic building housing lecture theatres, faculty cabins, and dean offices.",
        "features": ["Lecture Halls 101-412", "Faculty Lounge", "Smart Classrooms", "Elevator"]
    },
    "block_34": {
        "id": "block_34",
        "name": "Block 34 (School of Computer Science & AI)",
        "code": "Block-34",
        "category": "Academic",
        "x": 420,
        "y": 320,
        "shuttle_stop": True,
        "description": "High-performance computing labs, AI/Robotics centre, Apple Mac lab, and IoT development centre.",
        "features": ["AI & ML Lab", "Cybersecurity Centre", "Coding Arena", "Server Room"]
    },
    "block_38": {
        "id": "block_38",
        "name": "Block 38 (Bio-Tech & Agriculture)",
        "code": "Block-38",
        "category": "Academic",
        "x": 330,
        "y": 260,
        "shuttle_stop": False,
        "description": "Biotechnology research laboratories, tissue culture, and agricultural science facilities.",
        "features": ["Bio Labs", "Greenhouses", "Soil Testing Lab"]
    },
    "block_25": {
        "id": "block_25",
        "name": "Block 25 (Engineering & Workshops)",
        "code": "Block-25",
        "category": "Academic",
        "x": 580,
        "y": 340,
        "shuttle_stop": True,
        "description": "Mechanical, Electrical, and Civil engineering workshops and innovation labs.",
        "features": ["Robotics Cell", "CNC Machines", "Automobile Workshop"]
    },
    "hospital": {
        "id": "hospital",
        "name": "Uni-Hospital & Healthcare Centre",
        "code": "Uni-Hospital",
        "category": "Medical",
        "x": 240,
        "y": 620,
        "shuttle_stop": True,
        "description": "Multi-specialty 24/7 hospital with emergency ICU, pharmacy, ambulance bay, and specialist doctors.",
        "features": ["24/7 Emergency", "Pharmacy", "Diagnostics & X-Ray", "Ambulance Bay"]
    },
    "bh_5": {
        "id": "bh_5",
        "name": "Boys Hostel 5 (BH-5 Mega Hostel)",
        "code": "BH-5",
        "category": "Hostel",
        "x": 780,
        "y": 320,
        "shuttle_stop": True,
        "description": "14-storey premier boys hostel with mess, indoor gym, study halls, and tuck shops.",
        "features": ["Mess Dining", "Gymnasium", "Laundry Hub", "Basketball Court", "Security Gate"]
    },
    "bh_zone": {
        "id": "bh_zone",
        "name": "Boys Hostels Complex (BH-1 to BH-4 & BH-6 to BH-8)",
        "code": "BH-Zone",
        "category": "Hostel",
        "x": 820,
        "y": 480,
        "shuttle_stop": True,
        "description": "Sprawling residential sector for male students with central mess lawns and convenience stores.",
        "features": ["Central Lawn", "Night Mess", "Stationery Shop"]
    },
    "gh_zone": {
        "id": "gh_zone",
        "name": "Girls Hostels Complex (GH-1 to GH-6)",
        "code": "GH-Zone",
        "category": "Hostel",
        "x": 190,
        "y": 440,
        "shuttle_stop": True,
        "description": "High-security gated girls residential complex with private dining, reading rooms, and indoor badminton.",
        "features": ["Biometric Turnstiles", "All-Female Staff", "Gym", "Private Cafeteria", "Pharmacy Counter"]
    },
    "sports_stadium": {
        "id": "sports_stadium",
        "name": "Indoor & Outdoor Olympic Sports Stadium",
        "code": "Sports-Arena",
        "category": "Sports",
        "x": 720,
        "y": 680,
        "shuttle_stop": True,
        "description": "Olympic-sized sports complex with all-weather athletic track, football ground, and heated swimming pool.",
        "features": ["Athletic Track", "Football Turf", "Indoor Badminton & Squash", "Swimming Pool"]
    }
}

# Bidirectional pathways with real ground distance in meters and walking path description
CAMPUS_EDGES = [
    ("main_gate", "unimall", 350, "Straight along the Grand Palm Boulevard"),
    ("main_gate", "hospital", 450, "Turn left at Gate 1 roundabout past the medical emergency lane"),
    ("unimall", "unipolis", 200, "Walk north past the fountain plaza into Unipolis avenue"),
    ("unimall", "auditorium", 280, "Walk north-west past the food kiosk strip towards the Auditorium garden"),
    ("unimall", "sports_stadium", 300, "Head east towards the outdoor athletic grounds"),
    ("unimall", "gh_zone", 420, "Take the secure west perimeter walkway towards GH security entrance"),
    ("unipolis", "library", 220, "Walk north-east along the student promenade to the Library forecourt"),
    ("unipolis", "block_32", 180, "Walk north directly into Block 32 central courtyard"),
    ("auditorium", "block_32", 160, "Take the covered glass corridor into Block 32 south entrance"),
    ("auditorium", "hospital", 300, "Head west across the shaded medical gardens"),
    ("block_32", "block_34", 170, "Head straight north through the CSE corridor bridge into Block 34"),
    ("block_32", "block_25", 220, "Head east across the Engineering plaza into Block 25"),
    ("block_34", "block_38", 190, "Walk west along the research labs path towards the Bio-Tech greenhouses"),
    ("block_32", "library", 240, "Take the east connecting walkway directly into Central Library"),
    ("block_25", "bh_5", 320, "Walk east past the innovation center towards BH-5 security gate"),
    ("block_34", "bh_5", 400, "Take the North Ring Road pedestrian pathway towards BH-5"),
    ("library", "bh_zone", 340, "Head east through the hostel green belt into BH-1/BH-2 avenue"),
    ("bh_5", "bh_zone", 280, "Walk south along the hostel boulevard between BH-5 and BH-4"),
    ("sports_stadium", "bh_zone", 320, "Head north along the sports complex boundary wall"),
    ("gh_zone", "auditorium", 260, "Walk east along the garden trail into Auditorium side entrance"),
    ("gh_zone", "hospital", 250, "Head south-west directly along the campus clinic pathway")
]

# Build adjacency graph
def get_graph():
    graph: Dict[str, List[Dict[str, Any]]] = {}
    for node_id in CAMPUS_NODES:
        graph[node_id] = []

    for u, v, dist, note in CAMPUS_EDGES:
        if u in graph and v in graph:
            graph[u].append({"to": v, "distance": dist, "note": note})
            graph[v].append({"to": u, "distance": dist, "note": note})
    return graph

def dijkstra_shortest_path(start_id: str, target_id: str):
    if start_id not in CAMPUS_NODES or target_id not in CAMPUS_NODES:
        return None

    if start_id == target_id:
        return {
            "path": [start_id],
            "total_distance": 0,
            "segments": []
        }

    graph = get_graph()
    distances = {node: float("inf") for node in CAMPUS_NODES}
    distances[start_id] = 0
    previous = {node: None for node in CAMPUS_NODES}
    prev_notes = {}
    unvisited = set(CAMPUS_NODES.keys())

    while unvisited:
        # Find lowest distance unvisited node
        current = min(unvisited, key=lambda node: distances[node])
        if distances[current] == float("inf"):
            break
        if current == target_id:
            break

        unvisited.remove(current)

        for edge in graph[current]:
            neighbor = edge["to"]
            if neighbor in unvisited:
                alt = distances[current] + edge["distance"]
                if alt < distances[neighbor]:
                    distances[neighbor] = alt
                    previous[neighbor] = current
                    prev_notes[neighbor] = edge["note"]

    if distances[target_id] == float("inf"):
        return None

    # Reconstruct path
    curr = target_id
    path = []
    while curr is not None:
        path.append(curr)
        curr = previous[curr]
    path.reverse()

    # Build detailed segments
    segments = []
    for i in range(len(path) - 1):
        n1 = path[i]
        n2 = path[i+1]
        note = prev_notes.get(n2, "Follow main walkway")
        # Find exact edge distance
        edge_dist = 100
        for edge in graph[n1]:
            if edge["to"] == n2:
                edge_dist = edge["distance"]
                break
        segments.append({
            "from_id": n1,
            "from_name": CAMPUS_NODES[n1]["name"],
            "to_id": n2,
            "to_name": CAMPUS_NODES[n2]["name"],
            "distance": edge_dist,
            "instruction": note
        })

    return {
        "path": path,
        "total_distance": distances[target_id],
        "segments": segments
    }

class RouteRequest(BaseModel):
    origin: str
    destination: str
    mode: Optional[str] = "walking"  # "walking" or "shuttle"

class QueryRequest(BaseModel):
    query: str
    current_location: Optional[str] = "bh_5"

@router.get("/landmarks")
def list_landmarks():
    """Returns all campus landmarks with 2D map coordinates and attributes."""
    return list(CAMPUS_NODES.values())

@router.post("/directions")
def get_directions(req: RouteRequest):
    """Calculates Google Maps-style shortest path between any two campus points."""
    origin = req.origin.lower().strip().replace("-", "_").replace(" ", "_")
    destination = req.destination.lower().strip().replace("-", "_").replace(" ", "_")

    # Handle aliases
    aliases = {
        "bh5": "bh_5",
        "bh_5_mega_hostel": "bh_5",
        "boys_hostel_5": "bh_5",
        "block34": "block_34",
        "block_34_cse": "block_34",
        "block32": "block_32",
        "block38": "block_38",
        "block25": "block_25",
        "uni_mall": "unimall",
        "mall": "unimall",
        "hospital": "hospital",
        "uni_hospital": "hospital",
        "clinic": "hospital",
        "sports": "sports_stadium",
        "stadium": "sports_stadium",
        "gym": "sports_stadium",
        "main_gate": "main_gate",
        "gate": "main_gate",
        "gate_1": "main_gate"
    }

    orig_id = aliases.get(origin, origin)
    dest_id = aliases.get(destination, destination)

    if orig_id not in CAMPUS_NODES:
        raise HTTPException(status_code=400, detail=f"Origin landmark '{req.origin}' not recognized.")
    if dest_id not in CAMPUS_NODES:
        raise HTTPException(status_code=400, detail=f"Destination landmark '{req.destination}' not recognized.")

    res = dijkstra_shortest_path(orig_id, dest_id)
    if not res:
        raise HTTPException(status_code=404, detail="No route found between selected points.")

    total_dist = res["total_distance"]
    # Average walking speed = 4.5 km/h ~ 75 meters/minute
    walking_time_mins = max(1, math.ceil(total_dist / 75.0))
    # E-Rickshaw shuttle speed = 15 km/h ~ 250 meters/minute + 2 min wait
    shuttle_time_mins = max(2, math.ceil(total_dist / 250.0) + 2)

    # Generate Google Maps-style turn-by-turn steps
    steps = []
    for idx, seg in enumerate(res["segments"], 1):
        step_time = max(1, math.ceil(seg["distance"] / 75.0))
        steps.append({
            "step_number": idx,
            "instruction": f"From {seg['from_name']}, {seg['instruction']} to {seg['to_name']}.",
            "distance_meters": seg["distance"],
            "est_minutes": step_time,
            "landmark_to": CAMPUS_NODES[seg["to_id"]]
        })

    # AI Route Summary & Advice
    origin_name = CAMPUS_NODES[orig_id]["name"]
    dest_name = CAMPUS_NODES[dest_id]["name"]
    is_shuttle_recommended = total_dist >= 500 and CAMPUS_NODES[orig_id]["shuttle_stop"] and CAMPUS_NODES[dest_id]["shuttle_stop"]

    ai_advice = (
        f"Fastest route from {origin_name} to {dest_name} is approximately {total_dist} meters ({walking_time_mins} min walk). "
        f"{'You can take an Electric Campus Shuttle from the stand for a faster ~' + str(shuttle_time_mins) + ' min transit.' if is_shuttle_recommended else 'This is a comfortable walking path along pedestrian avenues with tree shade.'}"
    )

    return {
        "origin": CAMPUS_NODES[orig_id],
        "destination": CAMPUS_NODES[dest_id],
        "total_distance_meters": total_dist,
        "estimated_walk_minutes": walking_time_mins,
        "estimated_shuttle_minutes": shuttle_time_mins,
        "shuttle_available": is_shuttle_recommended,
        "steps": steps,
        "path_node_ids": res["path"],
        "path_coordinates": [{"x": CAMPUS_NODES[nid]["x"], "y": CAMPUS_NODES[nid]["y"], "name": CAMPUS_NODES[nid]["name"]} for nid in res["path"]],
        "ai_navigation_summary": ai_advice
    }

@router.post("/ask-ai")
def ask_campus_navigator(req: QueryRequest):
    """Natural language AI query handler for campus navigation and wayfinding."""
    q = req.query.lower()

    # Simple heuristic intent matcher for fast responses
    dest_key = None
    if "block 34" in q or "cse" in q or "computer" in q or "coding" in q or "mac lab" in q:
        dest_key = "block_34"
    elif "block 32" in q or "academic" in q or "class" in q:
        dest_key = "block_32"
    elif "hospital" in q or "doctor" in q or "medicine" in q or "emergency" in q or "pharmacy" in q:
        dest_key = "hospital"
    elif "mall" in q or "food" in q or "atm" in q or "eating" in q or "dominos" in q or "subway" in q:
        dest_key = "unimall"
    elif "library" in q or "books" in q or "reading" in q or "study" in q:
        dest_key = "library"
    elif "unipolis" in q or "concert" in q or "event" in q or "fest" in q:
        dest_key = "unipolis"
    elif "auditorium" in q or "shanti" in q:
        dest_key = "auditorium"
    elif "gym" in q or "sports" in q or "stadium" in q or "swimming" in q or "badminton" in q or "track" in q:
        dest_key = "sports_stadium"
    elif "bh 5" in q or "bh-5" in q or "hostel 5" in q:
        dest_key = "bh_5"
    elif "girls hostel" in q or "gh" in q:
        dest_key = "gh_zone"
    elif "boys hostel" in q or "bh" in q:
        dest_key = "bh_zone"
    elif "gate" in q or "exit" in q or "nh-1" in q or "auto" in q:
        dest_key = "main_gate"
    else:
        dest_key = "unimall"

    orig_key = req.current_location.lower().replace("-", "_") if req.current_location else "bh_5"
    if orig_key not in CAMPUS_NODES:
        orig_key = "bh_5"

    route = dijkstra_shortest_path(orig_key, dest_key)
    dest_node = CAMPUS_NODES[dest_key]
    orig_node = CAMPUS_NODES[orig_key]

    dist = route["total_distance"] if route else 300
    mins = max(1, math.ceil(dist / 75.0))

    response_text = (
        f"To reach **{dest_node['name']}** from your current location at **{orig_node['name']}**, "
        f"follow the path past {', then '.join([seg['to_name'] for seg in route['segments']][:2])}. "
        f"Total distance is **{dist} meters** (~{mins} min walk). "
        f"Tip: {dest_node['description']}"
    )

    return {
        "reply": response_text,
        "suggested_origin": orig_key,
        "suggested_destination": dest_key,
        "destination_landmark": dest_node,
        "distance_meters": dist,
        "estimated_minutes": mins
    }
