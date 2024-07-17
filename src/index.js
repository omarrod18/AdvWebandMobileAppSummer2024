import $ from 'jquery';
import Mustache from 'mustache';

const apiKey = 'AIzaSyA8NwX-B4DcmwSQueTy_lp92EV5QBNBLR4';
let currentPage = 1;
let totalPages = 0;
let searchTerm = '';
let viewMode = 'grid'; // Default view mode

$(document).ready(function () {
  console.log("Document is ready");
  $('#search-button').click(function () {
    searchTerm = $('#search-term').val();
    console.log(`Search term: ${searchTerm}`);
    currentPage = 1;
    searchBooks();
  });

  $('#view-toggle').click(function () {
    viewMode = viewMode === 'grid' ? 'list' : 'grid';
    $('#results-container').toggleClass('results-grid results-list');
    searchBooks();
  });

  fetchTopSellingBooks();
});

function searchBooks() {
  console.log(`Searching books for term: ${searchTerm}`);
  $.ajax({
    url: `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&startIndex=${(currentPage - 1) * 10}&maxResults=10&key=${apiKey}`,
    type: 'GET',
    success: function (data) {
      console.log('Search results:', data);
      displayResults(data);
    },
    error: function (error) {
      console.error('Error fetching search results:', error);
    }
  });
}

function displayResults(data) {
  const template = document.getElementById('search-results-template').innerHTML;
  const books = data.items.map(item => ({
    id: item.id,
    thumbnail: item.volumeInfo.imageLinks?.thumbnail || '',
    title: item.volumeInfo.title
  }));
  console.log('Books to render:', books); // Debugging output
  const rendered = Mustache.render(template, { books });
  $('#results-container').html(rendered);

  totalPages = Math.ceil(data.totalItems / 10);
  updatePagination();
  
  $('.book-item').click(function () {
    const bookId = $(this).data('id');
    displayBookDetails(bookId);
  });
}

function updatePagination() {
  $('.pagination').empty();
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = `<button class="${i === currentPage ? 'active' : ''}" onclick="gotoPage(${i})">${i}</button>`;
    $('.pagination').append(pageButton);
  }
}

function gotoPage(page) {
  currentPage = page;
  searchBooks();
}

function displayBookDetails(bookId) {
  console.log(`Displaying details for book ID: ${bookId}`);
  $.ajax({
    url: `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${apiKey}`,
    type: 'GET',
    success: function (data) {
      console.log('Book details:', data);
      const template = document.getElementById('book-details-template').innerHTML;
      const book = {
        title: data.volumeInfo.title,
        description: data.volumeInfo.description || 'No description available',
        thumbnail: data.volumeInfo.imageLinks?.thumbnail || '',
        authors: data.volumeInfo.authors?.join(', ') || 'Unknown',
        publishedDate: data.volumeInfo.publishedDate || 'Unknown'
      };
      const rendered = Mustache.render(template, book);
      $('#book-details').html(rendered).show();
    },
    error: function (error) {
      console.error('Error fetching book details:', error);
    }
  });
}

function fetchTopSellingBooks() {
  console.log("Fetching top selling books");
  $.ajax({
    url: `https://www.googleapis.com/books/v1/volumes?q=best+sellers&maxResults=10&key=${apiKey}`,
    type: 'GET',
    success: function (data) {
      console.log('Top selling books:', data);
      const template = document.getElementById('search-results-template').innerHTML;
      const books = data.items.map(item => ({
        id: item.id,
        thumbnail: item.volumeInfo.imageLinks?.thumbnail || '',
        title: item.volumeInfo.title
      }));
      console.log('Top selling books to render:', books); // Debugging output
      const rendered = Mustache.render(template, { books });
      $('#top-selling-books').html(rendered);
    },
    error: function (error) {
      console.error('Error fetching top selling books:', error);
    }
  });
}
