import InteractiveMap from "./interactiveMap";



export default class GeoReview {
    constructor() {
        this.balloonTemplate = document.querySelector('#addBalloonTemplate').innerHTML;
        this.map = new InteractiveMap('map', this.onClick.bind(this));
        this.map.init().then(this.onInit.bind(this));
    }

    async onInit() {
        const coords = await this.callApi('coords');

        for (const item of coords) {
            for (let i = 0; i < item.total; i++) {
                this.map.createPlacemark(item.coords)
            }
        }

        document.body.addEventListener('click', this.onDocumentClick.bind(this));
    }

    async callApi(method, body = {})  {
        const res = await fetch(`/geo-review/${method}`, {
            method: post,
            body: JSON.stringify(body)
        });
        return await res.json();
    }

    createBalloon(coords, reviews) {
        const rootNode = document.createElement('div');
        rootNode.innerHTML = this.balloonTemplate;
        const reviewFormNode = rootNode.querySelector('[data-role=review-form]');
        reviewFormNode.dataset.coords = JSON.stringify(coords);

        for (const item of reviews) {
            const div = document.createElement('div')
        }

        return rootNode
    }

    async onClick(coords) {
        this.map.openBalloon(coords, 'Загрузка...');
        const list = await this.callApi('list', {coords});
        const balloonNode = this.createBalloon(coords, list);
        this.map.setBalloonContent(balloonNode.innerHTML);
    }

    async onDocumentClick(e) {
        if (e.target.dataset.role === 'review-add') {
            const reviewFormNode = document.querySelector('[data-role=review-form]');
            const coords = JSON.parse(reviewFormNode.dataset.coords);
            const data = {
                coords,
                review: {
                    name: document.querySelector('[data-role=review-name]').value,
                    place: document.querySelector('[data-role=review-place]').value,
                    text: document.querySelector('[data-role=review-text]').value
                }
            };

            try {
                await this.callApi('add', data);
                this.map.createPlacemark(coords);
                this.map.closeBalloon();
            } catch (e) {
                const formError = document.querySelector('.form-error');
                formError.innerText = e.message;
            }
        }
    }
}
