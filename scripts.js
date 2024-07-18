document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-term');
    const gridViewButton = document.getElementById('grid-view');
    const listViewButton = document.getElementById('list-view');
    const resultsContainer = document.getElementById('results');
    const bookDetailsContainer = document.getElementById('book-details');
    const paginationContainer = document.getElementById('pagination');

    let currentView = 'grid';
    let currentPage = 1;

    const searchTemplate = `
        {{#books}}
        <div class="book-item {{viewClass}}" data-id="{{id}}">
            <img src="{{image}}" alt="{{title}}">
            <h3>{{title}}</h3>
            <p>{{author}}</p>
        </div>
        {{/books}}
    `;

    const bookDetailsTemplate = `
        <h2>{{title}}</h2>
        <img src="{{image}}" alt="{{title}}">
        <p><strong>Author:</strong> {{author}}</p>
        <p><strong>Published Date:</strong> {{publishedDate}}</p>
        <p><strong>Publisher:</strong> {{publisher}}</p>
        <p><strong>Description:</strong> {{description}}</p>
        <button id="back-button">Back to Results</button>
    `;

    searchButton.addEventListener('click', () => {
        const query = searchInput.value;
        fetchBooks(query, currentPage);
    });

    gridViewButton.addEventListener('click', () => {
        currentView = 'grid';
        resultsContainer.classList.remove('list-view');
        resultsContainer.classList.add('grid-view');
    });

    listViewButton.addEventListener('click', () => {
        currentView = 'list';
        resultsContainer.classList.remove('grid-view');
        resultsContainer.classList.add('list-view');
    });

    resultsContainer.addEventListener('click', (event) => {
        if (event.target.closest('.book-item')) {
            const bookId = event.target.closest('.book-item').getAttribute('data-id');
            fetchBookDetails(bookId);
        }
    });

    bookDetailsContainer.addEventListener('click', (event) => {
        if (event.target.id === 'back-button') {
            bookDetailsContainer.classList.add('hidden');
            resultsContainer.classList.remove('hidden');
            paginationContainer.classList.remove('hidden');
        }
    });

    function fetchBooks(query, page) {
        fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const books = data.items.map(book => ({
                    id: book.id,
                    title: book.volumeInfo.title,
                    author: book.volumeInfo.authors.join(', '),
                    image: book.volumeInfo.imageLinks.thumbnail,
                    viewClass: currentView
                }));
                const rendered = Mustache.render(searchTemplate, { books });
                resultsContainer.innerHTML = rendered;
                resultsContainer.classList.add(currentView + '-view');
                setupPagination(data.totalItems, data.itemsPerPage);
            });
    }

    function fetchBookDetails(bookId) {
        fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
            .then(response => response.json())
            .then(book => {
                const bookDetails = {
                    title: book.volumeInfo.title,
                    author: book.volumeInfo.authors.join(', '),
                    publishedDate: book.volumeInfo.publishedDate,
                    publisher: book.volumeInfo.publisher,
                    description: book.volumeInfo.description,
                    image: book.volumeInfo.imageLinks.thumbnail
                };
                const rendered = Mustache.render(bookDetailsTemplate, bookDetails);
                bookDetailsContainer.innerHTML = rendered;
                bookDetailsContainer.classList.remove('hidden');
                resultsContainer.classList.add('hidden');
                paginationContainer.classList.add('hidden');
            });
    }
    function setupPagination(totalItems, itemsPerPage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                const query = searchInput.value;
                fetchBooks(query, currentPage);
            });
            paginationContainer.appendChild(pageButton);
        }
    }
});