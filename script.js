let map;
let currentLocationMarker;
let targetLocationMarker;
let directionsService;
let directionsRenderer;
let targetPos;
let score = 0;
let gameStarted = false;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 15,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
    });

    // HTML5 Geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                map.setCenter(pos);
                currentLocationMarker = new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: 'המיקום שלך',
                });

                // Add button event listener.
                document.getElementById('startBtn').addEventListener('click', () => {
                    if (!gameStarted) {
                        startGame(pos);
                    } else {
                        alert('אתה כבר בתהליך המשחק!');
                    }
                });
            },
            () => {
                handleLocationError(true, map.getCenter());
            }
        );
    } else {
        // Browser doesn't support Geolocation.
        handleLocationError(false, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, pos) {
    const infoWindow = new google.maps.InfoWindow({
        content: browserHasGeolocation
            ? 'שגיאה: שירות המיקום נכשל.'
            : 'שגיאה: הדפדפן שלך לא תומך במיקום גאוגרפי.',
        position: pos,
    });
    infoWindow.open(map);
}

function startGame(currentPos) {
    const randomDistance = Math.random() * (600 - 100) + 100;
    const randomAngle = Math.random() * 2 * Math.PI;

    const targetLat = currentPos.lat + (randomDistance / 111000) * Math.cos(randomAngle);
    const targetLng = currentPos.lng + (randomDistance / 111000) * Math.sin(randomAngle);

    targetPos = {
        lat: targetLat,
        lng: targetLng,
    };

    if (targetLocationMarker) {
        targetLocationMarker.setMap(null);
    }

    targetLocationMarker = new google.maps.Marker({
        position: targetPos,
        map: map,
        title: 'מיקום יעד',
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        }
    });

    calculateAndDisplayRoute(currentPos, targetPos);

    alert('הולכים למקום המסומן בירוק בלי להסתכל בטלפון!');
    gameStarted = true;

    // Show the "Ready" button and hide the "Start Game" button
    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('readyBtn').classList.remove('hidden');
}

function calculateAndDisplayRoute(start, end) {
    const request = {
        origin: start,
        destination: end,
        travelMode: 'WALKING',
    };

    directionsService.route(request, (result, status) => {
        if (status == 'OK') {
            directionsRenderer.setDirections(result);
        } else {
            alert('בקשת ההנחיות נכשלה עקב ' + status);
        }
    });
}

function startWalking() {
    // Gray out the map, hide the "Ready" button, and show the "Arrived" button
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('readyBtn').classList.add('hidden');
    document.getElementById('arrivedBtn').classList.remove('hidden');
}

function verifyLocation() {
    if (!gameStarted) {
        alert('יש להתחיל משחק קודם!');
        return;
    }

    // Geolocate again to get the current position
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(userPos),
                new google.maps.LatLng(targetPos)
            );

            if (distance <= 30) { // Within 30 meters of the target
                alert('יאיי! הגעת למקום היעד!');
                score += 10;
                document.getElementById('score').textContent = 'ניקוד: ' + score;
                showNewGameButton();
            } else {
                alert('מיקום שגוי! נסה שוב.');
                document.getElementById('overlay').style.display = 'none'; // Show the map again for another try
                document.getElementById('arrivedBtn').classList.add('hidden');
                document.getElementById('readyBtn').classList.remove('hidden');
            }
        });
    } else {
        alert('שגיאה: הדפדפן שלך לא תומך במיקום גאוגרפי.');
    }
}

function showNewGameButton() {
    document.getElementById('newGameBtn').classList.remove('hidden');
    document.getElementById('arrivedBtn').classList.add('hidden');
    document.getElementById('overlay').style.display = 'none';
    gameStarted = false;
}

function startNewGame() {
    // Reset the game state
    gameStarted = false;
    document.getElementById('newGameBtn').classList.add('hidden');
    document.getElementById('startBtn').classList.remove('hidden');
    directionsRenderer.set('directions', null); // Clear previous directions
}

// Event listeners
document.getElementById('readyBtn').addEventListener('click', startWalking);
document.getElementById('arrivedBtn').addEventListener('click', verifyLocation);

// Initialize the map on window load.
window.onload = initMap;
