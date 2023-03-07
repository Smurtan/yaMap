function init() {
    const map = new ymaps.Map('map', {
        center: [59.94, 30.32],
        zoom: 12,
        controls: ['zoomControl'],
        behaviors: ['scrollZoom'],
        noPlacemark: true
    });

    const reviewsCollections = new ymaps.GeoObjectCollection({}, {
        draggable: false
    });

    const balloon = new ymaps.Balloon(map, {
        minHeight: 500
    })
    balloon.open(map.getCenter());

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

        reviewsCollections.add(new ymaps.Placemark(coords, {
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
            }, {balloonMinHeight: 450}))
    });

    map.geoObjects.add(reviewsCollections);
}

ymaps.ready(init);
