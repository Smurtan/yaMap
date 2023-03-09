const storage = localStorage;

function init() {
    const map = new ymaps.Map('map', {
            center: [59.94, 30.32],
            zoom: 12,
            controls: ['zoomControl'],
            behaviors: ['scrollZoom']
        }),
        objectManager = new ymaps.ObjectManager({
            clusterize: true,
            clusterDisableClickZoom: true
        }),
        clusterer = new ymaps.Clusterer({
            groupByCoordinates: true,
            clusterDisableClickZoom: true,
            hideIconOnBalloonOpen: false,
            clusterBalloonContentLayoutWidth: 350,
            clusterBalloonContentLayoutHeight: 450
        }),
        geoObjects = [];

    const storageGeoObjects = JSON.parse(storage.geoObjects || '{}');

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

        geoObjects.push(new ymaps.Placemark(coords.split(','), {
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
        }, {balloonMinHeight: 450}));
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
            const place = inputNodes[0].value;
            const review = inputNodes[0].value;

            const coords = geoObjects[geoObjects.length - 1].geometry._coordinates

            if (geoObjectStorage[coords]) {
                geoObjectStorage[coords].push({
                    name: name,
                    place: place,
                    review: review
                })
            } else {
                geoObjectStorage[coords] = [{
                    name: name,
                    place: place,
                    review: review
                }]
            }

            storage.geoObjects = JSON.stringify(geoObjectStorage);

            addReview(name, place, review, coords);


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

        clusterer.add(geoObjects);
    });

    map.geoObjects.add(clusterer);
}

function addReview(name, place, review, coords) {
    const reviewsListNode = document.querySelector('.balloon__reviews-list');

    const newLiNode = document.createElement('li');
    newLiNode.classList.add("balloon__reviews-item");
    newLiNode.innerHTML = [
        `<span class="item__name">${name}</span>`,
        `<span class="item__information">${place}</span>`,
        `<p class="item__review">${review}</p>`].join('')

    reviewsListNode.appendChild(newLiNode);

    geoObjects.push(new ymaps.Placemark(coords));
    clusterer.add(geoObjects)
}

ymaps.ready(init);
