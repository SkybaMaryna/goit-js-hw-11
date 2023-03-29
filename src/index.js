import Notiflix, { Loading } from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
const axios = require('axios').default;
const API_KEY = '34782015-10a3599984749068d4803df7b';
const BASE_URL = 'https://pixabay.com/api/';
const lightbox = new SimpleLightbox('.gallery a')

const refs = {
    searchForm: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more'),
    input: document.querySelector('input')
}

let pageCount = 1
const photosPerPage = 40

refs.loadMoreBtn.style.display = "none"

refs.searchForm.addEventListener('submit', createGallery)

async function createGallery(event) {
    try {
        event.preventDefault();
        cleanData()
        let request = event.target.elements.searchQuery.value.trim()
        const photosObj = await getPhotos(request, pageCount)

        if (photosObj.hits.length === 0) {
            cleanData()
            throw new Error("Sorry, there are no images matching your search query. Please try again.");
        }
        createList(photosObj.hits)
        Notiflix.Notify.info(`Hooray! We found ${photosObj.totalHits} images.`);

        if (photosObj.totalHits > photosPerPage) {
            refs.loadMoreBtn.style.display = "block"
            refs.loadMoreBtn.addEventListener('click', updateGallery)
        }
    }
        catch(error) {
                Notiflix.Notify.failure(error.message)
            }
        
    pageCount += 1
}

async function updateGallery() {
    let request = refs.input.value
    const photosObj = await getPhotos(request, pageCount)
    let pages = Math.ceil(photosObj.totalHits / photosPerPage)
    if (pageCount === pages) {
        createList(photosObj.hits)
        Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
        refs.loadMoreBtn.style.display = "none"
        return
    }
    createList(photosObj.hits)
    pageCount += 1
}

async function getPhotos(request, pageCount) {
    const result = await axios.get(
		`${BASE_URL}?key=${API_KEY}&q=${request}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${photosPerPage}&page=${pageCount}`
	)
      return result.data
     }

function createList(photosObj) {
    const photos = photosObj.reduce((acc, photo) => acc +
        `<div class="photo-card">
           <a href="${photo.largeImageURL}"><img src="${photo.webformatURL}" alt="${photo.tags}" width = "300" loading="lazy" /></a>
           <div class="info">
              <p class="info-item">
              <b>Likes:  </b>${photo.likes}
              </p>
              <p class="info-item">
              <b>Views:  </b>${photo.views}
              </p>
              <p class="info-item">
              <b>Comments:  </b>${photo.comments}
              </p>
              <p class="info-item">
              <b>Downloads:  </b>${photo.downloads}
             </p>
            </div>
        </div>`, '')
    refs.gallery.insertAdjacentHTML('beforeend', photos)
    lightbox.refresh()
}

function cleanData() {
    refs.gallery.innerHTML = ""
    refs.loadMoreBtn.style.display = "none"
    pageCount = 1
}
