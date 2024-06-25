fetch("google-books-search.json")
.then(function(response){
    return response.json();
})
.then(function(books){
    let placeholder = document.querySelector("data-output");
    let out = " ";
    for (let book of books){
        out += 
            <tr>
                <td>${book.title}</td>
                <td>${book.description}</td>
            </tr>
    }
    placeholder.innerHTML = out;
})