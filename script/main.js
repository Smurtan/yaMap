const storage = localStorage;
const myPlacemarks = {};
let activeCoords;

const formNode = [
    '<h3 class="balloon__title">Отзыв:</h3>',
    '<form class="balloon__form" action="#">',
    '<input class="input__info" type="text" maxlength="50" placeholder="Укажите ваше имя">',
    '<input class="input__info" type="text" maxlength="50" placeholder="Укажите место">',
    '<textarea  class="input__info input__review" name="review" maxlength="500" cols="30" rows="10" placeholder="Оставить отзыв"></textarea>',
    '<button class="balloon__form-button" type="submit">Добавить</button>',
    '</form>'].join('');

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

    function handUpClick(placemark) {
        placemark.events.add('click', (e) => {
            const target = e.get('target');

            activeCoords = target.geometry._coordinates.join(',');
        })
    }

    function createHtmlReviewRecordString(name, place, review) {
        return [
            '<li class="balloon__reviews-item">',
            `<span class="item__name">${name}</span>`,
            `<span class="item__information">${place}</span>`,
            `<p class="item__review">${review}</p>`,
            '</li>'].join('');
    }

    function addReviewRecord(name, place, review) {
        const newReview = createHtmlReviewRecordString(name, place, review);

        myPlacemarks[activeCoords].placemark.properties.set('balloonContent', [
            '<div class="balloon">',
            '<ul class="balloon__reviews-list">',
            myPlacemarks[activeCoords].balloonContent,
            newReview,
            '</ul>',
            formNode,
            '</div>'
        ].join(''));

        if (myPlacemarks[activeCoords].balloonContent) {
            geoObjects.push(new ymaps.Placemark(activeCoords.split(',')));
        }

        myPlacemarks[activeCoords].balloonContent += newReview;
        clusterer.add(geoObjects);

        const objectState = clusterer.getObjectState(myPlacemarks[activeCoords].placemark);
        if (objectState.isClustered) {
            clusterer.balloon.open(objectState.cluster);
        } else {
            myPlacemarks[activeCoords].placemark.balloon.open();
        }
    }

    const geoObjectStorage = JSON.parse(storage.geoObjects || '{}');

    for (const coordinate in geoObjectStorage) {
        let reviewItems = '';
        let countReviews = 0;

        for (const review of geoObjectStorage[coordinate]) {
            reviewItems += createHtmlReviewRecordString(review.name, review.place, review.review);
            countReviews++;
        }

        const newPlacemark = new ymaps.Placemark(coordinate.split(','), {
            balloonContent: [
                '<div class="balloon">',
                '<ul class="balloon__reviews-list">',
                reviewItems,
                '</ul>',
                formNode,
                '</div>'
            ].join(''),
        }, {balloonMaxHeight: 450});

        handUpClick(newPlacemark);

        myPlacemarks[coordinate] = {
            placemark: newPlacemark,
            balloonContent: reviewItems,
            cluster: null
        };

        geoObjects.push(newPlacemark);

        for (let i = 0; i < countReviews - 1; i++) {
            geoObjects.push(new ymaps.Placemark(coordinate.split(',')));
        }

        clusterer.add(geoObjects);
    }

    clusterer.events.add('click', (e) => {
        const target = e.get('target');

        activeCoords = target.geometry._coordinates.join(',');
        myPlacemarks[activeCoords].cluster = target;
    })

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            map.behaviors.enable('drag');
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            map.behaviors.disable('drag');
        }
    });

    map.events.add('click', (e) => {
        const coords = e.get('coords');

        const newPlacemark = new ymaps.Placemark(coords, {
            balloonContent: [
                '<div class="balloon">',
                formNode,
                '</div>'
            ].join(''),
        }, {balloonMaxHeight: 450});

        myPlacemarks[coords] = {
            placemark: newPlacemark,
            balloonContent: '',
            cluster: null
        };

        activeCoords = coords.join(',')

        handUpClick(newPlacemark);

        geoObjects.push(newPlacemark);
        clusterer.add(geoObjects);
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

            let geoObjectStorage = JSON.parse(storage.geoObjects || '{}');

            const reviewInfo = {
                name: inputNodes[0].value,
                place: inputNodes[1].value,
                review: inputNodes[2].value
            };

            if (geoObjectStorage[activeCoords]) {
                geoObjectStorage[activeCoords].push(reviewInfo);
            } else {
                geoObjectStorage[activeCoords] = [reviewInfo];
            }

            storage.geoObjects = JSON.stringify(geoObjectStorage);

            addReviewRecord(reviewInfo.name, reviewInfo.place, reviewInfo.review);

            for (const inputNode of inputNodes) {
                inputNode.value = '';
            }
        }
    })
    map.geoObjects.add(clusterer);
}

ymaps.ready(init);
