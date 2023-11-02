const buttons = document.querySelectorAll('.fr-callout-read-more__btn');

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const excerpt = button.parentNode.querySelector('.fr-callout-read-more__excerpt');
        const text = button.parentNode.querySelector('.fr-callout-read-more__text');

        let expanded = button.getAttribute("aria-expanded") === "true";

        button.parentNode.classList.toggle("fr-callout-read-more--expanded")
        button.setAttribute("aria-expanded", !expanded);
        excerpt.hidden = !expanded;
        text.hidden = expanded;
        button.firstChild.data = expanded ? 'Lire plus' : 'Lire moins';
    });
});
