const filterDiagnosticListInput = document.getElementById('filter-diagnostic-list-input');

if (filterDiagnosticListInput) {
    filterDiagnosticListInput.onkeyup = function () {
        const keyword = filterDiagnosticListInput.value.toLowerCase();
        let elements = document.querySelectorAll('.diagnostic-list-item');
        elements = Array.from(elements);
    
        elements.map((element) => {
            const name = element.querySelector('.diagnostic-list-item-key').dataset.key.toLowerCase();
            if (name.indexOf(keyword) != -1) {
                element.removeAttribute('hidden');
                element.style.visibility = 'visible';
            }
            else {
                element.setAttribute('hidden', true);
                element.style.visibility = 'hidden';
            }
        });
    
        // Get hidden elements count
        const emptyMessage = document.getElementById('diagnostic-list-empty-message');
        if (elements.length === elements.filter((obj) => obj.hidden).length) {
            emptyMessage.removeAttribute('hidden');
            emptyMessage.style.visibility = 'visible';
        }
        else {
            emptyMessage.setAttribute('hidden', true);
            emptyMessage.style.visibility = 'hidden';
        }
    };
}
