import InteractiveMap from "./interactiveMap";
import balloonTemplate from "../templates/balloon.hbs";
import reviewTemplate from "../templates/reviewItem.hbs";

export default class GeoReview {
    constructor() {
        this.balloonTemplate = balloonTemplate;
        this.reviewTemplate = reviewTemplate;
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
        const res = await fetch(`/review-map/${method}`, {
            method: 'POST',
            body: JSON.stringify(body)
        });
        return await res.json();
    }

    createBalloon(coords, reviews) {
        const rootNode = document.createElement('div');
        rootNode.innerHTML = this.balloonTemplate();
        const reviewListNode = rootNode.querySelector('.balloon__reviews-list');
        const reviewFormNode = rootNode.querySelector('[data-role=review-form]');
        reviewFormNode.dataset.coords = JSON.stringify(coords);

        const domParser = new DOMParser();

        for (const item of reviews) {
            const liReviewNode = this.reviewTemplate({
                name: item.name,
                place: item.place,
                text: item.text
            });
            reviewListNode.appendChild(domParser.parseFromString(liReviewNode, 'text/html').body);
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
            e.preventDefault();

            let emptyFieldFlag = false;

            const reviewFormNode = document.querySelector('[data-role=review-form]');
            const coords = JSON.parse(reviewFormNode.dataset.coords);
            const fieldNodes = {
                name: document.querySelector('[data-role=review-name]'),
                place: document.querySelector('[data-role=review-place]'),
                review: document.querySelector('[data-role=review-text]')
            };

            for (const field in fieldNodes) {
                if (!fieldNodes[field].value) {
                    fieldNodes[field].classList.add('empty__field');
                    emptyFieldFlag = true;
                } else {
                    fieldNodes[field].classList.remove('empty__field');
                }
            }

            if (emptyFieldFlag) return;

            const data = {
                coords,
                review: {
                    name: fieldNodes.name.value,
                    place: fieldNodes.place.value,
                    text: fieldNodes.review.value
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
