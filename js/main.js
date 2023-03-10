const storage = localStorage;
const myPlacemarks = {};
let activeCoords;

function init() {
    const map = new ymaps.Map('map', {
            center: [59.94, 30.32],
            zoom: 12,
            controls: ['zoomControl'],
            behaviors: ['scrollZoom']
        }),
        clusterer = new ymaps.Clusterer({
            groupByCoordinates: true,
            clusterDisableClickZoom: true,
            hideIconOnBalloonOpen: false,
            clusterBalloonContentLayoutWidth: 350,
            clusterBalloonContentLayoutHeight: 450
        }),
        geoObjects = [];

    let placemarkId = 0;

    const storageGeoObjects = JSON.parse(storage.geoObjects || '{}');

    clusterer.events.add('click', (e) => {
        const target = e.get('target');

        activeCoords = target.geometry._coordinates.join(',');
        myPlacemarks[activeCoords].cluster = target;
    })

    for (const coords in storageGeoObjects) {
        let reviewItems = '';
        let countPlacemarks = 0;

        for (const review of storageGeoObjects[coords]) {
            reviewItems += [
                '<li class="balloon__reviews-item">',
                `<span class="item__name">${review.name}</span>`,
                `<span class="item__information">${review.place}</span>`,
                `<p class="item__review">${review.review}</p>`,
                '</li>'].join('')
            countPlacemarks++;
        }

        const newPlacemark = new ymaps.Placemark(coords.split(','), {
            id: ++placemarkId,
            balloonContent: [
                '<div class="balloon">',
                '<ul class="balloon__reviews-list">',
                reviewItems,
                '</ul>',
                '<h3 class="balloon__title">Отзыв:</h3>',
                '<form class="balloon__form" action="#">',
                '<input class="input__info" type="text" placeholder="Укажите ваше имя">',
                '<input class="input__info" type="text" placeholder="Укажите место">',
                '<textarea  class="input__info input__review" name="review" cols="30" rows="10" placeholder="Оставить отзыв"></textarea>',
                '<button class="balloon__form-button" type="submit">Добавить</button>',
                '</form>',
                '</div>'
            ].join(''),
        }, {balloonMinHeight: 450})
        // console.log(newPlacemark);
        // console.log(newPlacemark.properties.get('id'));
        // console.log(map);
        const placemarkCoords = newPlacemark.geometry._coordinates.join(',');
        myPlacemarks[placemarkCoords] = {
            placemark: newPlacemark,
            balloonContent: reviewItems,
            cluster: null
        }

        newPlacemark.events.add('click', (e) => {
            const target = e.get('target');

            activeCoords = target.geometry._coordinates.join(',');
        })
        geoObjects.push(newPlacemark);

        for (let i = 0; i < countPlacemarks - 1; i++) {
            geoObjects.push(new ymaps.Placemark(coords.split(',')));
        }

        clusterer.add(geoObjects);
    }

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

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains("balloon__form-button")) {
            e.preventDefault();

            const formNode = e.target.parentNode;
            const inputNodes = formNode.querySelectorAll('.input__info');

            for (const inputNode of inputNodes) {
                if (!inputNode.value) {
                    inputNode.classList.add('empty__field');
                    return;
                } else {
                    inputNode.classList.remove('empty__field');
                }
            }

            let geoObjectStorage = JSON.parse(storage.geoObjects || '{}')

            const name = inputNodes[0].value;
            const place = inputNodes[1].value;
            const review = inputNodes[2].value

            if (geoObjectStorage[activeCoords]) {
                geoObjectStorage[activeCoords].push({
                    name: name,
                    place: place,
                    review: review
                })
            } else {
                geoObjectStorage[activeCoords] = [{
                    name: name,
                    place: place,
                    review: review
                }]
            }

            storage.geoObjects = JSON.stringify(geoObjectStorage);

            addReview(name, place, review, activeCoords);


            for (const inputNode of inputNodes) {
                inputNode.value = '';
            }
        }
    })

    map.events.add('click', (e) => {
        const coords = e.get('coords');

        geoObjects.push(new ymaps.Placemark(coords, {
            balloonContent: [
                '<div class="balloon">',
                '<ul class="balloon__reviews-list">',
                '</ul>',
                '<h3 class="balloon__title">Отзыв:</h3>',
                '<form class="balloon__form" action="#">',
                '<input class="input__info" type="text" placeholder="Укажите ваше имя">',
                '<input class="input__info" type="text" placeholder="Укажите место">',
                '<textarea  class="input__info input__review" name="review" cols="30" rows="10" placeholder="Оставить отзыв"></textarea>',
                '<button class="balloon__form-button" type="submit">Добавить</button>',
                '</form>',
                '</div>'
            ].join(''),
        }, {balloonMinHeight: 450}));

        geoObjects[geoObjects.length - 1].events.add('click', (e) => {
            let placemarkId = e.get('objectId');
            console.log(placemarkId);
        })

        clusterer.add(geoObjects);
    });

    function addReview(name, place, review) {
        myPlacemarks[activeCoords].placemark.properties.set('balloonContent', [
            '<div class="balloon">',
            '<ul class="balloon__reviews-list">',
            myPlacemarks[activeCoords].balloonContent,
            '<li>',
            `<span class="item__name">${name}</span>`,
            `<span class="item__information">${place}</span>`,
            `<p class="item__review">${review}</p>`,
            '</li>',
            '</ul>',
            '<h3 class="balloon__title">Отзыв:</h3>',
            '<form class="balloon__form" action="#">',
            '<input class="input__info" type="text" placeholder="Укажите ваше имя">',
            '<input class="input__info" type="text" placeholder="Укажите место">',
            '<textarea  class="input__info input__review" name="review" cols="30" rows="10" placeholder="Оставить отзыв"></textarea>',
            '<button class="balloon__form-button" type="submit">Добавить</button>',
            '</form>',
            '</div>'
        ].join(''))

        geoObjects.push(new ymaps.Placemark(activeCoords.split(',')));
        clusterer.add(geoObjects);

        const objectState = clusterer.getObjectState(myPlacemarks[activeCoords].placemark);
        if (objectState.isClustered) {
            clusterer.balloon.open(objectState.cluster);
        } else {
            myPlacemarks[activeCoords].placemark.balloon.open();
        }
    }

    map.geoObjects.add(clusterer);
}

ymaps.ready(init);
