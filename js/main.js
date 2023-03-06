function init() {
    const map = new ymaps.Map('map', {
        center: [59.94, 30.32],
        zoom: 12,
        behaviors: ['scrollZoom']
    });

    const reviewsCollections = new ymaps.GeoObjectCollection({}, {
        draggable: false
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            map.behaviors.enable('drag')
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            map.behaviors.disable('drag')
        }
    });

    map.events.add('click', (e) => {
        const coords = e.get('coords');

        reviewsCollections.add(new ymaps.Placemark(coords));
    });

    map.geoObjects.add(reviewsCollections)
}

ymaps.ready(init);
