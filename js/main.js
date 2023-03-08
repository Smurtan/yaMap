geoObjects = [];
const storage = localStorage;

function init() {
    const map = new ymaps.Map('map', {
        center: [59.94, 30.32],
        zoom: 12,
        controls: ['zoomControl'],
        behaviors: ['scrollZoom'],
        noPlacemark: true
    });

    const clusterer = new ymaps.Clusterer({
        groupByCoordinates: true,
        clusterDisableClickZoom: true,
        hideIconOnBalloonOpen: false,

        // clusterIconContentLayout:
    })

    const storageGeoObjects = JSON.parse(storage.geoObjects || '{}');

    for (const coords in storageGeoObjects) {
        let reviewItems = '';

        for (const review of storageGeoObjects[coords]) {
            reviewItems += [
                '<li class="balloon__reviews-item">',
                `<span class="item__name">${review.name}</span>`,
                `<span class="item__information">${review.place}</span>`,
                `<p class="item__review">${review.review}</p>`,
                '</li>'].join('')
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

            if (geoObjectStorage[geoObjects[geoObjects.length - 1].geometry._coordinates]) {
                geoObjectStorage[geoObjects[geoObjects.length - 1].geometry._coordinates].push({
                    name: inputNodes[0].value,
                    place: inputNodes[1].value,
                    review: inputNodes[2].value
                })
            } else {
                geoObjectStorage[geoObjects[geoObjects.length - 1].geometry._coordinates] = [{
                    name: inputNodes[0].value,
                    place: inputNodes[1].value,
                    review: inputNodes[2].value
                }]
            }

            storage.geoObjects = JSON.stringify(geoObjectStorage);
            console.log(storage.geoObjects);

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
                    '<li class="balloon__reviews-item">',
                    '<span class="item__name">Антон</span>',
                    '<span class="item__information">Кафе 09.06.2023</span>',
                    '<p class="item__review">Можно классно посидеть и отдохнуть!</p>',
                    '</li>',
                    '<li class="balloon__reviews-item">',
                    '<span class="item__name">Василий</span>',
                    '<span class="item__information">Магнит 12.08.2023</span>',
                    '<p class="item__review">Колбаса - огонь!</p>',
                    '</li>',
                    '<li class="balloon__reviews-item">',
                    '<span class="item__name">Василий</span>',
                    '<span class="item__information">Магнит 12.08.2023</span>',
                    '<p class="item__review">Колбаса - огонь!</p>',
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
                ].join(''),
            }, {balloonMinHeight: 450}));

            clusterer.add(geoObjects);
        });

        map.geoObjects.add(clusterer);
    }

    ymaps.ready(init);
