import Datepicker from 'vanillajs-datepicker/Datepicker';

const startInput = document.querySelector('input[name="start"]');
new Datepicker(startInput, {
    pickLevel: 2,
    format: 'yyyy'
});

const endInput = document.querySelector('input[name="end"]');
new Datepicker(endInput, {
    pickLevel: 2,
    format: 'yyyy'
}); 