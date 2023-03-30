const filterDiagnosticListInput = document.getElementById('filter-diagnostic-list-input');

filterDiagnosticListInput.onkeyup = function () {
    const keyword = filterDiagnosticListInput.value.toLowerCase();
    let elements = document.querySelectorAll('.project-list-item');
    elements = Array.from(elements);

    elements.map((element) => {
        const name = element.querySelector('.project-list-item-key').dataset.key.toLowerCase();
        if (name.indexOf(keyword) != -1) {
            element.removeAttribute('hidden');
        }
        else {
            element.setAttribute('hidden', true);
        }
    })
}